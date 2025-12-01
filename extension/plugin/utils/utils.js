export const normalizeDomain = (value) => {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.replace(/\/.*$/, "");
  const clean = withoutPath.replace(/^\.+/, "").replace(/\.+$/, "");

  if (!clean || clean.includes(" ")) return null;
  return clean;
};

export const getHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
};

export const isWatchedHost = (hostname, watchedDomains) => {
  if (!hostname) return false;

  return watchedDomains.some((domain) => {
    return hostname === domain || hostname.endsWith("." + domain);
  });
};

export const getTimestampString = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "_" +
    pad(d.getHours()) +
    "-" +
    pad(d.getMinutes()) +
    "-" +
    pad(d.getSeconds())
  );
};
