// Inline SVG weather icons, built from small parts so every condition reuses the same shapes.
const rays = () =>
  Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const [x1, y1, x2, y2] = [32 + Math.cos(a) * 17, 32 + Math.sin(a) * 17, 32 + Math.cos(a) * 24, 32 + Math.sin(a) * 24];
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }).join("");

const sun = (t = "") =>
  `<g ${t}><g class="ico-spin" stroke="#FFC83D" stroke-width="3" stroke-linecap="round">${rays()}</g><circle cx="32" cy="32" r="11" fill="#FFC83D"/></g>`;
const moon = (t = "") => `<g ${t}><path d="M40 12a20 20 0 1 0 14 32A16 16 0 0 1 40 12z" fill="#E6ECFF"/></g>`;
const cloud = (fill = "#F4F7FB", t = "") =>
  `<path class="ico-drift" ${t} d="M18 46h30a10 10 0 0 0 1.5-19.9A14 14 0 0 0 22.5 28 9.5 9.5 0 0 0 18 46z" fill="${fill}"/>`;
const drops = (n = 3) =>
  [24, 34, 44].slice(0, n).map((x, i) => `<line class="ico-drop" style="animation-delay:${i * 0.25}s" x1="${x}" y1="50" x2="${x - 3}" y2="58" stroke="#5AB0FF" stroke-width="3" stroke-linecap="round"/>`).join("");
const flakes = () =>
  [24, 34, 44].map((x, i) => `<circle class="ico-drop" style="animation-delay:${i * 0.3}s" cx="${x}" cy="54" r="2.4" fill="#fff" stroke="#9DB7D5"/>`).join("");
const bolt = () => `<polygon class="ico-flash" points="35,42 26,56 33,56 30,64 43,48 36,48 39,42" fill="#FFD23F"/>`;
const fogLines = () =>
  [50, 56].map((y, i) => `<line x1="${16 + i * 6}" y1="${y}" x2="${48 - i * 4}" y2="${y}" stroke="#B8C4D2" stroke-width="3" stroke-linecap="round"/>`).join("");

export function iconSvg(kind, isDay, label = "") {
  const body = {
    clear: isDay ? sun() : moon(),
    partly: (isDay ? sun('transform="translate(-6 -8) scale(.8)" style="transform-origin:32px 32px"') : moon('transform="translate(-6 -6) scale(.8)"')) + cloud(),
    cloudy: cloud("#C9D2DE", 'transform="translate(0 -4)"') + cloud("#F4F7FB", 'transform="translate(-4 4)"'),
    fog: cloud("#DCE3EC", 'transform="translate(0 -6)"') + fogLines(),
    drizzle: cloud("#DCE3EC") + drops(2),
    rain: cloud("#C9D2DE") + drops(3),
    snow: cloud("#DCE6F2") + flakes(),
    storm: cloud("#9AA6B6") + bolt(),
  }[kind] ?? cloud();
  return `<svg class="wx-icon" viewBox="0 0 64 64" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
