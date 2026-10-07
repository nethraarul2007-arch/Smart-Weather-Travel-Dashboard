// Open-Meteo returns WMO weather codes. This maps each code to a label and an icon "kind".
const CODES = {
  0: ["Clear sky", "clear"], 1: ["Mostly clear", "clear"], 2: ["Partly cloudy", "partly"], 3: ["Overcast", "cloudy"],
  45: ["Fog", "fog"], 48: ["Freezing fog", "fog"],
  51: ["Light drizzle", "drizzle"], 53: ["Drizzle", "drizzle"], 55: ["Heavy drizzle", "drizzle"],
  56: ["Freezing drizzle", "drizzle"], 57: ["Freezing drizzle", "drizzle"],
  61: ["Light rain", "rain"], 63: ["Rain", "rain"], 65: ["Heavy rain", "rain"],
  66: ["Freezing rain", "rain"], 67: ["Freezing rain", "rain"],
  71: ["Light snow", "snow"], 73: ["Snow", "snow"], 75: ["Heavy snow", "snow"], 77: ["Snow grains", "snow"],
  80: ["Light showers", "rain"], 81: ["Showers", "rain"], 82: ["Heavy showers", "rain"],
  85: ["Snow showers", "snow"], 86: ["Heavy snow showers", "snow"],
  95: ["Thunderstorm", "storm"], 96: ["Thunderstorm with hail", "storm"], 99: ["Thunderstorm with hail", "storm"],
};

export const describeCode = (code) => {
  const [label, kind] = CODES[code] ?? ["Unknown conditions", "cloudy"];
  return { label, kind };
};

// The page background changes with the weather: returns a value for body[data-theme].
export const themeFor = (kind, isDay) => {
  if (kind === "clear" || kind === "partly") return isDay ? "sunny" : "night";
  if (kind === "drizzle") return "rain";
  return kind; // cloudy, fog, rain, snow, storm
};
