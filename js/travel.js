// Rule-based travel recommendations. Pure functions (no DOM) so they are easy to test.
// A "day" is { max, min, code, precipProb, wind, uv } with temperatures in °C.
import { describeCode } from "./weatherCodes.js";

export const RATINGS = [
  { min: 80, label: "Great", tone: "great" },
  { min: 60, label: "Good", tone: "good" },
  { min: 40, label: "Fair", tone: "fair" },
  { min: 0, label: "Poor", tone: "poor" },
];

export function scoreDay(day) {
  const { kind } = describeCode(day.code);
  const avg = (day.max + day.min) / 2;
  let score = 100;

  // temperature comfort: ideal 18-28 °C
  if (avg < 18) score -= Math.min(40, (18 - avg) * 3);
  if (avg > 28) score -= Math.min(45, (avg - 28) * 5);
  if (day.max > 38) score -= 15;

  // precipitation and sky
  score -= Math.round(day.precipProb * 0.35);
  if (kind === "rain" || kind === "drizzle") score -= 15;
  if (kind === "snow") score -= 25;
  if (kind === "fog") score -= 15;
  if (kind === "storm") score -= 45;

  // wind and UV
  if (day.wind > 30) score -= Math.min(25, (day.wind - 30) * 0.8);
  if (day.uv >= 8) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export const ratingFor = (score) => RATINGS.find((r) => score >= r.min);

export function bestDay(days) {
  return days.reduce((best, day, index) => {
    const score = scoreDay(day);
    return score > best.score ? { index, score } : best;
  }, { index: 0, score: -1 });
}

export function getTravelAdvice(day) {
  const { kind } = describeCode(day.code);
  const score = scoreDay(day);
  const avg = (day.max + day.min) / 2;
  const wet = day.precipProb >= 50 || ["rain", "drizzle", "storm"].includes(kind);
  const hot = day.max >= 33;
  const cold = day.max <= 12;
  const windy = day.wind >= 35;

  const activities = [];
  const pack = [];
  const tips = [];

  if (kind === "storm") {
    activities.push("Museums, galleries and indoor attractions", "Cafés and food halls", "A relaxed spa or cinema day");
    tips.push("Thunderstorms are expected. Avoid open areas, beaches and hilltops, and check for travel delays.");
  } else if (kind === "snow") {
    activities.push("Snow walks and photography", "Skiing or sledging where available", "Hot drinks and cosy cafés");
    tips.push("Roads and pavements may be slippery. Allow extra travel time.");
  } else if (kind === "fog") {
    activities.push("Indoor sightseeing and markets", "Short local walks", "Food tours");
    tips.push("Visibility is low. Postpone viewpoints and scenic drives until it clears.");
  } else if (wet) {
    activities.push("Museums and heritage sites", "Covered markets and shopping", "Local food and café trails");
    tips.push("Carry a flexible plan. Keep outdoor stops short and near shelter.");
  } else if (hot) {
    activities.push("Beaches, pools or water parks", "Early-morning sightseeing before 10 AM", "Air-conditioned museums in the afternoon");
    tips.push("Plan outdoor activities for early morning or evening and take regular water breaks.");
  } else if (cold) {
    activities.push("Indoor attractions and museums", "Short scenic walks in the warmest hours", "Hot springs, cafés or local food spots");
  } else if (score >= 80) {
    activities.push("Hiking or nature trails", "Walking tours and sightseeing", "Cycling, picnics and outdoor markets");
  } else {
    activities.push("Walking tours with indoor breaks", "Local markets and food streets", "Short outdoor attractions");
  }

  if (wet) pack.push("Compact umbrella or rain jacket", "Waterproof shoes");
  if (cold) pack.push("Warm jacket", "Gloves and a hat");
  else if (avg < 18) pack.push("Light jacket or sweater");
  if (hot) pack.push("Light, breathable clothing", "Reusable water bottle");
  if (day.uv >= 6) pack.push("Sunscreen and sunglasses");
  if (kind === "snow") pack.push("Waterproof boots", "Thermal layers");
  if (windy) pack.push("Windproof layer");
  if (!pack.length) pack.push("Comfortable walking shoes", "Light layers");

  if (windy && kind !== "storm") tips.push("Strong winds are likely. Be careful near coasts, cliffs and boats.");
  if (day.uv >= 8) tips.push("UV is very high. Wear sun protection and seek shade around midday.");
  if (!tips.length) tips.push(score >= 80 ? "Conditions are excellent. A good day to travel and explore." : "Conditions are fine for most plans. Check the forecast again before you leave.");

  const rating = ratingFor(score);
  const headline = {
    great: "A great day to be out and about",
    good: "A good day for most plans",
    fair: "Doable, with a backup plan",
    poor: "Better to plan indoor activities",
  }[rating.tone];

  return { score, rating, headline, activities, pack: [...new Set(pack)], tips };
}
