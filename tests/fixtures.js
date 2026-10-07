// A small Open-Meteo style response used by the tests (no network needed).
const hours = Array.from({ length: 48 }, (_, i) => `2026-10-07T${String(i % 24).padStart(2, "0")}:00`.replace(/^2026-10-07/, i < 24 ? "2026-10-07" : "2026-10-08"));
export const forecastResponse = {
  current: { time: "2026-10-07T14:15", temperature_2m: 31.4, relative_humidity_2m: 62, apparent_temperature: 36, is_day: 1, precipitation: 0, weather_code: 2, wind_speed_10m: 14 },
  hourly: {
    time: hours,
    temperature_2m: hours.map((_, i) => 24 + (i % 24) / 3),
    weather_code: hours.map(() => 2),
    precipitation_probability: hours.map(() => 10),
    is_day: hours.map((_, i) => (i % 24 >= 6 && i % 24 < 18 ? 1 : 0)),
  },
  daily: {
    time: ["2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13"],
    weather_code: [2, 61, 95, 3, 0, 1, 80],
    temperature_2m_max: [33, 29, 31, 30, 32, 33, 28],
    temperature_2m_min: [26, 25, 25, 25, 26, 26, 24],
    precipitation_probability_max: [10, 70, 90, 30, 5, 5, 60],
    precipitation_sum: [0, 8, 20, 1, 0, 0, 6],
    uv_index_max: [8, 5, 6, 6, 9, 9, 5],
    wind_speed_10m_max: [18, 22, 40, 20, 15, 14, 25],
    sunrise: ["2026-10-07T06:02", "2026-10-08T06:02", "2026-10-09T06:03", "2026-10-10T06:03", "2026-10-11T06:03", "2026-10-12T06:04", "2026-10-13T06:04"],
    sunset: ["2026-10-07T17:55", "2026-10-08T17:54", "2026-10-09T17:54", "2026-10-10T17:53", "2026-10-11T17:52", "2026-10-12T17:52", "2026-10-13T17:51"],
  },
};
export const geoResponse = { results: [{ id: 1264527, name: "Chennai", admin1: "Tamil Nadu", country: "India", latitude: 13.08, longitude: 80.27, timezone: "Asia/Kolkata" }] };
