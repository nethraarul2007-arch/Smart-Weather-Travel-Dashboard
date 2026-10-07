export const cToF = (c) => (c * 9) / 5 + 32;
export const kmhToMph = (k) => k * 0.621371;

export const formatTemp = (celsius, unit) => `${Math.round(unit === "f" ? cToF(celsius) : celsius)}°`;
export const formatWind = (kmh, unit) => (unit === "f" ? `${Math.round(kmhToMph(kmh))} mph` : `${Math.round(kmh)} km/h`);

export const debounce = (fn, wait = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
};

// Dates from the API are already in the city's local time, so we format them without converting time zones.
export const weekday = (isoDate, style = "short") =>
  new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", { weekday: style });
export const shortDate = (isoDate) =>
  new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const hourLabel = (isoTime) => {
  const h = Number(isoTime.slice(11, 13));
  return `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
};
export const clockLabel = (isoTime) => {
  const [h, m] = isoTime.slice(11, 16).split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
