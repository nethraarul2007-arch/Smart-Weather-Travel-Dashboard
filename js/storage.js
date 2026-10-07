// Small wrapper so a blocked or full localStorage never breaks the app.
const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
};

export const getUnit = () => read("wx:unit", "c");
export const setUnit = (unit) => write("wx:unit", unit);
export const getLastPlace = () => read("wx:last", null);
export const setLastPlace = (place) => write("wx:last", place);
export const getRecent = () => read("wx:recent", []);
export const addRecent = (place) => {
  const list = [place, ...getRecent().filter((p) => p.id !== place.id)].slice(0, 5);
  write("wx:recent", list);
  return list;
};
