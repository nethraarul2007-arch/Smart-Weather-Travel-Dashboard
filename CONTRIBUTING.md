# Contributing and Git workflow

This project uses a simple branch-and-pull-request workflow so several people can work without overwriting each other.

## Branches
- `main` is always working and is what gets deployed.
- Create one branch per task from the latest `main`: `feature/<short-name>`, `fix/<short-name>` or `docs/<short-name>`.

```bash
git checkout main && git pull
git checkout -b feature/hourly-forecast
```

## Commits
Small, focused commits with a message that starts with a verb:
`Add city search suggestions`, `Fix Fahrenheit conversion for wind`, `Document deployment steps`.

## Pull requests
1. Push your branch: `git push -u origin feature/hourly-forecast`.
2. Open a pull request into `main` and fill in the template.
3. At least one teammate reviews it. Fix review comments with new commits on the same branch.
4. Merge when `npm test` is green, then delete the branch.

## Resolving conflicts
```bash
git checkout feature/my-branch
git fetch origin && git merge origin/main
# edit the files with conflict markers, then:
git add . && git commit
```

## Suggested task split for a team of 3 to 4
| Area | Files | Issue ideas |
|---|---|---|
| API and data | `js/api.js`, `js/weatherCodes.js` | Geocoding search, forecast fetch, error handling |
| UI and icons | `index.html`, `css/style.css`, `js/ui.js`, `js/icons.js` | Layout, animated icons, responsive grid |
| Travel logic | `js/travel.js` | Scoring rules, suggestions, tests |
| Docs and deploy | `README.md`, `docs/` | Project report, GitHub Pages, screenshots |

## Suggested commit history (one commit per step)
1. Initial project structure and README
2. Add API module for city search and forecast
3. Add weather code mapping and animated icons
4. Build current weather and forecast UI
5. Add travel scoring and suggestions
6. Add unit toggle, recent searches and geolocation
7. Add tests and GitHub Actions workflow
8. Add project report and deploy to GitHub Pages
