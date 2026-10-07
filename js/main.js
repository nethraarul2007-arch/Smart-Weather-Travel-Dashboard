import { searchCities, getWeather } from "./api.js";
import { describeCode, themeFor } from "./weatherCodes.js";
import { debounce } from "./utils.js";
import { getUnit, setUnit, getLastPlace, setLastPlace, getRecent, addRecent } from "./storage.js";
import {
  showLoading, showError, clearStatus, renderSuggestions, renderChips,
  renderCurrent, renderTravel, renderHourly, renderForecast,
} from "./ui.js";

const $ = (sel) => document.querySelector(sel);

const QUICK_PICKS = [
  { id: "q-chennai", name: "Chennai", region: "Tamil Nadu", country: "India", latitude: 13.0878, longitude: 80.2785 },
  { id: "q-mumbai", name: "Mumbai", region: "Maharashtra", country: "India", latitude: 19.0144, longitude: 72.8479 },
  { id: "q-delhi", name: "Delhi", region: "Delhi", country: "India", latitude: 28.6519, longitude: 77.2315 },
  { id: "q-london", name: "London", region: "England", country: "United Kingdom", latitude: 51.5085, longitude: -0.1257 },
  { id: "q-tokyo", name: "Tokyo", region: "Tokyo", country: "Japan", latitude: 35.6895, longitude: 139.6917 },
  { id: "q-newyork", name: "New York", region: "New York", country: "United States", latitude: 40.7143, longitude: -74.006 },
];

const state = {
  place: null,
  weather: null,
  unit: getUnit(),
  selected: 0,
  suggestions: [],
  active: -1,
  weatherRequest: null,
  searchRequest: null,
};

/* ---------- weather loading ---------- */
async function loadPlace(place) {
  state.weatherRequest?.abort(); // a newer search replaces any request still in flight
  const controller = new AbortController();
  state.weatherRequest = controller;
  closeSuggestions();
  $("#city").value = place.name;
  showLoading(`Fetching weather for ${place.name}`);

  try {
    const weather = await getWeather(place, { signal: controller.signal });
    Object.assign(state, { place, weather, selected: 0 });
    setLastPlace(place);
    renderChips($("#recents"), addRecent(place), loadPlace);
    clearStatus();
    $("#welcome").classList.add("hidden");
    $("#dashboard").classList.remove("hidden");
    renderAll();
  } catch (err) {
    if (err.cancelled) return;
    showError(err.message, () => loadPlace(place));
  }
}

function renderAll() {
  const { place, weather, unit } = state;
  const { code, isDay } = weather.current;
  document.body.dataset.theme = themeFor(describeCode(code).kind, isDay);
  document.title = `${place.name} weather | Smart Weather & Travel Dashboard`;
  renderCurrent(place, weather, unit);
  renderHourly(weather.hours, unit);
  renderDay();
}

function renderDay() {
  renderForecast(state.weather.days, state.selected, state.unit, selectDay);
  renderTravel(state.weather, state.selected, state.unit);
}

function selectDay(index) {
  state.selected = index;
  renderDay();
}

/* ---------- search box ---------- */
function closeSuggestions() {
  state.suggestions = [];
  state.active = -1;
  renderSuggestions([], -1, loadPlace);
}

async function runSearch(text) {
  state.searchRequest?.abort();
  if (text.trim().length < 2) return closeSuggestions();
  const controller = new AbortController();
  state.searchRequest = controller;
  try {
    const results = await searchCities(text, { signal: controller.signal });
    state.suggestions = results;
    state.active = results.length ? 0 : -1;
    renderSuggestions(results, state.active, loadPlace, results.length ? "" : `No cities found for "${text.trim()}". Check the spelling.`);
  } catch (err) {
    if (err.cancelled) return;
    renderSuggestions([], -1, loadPlace, err.message);
  }
  return state.suggestions;
}

const debouncedSearch = debounce(runSearch, 350);

function setupSearch() {
  const input = $("#city");
  input.addEventListener("input", () => debouncedSearch(input.value));
  input.addEventListener("keydown", (e) => {
    const count = state.suggestions.length;
    if (e.key === "ArrowDown" && count) { e.preventDefault(); state.active = (state.active + 1) % count; }
    else if (e.key === "ArrowUp" && count) { e.preventDefault(); state.active = (state.active - 1 + count) % count; }
    else if (e.key === "Escape") return closeSuggestions();
    else return;
    renderSuggestions(state.suggestions, state.active, loadPlace);
  });
  input.addEventListener("blur", () => setTimeout(closeSuggestions, 150));

  $("#search-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const list = state.suggestions.length ? state.suggestions : await runSearch(input.value);
    const pick = list?.[Math.max(state.active, 0)];
    if (pick) loadPlace(pick);
  });

  $("#locate").addEventListener("click", locate);
}

async function locate() {
  if (!navigator.geolocation) return showError("Your browser does not support location. Search for a city instead.");
  showLoading("Finding your location");
  try {
    const { coords } = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }));
    const { latitude, longitude } = coords;
    loadPlace({ id: `geo:${latitude.toFixed(2)},${longitude.toFixed(2)}`, name: "Your location", region: "", country: "", latitude, longitude });
  } catch (err) {
    showError(err.code === 1
      ? "Location permission was denied. Allow it in your browser settings, or search for a city."
      : "We could not find your location. Search for a city instead.");
  }
}

/* ---------- units ---------- */
function setupUnits() {
  const buttons = document.querySelectorAll(".unit button");
  const sync = () => buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.unit === state.unit)));
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      state.unit = b.dataset.unit;
      setUnit(state.unit);
      sync();
      if (state.weather) renderAll(); // no new request: temperatures are converted in the browser
    })
  );
  sync();
}

/* ---------- start ---------- */
function init() {
  setupUnits();
  setupSearch();
  renderChips($("#quick-picks"), QUICK_PICKS, loadPlace);
  renderChips($("#recents"), getRecent(), loadPlace);
  const last = getLastPlace();
  if (last) loadPlace(last);
}
init();
