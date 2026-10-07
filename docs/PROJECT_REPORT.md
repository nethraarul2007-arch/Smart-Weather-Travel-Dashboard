# Smart Weather & Travel Dashboard: Project Report

**Team members:** _names and roll numbers_
**Course / Department:** _fill in_
**Guide:** _fill in_
**Date:** _fill in_
**Repository:** _link_  **Live site:** _link_

---

## 1. Abstract
This project is a single-page web application that retrieves real-time weather for any city and turns the forecast into practical travel guidance. Users search for a city, view current conditions, an hourly outlook and a 7-day forecast, and receive a daily travel score with suggested activities, packing advice and safety tips. The application uses JavaScript (ES6+ modules), asynchronous programming and the Open-Meteo REST APIs, and is deployed as a static website.

## 2. Objectives
1. Fetch and display real-time weather data from a public API.
2. Let users find any city quickly and reliably.
3. Present the forecast with dynamic, condition-based icons and themes.
4. Convert weather data into useful, explainable travel suggestions.
5. Deliver a responsive, accessible interface.
6. Practise team development with Git and GitHub.

## 3. Technology stack
| Layer | Choice | Reason |
|---|---|---|
| Language | JavaScript (ES2022 modules) | Native `async`/`await`, modules, no build step |
| Markup and style | HTML5, CSS3 (Grid, Flexbox, custom properties) | Responsive layout and theming |
| Data | Open-Meteo Geocoding and Forecast APIs | Free, no API key, CORS enabled |
| Testing | Node's built-in `node:test` | No dependencies |
| Hosting | GitHub Pages | Free static hosting |
| Collaboration | Git, GitHub, pull requests, GitHub Actions | Review and automated tests |

## 4. System design
```
 User ──► Search box ──► api.searchCities() ──► Geocoding API
                │
                ▼ (city chosen)
          api.getWeather() ──► Forecast API
                │
                ▼ normalizeWeather()
        state { place, weather, unit, selectedDay }
                │
     ┌──────────┼───────────────┬───────────────┐
     ▼          ▼               ▼               ▼
 renderCurrent renderHourly renderForecast  renderTravel ◄── travel.js (scoring rules)
     │                                           
     └── icons.js + weatherCodes.js (icon and theme for each condition)
```
The code is split by responsibility: `api.js` handles network access only, `travel.js` contains pure logic with no DOM, and `ui.js` only renders. This makes each part testable on its own.

### 4.1 APIs used
| Purpose | Endpoint | Key parameters |
|---|---|---|
| City search | `geocoding-api.open-meteo.com/v1/search` | `name`, `count`, `language` |
| Weather | `api.open-meteo.com/v1/forecast` | `latitude`, `longitude`, `current`, `hourly`, `daily`, `timezone=auto`, `forecast_days=7` |

Temperatures are requested in °C. The °C/°F toggle converts in the browser, so changing units needs no new request.

## 5. Features and implementation
### 5.1 City search
Typing triggers a debounced (350 ms) geocoding request. Results appear in an accessible listbox (`role="combobox"`, arrow-key navigation, Esc to close). Each new keystroke aborts the previous request so slow responses cannot overwrite newer ones. Recent searches and the last city are stored in `localStorage`.

### 5.2 Weather forecast
`getWeather()` makes one request that returns current, hourly and daily data. `normalizeWeather()` reshapes the column-based API arrays into arrays of objects and trims the hourly data to the next 24 hours from the current local time.

### 5.3 Dynamic icons and themes
`weatherCodes.js` maps WMO weather codes to a label and an icon kind. `icons.js` builds inline SVGs from reusable parts (sun, moon, cloud, drops, flakes, bolt, fog lines) with day and night variants and CSS animations (rotating rays, drifting clouds, falling rain, flashing lightning). The `<body>` theme changes with the current condition, for example sunny, night, rain or storm. Animations are disabled when the user prefers reduced motion.

### 5.4 Travel suggestions
`travel.js` scores each day from 0 to 100 using transparent rules:

| Factor | Rule |
|---|---|
| Temperature | Ideal average 18 to 28 °C. Penalty grows below 18 °C and faster above 28 °C. Extra penalty above 38 °C |
| Rain | Subtract 35% of the rain probability, plus 15 if the day is rainy or drizzly |
| Sky | Snow −25, fog −15, thunderstorm −45 |
| Wind | Penalty above 30 km/h |
| UV | Small penalty when UV is 8 or higher |

Scores map to Great (80+), Good (60+), Fair (40+) and Poor. The same weather also selects activities (for example museums on rainy days, early-morning sightseeing on hot days), packing items and safety tips. The app highlights the best day of the week and lets the user select any day.

### 5.5 Responsive UI and accessibility
Mobile-first CSS with breakpoints at 640 px and 900 px. The forecast grid changes from 2 to 4 to 7 columns. Other accessibility features: skip link, labelled controls, `aria-pressed` on toggles, live regions for loading and errors, visible focus styles and descriptive labels on forecast buttons.

### 5.6 Asynchronous programming and error handling
- `async`/`await` with `fetch` for all requests
- `AbortController` for cancellation and a 10-second timeout
- A custom `ApiError` class with friendly messages for network failure, timeout, HTTP errors and incomplete data
- Loading indicator while requests run, and a **Try again** button after failures
- Cancelled requests are ignored silently so the UI never shows a false error

## 6. Testing
**Automated:** 10 unit tests (`npm test`) cover weather code mapping, unit conversion, scoring and advice rules, data normalisation, API success and failure handling (using a mocked `fetch`), request cancellation and debounce. A GitHub Actions workflow runs them on every push and pull request.

**Manual checklist**
| Test | Expected result |
|---|---|
| Search "Chennai" and pick a result | Dashboard shows current weather, 24 hours and 7 days |
| Search a nonsense string | "No cities found" message |
| Turn off the network, then select a city | Error message with Try again; works after reconnecting |
| Toggle °F | All temperatures and wind speeds change without a new request |
| Click a forecast day | Travel panel updates for that day |
| Use a 360 px wide screen | No horizontal scrolling |
| Keyboard only | Search, selection and day buttons all reachable |

_Add screenshots of desktop and mobile views here._

## 7. Git and GitHub collaboration
The team used feature branches, pull requests with a template, peer review and a CI workflow. See `CONTRIBUTING.md` for the branching model, commit conventions and task split. _Add a screenshot of the commit history or pull request list, and each member's contribution._

## 8. Challenges and solutions
| Challenge | Solution |
|---|---|
| Fast typing caused out-of-order search results | Debounce plus `AbortController` to cancel older requests |
| Hourly data starts at midnight | Find the current hour in the array and slice the next 24 entries |
| Units changed after loading | Keep data in °C and convert only when rendering |
| Many icons for many weather codes | Group codes into 8 kinds and build icons from shared parts |
| Making suggestions explainable | Rule-based scoring instead of a black box |

## 9. Limitations and future scope
- Suggestions are general rules, not personalised or based on a specific destination's attractions.
- "Use my location" shows coordinates as "Your location" because the API has no reverse geocoding.
- Future work: weather alerts, air quality, comparing two cities, saved favourite trips, a map view, offline caching with a service worker, and user-selectable activity preferences.

## 10. Conclusion
The project meets its goals: it fetches live weather, presents it clearly with dynamic icons, and converts it into understandable travel advice. It practises ES6+ JavaScript, API integration, asynchronous programming and collaborative Git workflows, and the layered code structure makes it easy to extend.

## 11. References
- Open-Meteo Weather Forecast API documentation: https://open-meteo.com/en/docs
- Open-Meteo Geocoding API documentation: https://open-meteo.com/en/docs/geocoding-api
- MDN Web Docs: Fetch API, AbortController, JavaScript modules
- WMO weather interpretation codes (as published in the Open-Meteo documentation)
