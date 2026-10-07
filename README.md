# Smart Weather & Travel Dashboard

Search any city to see live weather, an hourly outlook, a 7-day forecast and travel suggestions that change with the weather. Built with plain ES6+ JavaScript modules and the free [Open-Meteo](https://open-meteo.com/) API, so no API key is needed.

**Live site:** _add your deployment link_
**Report:** [docs/PROJECT_REPORT.md](docs/PROJECT_REPORT.md)

## Features
- **City search** with live suggestions (debounced, keyboard accessible), recent searches and "Use my location"
- **Current weather:** temperature, feels-like, humidity, wind, rain chance, UV, sunrise and sunset
- **Forecast:** next 24 hours and 7 days, with °C/°F toggle
- **Dynamic icons:** animated SVG icons for clear, partly cloudy, cloudy, fog, drizzle, rain, snow and thunderstorm, with day and night variants. The page background changes with the weather.
- **Travel suggestions:** a 0 to 100 travel score per day, best day to be outdoors, things to do, what to pack and safety tips. Click any forecast day to see its suggestions.
- **Responsive UI**, keyboard and screen-reader support, loading states and clear error messages with retry

## Run it
ES modules need a web server (opening `index.html` directly will not work):

```bash
npm start            # serves http://localhost:8000
npm test             # runs the unit tests (Node 18+)
```

## Deploy
GitHub Pages: push to GitHub, then Settings → Pages → Deploy from branch → `main` / root. The site is static, so Netlify and Vercel also work with no build step.

## Project structure
```
index.html
css/style.css
js/main.js           app state and event wiring
js/api.js            fetch, timeouts, cancellation, error handling, data shaping
js/travel.js         travel scoring and suggestions (pure functions)
js/weatherCodes.js   WMO weather codes to labels and themes
js/icons.js          animated SVG icons
js/ui.js             DOM rendering
js/utils.js          unit conversion, date formatting, debounce
js/storage.js        localStorage helpers
tests/               unit tests (node:test)
docs/PROJECT_REPORT.md
CONTRIBUTING.md      Git and GitHub workflow
```

## ES6+ and async features used
Modules (`import`/`export`), `async`/`await`, `Promise`, `AbortController` to cancel outdated requests, destructuring, spread, optional chaining and nullish coalescing, template literals, arrow functions, classes (`ApiError`), `Map`-style lookups and `Set` for de-duplication.

## Data and credits
Weather and geocoding data by Open-Meteo.com, licensed CC BY 4.0. Travel suggestions are general guidance only.
