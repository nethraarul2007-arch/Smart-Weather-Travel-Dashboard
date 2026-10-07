import test from "node:test";
import assert from "node:assert/strict";
import { describeCode, themeFor } from "../js/weatherCodes.js";
import { scoreDay, ratingFor, bestDay, getTravelAdvice } from "../js/travel.js";
import { cToF, formatTemp, debounce, hourLabel } from "../js/utils.js";
import { normalizeWeather, searchCities, getWeather, ApiError } from "../js/api.js";
import { forecastResponse, geoResponse } from "./fixtures.js";

const mockFetch = (body, { ok = true, status = 200 } = {}) => {
  globalThis.fetch = async () => ({ ok, status, json: async () => body });
};

test("weather codes map to labels and kinds", () => {
  assert.deepEqual(describeCode(0), { label: "Clear sky", kind: "clear" });
  assert.equal(describeCode(95).kind, "storm");
  assert.equal(describeCode(12345).label, "Unknown conditions");
  assert.equal(themeFor("clear", false), "night");
  assert.equal(themeFor("drizzle", true), "rain");
});

test("unit helpers", () => {
  assert.equal(cToF(0), 32);
  assert.equal(formatTemp(30, "c"), "30°");
  assert.equal(formatTemp(30, "f"), "86°");
  assert.equal(hourLabel("2026-10-07T00:00"), "12 AM");
  assert.equal(hourLabel("2026-10-07T15:00"), "3 PM");
});

test("pleasant weather scores high and a storm scores low", () => {
  const nice = { max: 27, min: 21, code: 1, precipProb: 5, wind: 12, uv: 6 };
  const storm = { max: 31, min: 25, code: 95, precipProb: 90, wind: 40, uv: 6 };
  assert.ok(scoreDay(nice) >= 80);
  assert.ok(scoreDay(storm) < 40);
  assert.equal(ratingFor(scoreDay(nice)).label, "Great");
});

test("best day picks the highest score", () => {
  const days = [
    { max: 30, min: 24, code: 61, precipProb: 80, wind: 20, uv: 5 },
    { max: 26, min: 20, code: 0, precipProb: 0, wind: 10, uv: 5 },
  ];
  assert.equal(bestDay(days).index, 1);
});

test("advice changes with conditions", () => {
  const rainy = getTravelAdvice({ max: 24, min: 20, code: 63, precipProb: 85, wind: 15, uv: 2 });
  assert.ok(rainy.pack.some((p) => /umbrella/i.test(p)));
  assert.ok(rainy.activities.some((a) => /museum/i.test(a)));
  const hot = getTravelAdvice({ max: 38, min: 28, code: 0, precipProb: 0, wind: 10, uv: 9 });
  assert.ok(hot.pack.some((p) => /sunscreen/i.test(p)));
  assert.ok(hot.tips.some((t) => /UV|water/i.test(t)));
});

test("normalizeWeather reshapes the API response", () => {
  const w = normalizeWeather(forecastResponse);
  assert.equal(w.current.temp, 31.4);
  assert.equal(w.current.isDay, true);
  assert.equal(w.days.length, 7);
  assert.equal(w.hours.length, 24);
  assert.equal(w.hours[0].time, "2026-10-07T14:00"); // starts at the current hour
  assert.throws(() => normalizeWeather({}), ApiError);
});

test("searchCities and getWeather use fetch and return clean objects", async () => {
  mockFetch(geoResponse);
  const [city] = await searchCities("Chennai");
  assert.equal(city.name, "Chennai");
  assert.equal(city.region, "Tamil Nadu");
  assert.deepEqual(await searchCities("a"), []); // too short: no request

  mockFetch(forecastResponse);
  const w = await getWeather({ latitude: 13.08, longitude: 80.27 });
  assert.equal(w.days[2].code, 95);
});

test("network and HTTP failures become friendly ApiErrors", async () => {
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  await assert.rejects(() => getWeather({ latitude: 1, longitude: 1 }), /Could not reach/);
  mockFetch({}, { ok: false, status: 500 });
  await assert.rejects(() => getWeather({ latitude: 1, longitude: 1 }), /error \(500\)/);
});

test("a cancelled request is flagged so the UI can ignore it", async () => {
  globalThis.fetch = (url, { signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }))));
  const controller = new AbortController();
  const pending = getWeather({ latitude: 1, longitude: 1 }, { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, (err) => err.cancelled === true);
});

test("debounce only fires once for rapid calls", async () => {
  let calls = 0;
  const fn = debounce(() => calls++, 20);
  fn(); fn(); fn();
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(calls, 1);
});
