// Rendering only: these functions turn data into DOM. They never call the API.
import { describeCode } from "./weatherCodes.js";
import { iconSvg } from "./icons.js";
import { formatTemp, formatWind, weekday, shortDate, hourLabel, clockLabel } from "./utils.js";
import { scoreDay, ratingFor, getTravelAdvice, bestDay } from "./travel.js";

const $ = (sel) => document.querySelector(sel);

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value; // only used for our own static SVG icons
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  }
  node.append(...[].concat(children));
  return node;
}

const placeName = (p) => [p.name, p.region, p.country].filter(Boolean).join(", ");
const icon = (code, isDay) => {
  const { label, kind } = describeCode(code);
  return iconSvg(kind, isDay, label);
};

/* ---------- status line ---------- */
export function showLoading(message = "Fetching the latest weather") {
  $("#status").replaceChildren(el("div", { class: "notice notice--loading" }, [el("span", {}, [el("span", { class: "spinner", "aria-hidden": "true" }), message + "…"])]));
}
export function showError(message, onRetry) {
  const children = [el("span", { text: message })];
  if (onRetry) children.push(el("button", { class: "btn", type: "button", text: "Try again", onclick: onRetry }));
  $("#status").replaceChildren(el("div", { class: "notice notice--error", role: "alert" }, children));
}
export const clearStatus = () => $("#status").replaceChildren();

/* ---------- search suggestions ---------- */
export function renderSuggestions(results, activeIndex, onPick, message = "") {
  const list = $("#suggestions");
  const input = $("#city");
  list.replaceChildren();
  if (message) {
    list.append(el("li", { class: "note", role: "presentation", text: message }));
  } else {
    results.forEach((place, i) =>
      list.append(
        el("li", {
          role: "option", id: `opt-${i}`, "aria-selected": String(i === activeIndex),
          onmousedown: (e) => { e.preventDefault(); onPick(place); }, // mousedown fires before the input loses focus
        }, [placeName({ name: place.name }), el("small", { text: [place.region, place.country].filter(Boolean).join(", ") })])
      )
    );
  }
  const open = results.length > 0 || Boolean(message);
  list.classList.toggle("hidden", !open);
  input.setAttribute("aria-expanded", String(open));
  if (activeIndex >= 0) input.setAttribute("aria-activedescendant", `opt-${activeIndex}`);
  else input.removeAttribute("aria-activedescendant");
}

export function renderChips(container, places, onPick) {
  container.replaceChildren(...places.map((p) => el("button", { type: "button", class: "chip", text: p.name, onclick: () => onPick(p) })));
}

/* ---------- dashboard ---------- */
export function renderCurrent(place, weather, unit) {
  const { current, days } = weather;
  const today = days[0];
  const { label } = describeCode(current.code);
  const fact = (name, value) => el("div", {}, [el("dt", { text: name }), el("dd", { text: value })]);

  $("#current").replaceChildren(
    el("div", {}, [
      el("h2", { text: placeName(place) }),
      el("p", { class: "place", text: `Local time ${clockLabel(current.time)}, ${weekday(today.date, "long")} ${shortDate(today.date)}` }),
    ]),
    el("div", { class: "now" }, [
      el("div", { html: icon(current.code, current.isDay) }),
      el("div", {}, [
        el("div", { class: "temp", text: formatTemp(current.temp, unit) }),
        el("div", { class: "cond", text: label }),
        el("div", { class: "place", text: `Feels like ${formatTemp(current.feels, unit)} · High ${formatTemp(today.max, unit)} · Low ${formatTemp(today.min, unit)}` }),
      ]),
    ]),
    el("dl", { class: "facts" }, [
      fact("Humidity", `${Math.round(current.humidity)}%`),
      fact("Wind", formatWind(current.wind, unit)),
      fact("Rain chance today", `${today.precipProb}%`),
      fact("UV index (max)", String(Math.round(today.uv))),
      fact("Sunrise", clockLabel(today.sunrise)),
      fact("Sunset", clockLabel(today.sunset)),
    ])
  );
}

export function renderTravel(weather, selected, unit) {
  const day = weather.days[selected];
  const advice = getTravelAdvice(day);
  const when = selected === 0 ? "today" : weekday(day.date, "long");
  const list = (items) => el("ul", {}, items.map((t) => el("li", { text: t })));

  $("#travel").replaceChildren(
    el("h2", { text: `Travel ideas for ${when}` }),
    el("span", { class: `badge badge--${advice.rating.tone}`, text: `${advice.rating.label} · ${advice.score}/100` }),
    el("p", { class: "headline", text: advice.headline }),
    el("p", { class: "hint", text: `${describeCode(day.code).label}, ${formatTemp(day.min, unit)} to ${formatTemp(day.max, unit)}, ${day.precipProb}% chance of rain` }),
    el("div", { class: "cols" }, [
      el("div", {}, [el("h3", { text: "Things to do" }), list(advice.activities)]),
      el("div", {}, [el("h3", { text: "What to pack" }), list(advice.pack)]),
      el("div", {}, [el("h3", { text: "Good to know" }), list(advice.tips)]),
    ])
  );
}

export function renderHourly(hours, unit) {
  $("#hourly").replaceChildren(
    ...hours.map((h, i) =>
      el("div", { class: "hour" }, [
        el("small", { text: i === 0 ? "Now" : hourLabel(h.time) }),
        el("div", { html: icon(h.code, h.isDay) }),
        el("strong", { text: formatTemp(h.temp, unit) }),
        el("small", { text: `${h.precipProb}%` }),
      ])
    )
  );
}

export function renderForecast(days, selected, unit, onSelect) {
  const best = bestDay(days);
  const bestName = best.index === 0 ? "today" : weekday(days[best.index].date, "long");
  $("#best-day").textContent = `Best day to be outdoors: ${bestName} (${ratingFor(best.score).label}, ${best.score}/100). Select a day to see its travel ideas.`;

  $("#forecast").replaceChildren(
    ...days.map((d, i) => {
      const rating = ratingFor(scoreDay(d));
      return el("button", {
        type: "button", class: "day", "aria-pressed": String(i === selected),
        "aria-label": `${weekday(d.date, "long")}, ${describeCode(d.code).label}, high ${formatTemp(d.max, unit)}, low ${formatTemp(d.min, unit)}, travel rating ${rating.label}`,
        onclick: () => onSelect(i),
      }, [
        el("strong", { text: i === 0 ? "Today" : weekday(d.date) }),
        el("small", { text: shortDate(d.date) }),
        el("div", { html: icon(d.code, true) }),
        el("span", { text: `${formatTemp(d.max, unit)} / ${formatTemp(d.min, unit)}` }),
        el("small", { text: `${d.precipProb}% rain` }),
        el("span", { class: `badge badge--${rating.tone}`, text: rating.label }),
      ]);
    })
  );
}
