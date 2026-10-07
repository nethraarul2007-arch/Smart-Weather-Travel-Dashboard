// All network code lives here. Open-Meteo needs no API key.
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export class ApiError extends Error {
  constructor(message, { status, cancelled = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.cancelled = cancelled;
  }
}

// fetch + timeout + friendly errors. An outside AbortSignal lets callers cancel stale requests.
async function getJson(url, { signal, timeout = 10000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const forward = () => controller.abort();
  signal?.addEventListener("abort", forward);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new ApiError(`The weather service returned an error (${res.status}). Try again in a moment.`, { status: res.status });
    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") {
      if (signal?.aborted) throw new ApiError("Request cancelled.", { cancelled: true });
      throw new ApiError("The weather service took too long to respond. Try again.");
    }
    throw new ApiError("Could not reach the weather service. Check your internet connection.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forward);
  }
}

export async function searchCities(name, opts) {
  const query = name.trim();
  if (query.length < 2) return [];
  const params = new URLSearchParams({ name: query, count: "6", language: "en", format: "json" });
  const data = await getJson(`${GEO_URL}?${params}`, opts);
  return (data.results ?? []).map(({ id, name, admin1, country, latitude, longitude, timezone }) => ({
    id, name, region: admin1 ?? "", country: country ?? "", latitude, longitude, timezone,
  }));
}

export async function getWeather({ latitude, longitude }, opts) {
  const params = new URLSearchParams({
    latitude, longitude, timezone: "auto", forecast_days: "7",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,precipitation_probability,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,wind_speed_10m_max,sunrise,sunset",
  });
  const data = await getJson(`${FORECAST_URL}?${params}`, opts);
  return normalizeWeather(data);
}

// Turns Open-Meteo's column-style arrays into objects the UI can loop over. Temperatures stay in °C.
export function normalizeWeather(data) {
  const { current, hourly, daily } = data;
  if (!current || !hourly || !daily) throw new ApiError("The weather service sent incomplete data. Try again.");

  const startIndex = Math.max(0, hourly.time.findIndex((t) => t.slice(0, 13) >= current.time.slice(0, 13)));
  const hours = hourly.time.slice(startIndex, startIndex + 24).map((time, i) => {
    const j = startIndex + i;
    return {
      time,
      temp: hourly.temperature_2m[j],
      code: hourly.weather_code[j],
      precipProb: hourly.precipitation_probability[j] ?? 0,
      isDay: hourly.is_day[j] === 1,
    };
  });

  const days = daily.time.map((date, i) => ({
    date,
    code: daily.weather_code[i],
    max: daily.temperature_2m_max[i],
    min: daily.temperature_2m_min[i],
    precipProb: daily.precipitation_probability_max[i] ?? 0,
    precipSum: daily.precipitation_sum[i] ?? 0,
    uv: daily.uv_index_max[i] ?? 0,
    wind: daily.wind_speed_10m_max[i] ?? 0,
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
  }));

  return {
    current: {
      time: current.time,
      temp: current.temperature_2m,
      feels: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      precip: current.precipitation,
      code: current.weather_code,
      isDay: current.is_day === 1,
    },
    hours,
    days,
  };
}
