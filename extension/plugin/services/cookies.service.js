import { extensionStorage } from "./composition.root.js";

export class CookiesService {
  async readWatchedCookies() {
    const domains = await extensionStorage.getWatchedDomains();
    if (!domains.length) return [];

    const perDomainCookies = await Promise.all(
      domains.map(
        (domain) =>
          new Promise((resolve) => {
            chrome.cookies.getAll({ domain: "." + domain }, (cookies) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error reading cookies for",
                  domain,
                  chrome.runtime.lastError
                );
                resolve([]);
                return;
              }
              resolve(cookies || []);
            });
          })
      )
    );

    return perDomainCookies.flat();
  }

  async readCookiesForHostname(hostname) {
    if (!hostname) return [];

    return new Promise((resolve) => {
      chrome.cookies.getAll({ domain: "." + hostname }, (cookies) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error reading cookies for",
            hostname,
            chrome.runtime.lastError
          );
          resolve([]);
          return;
        }
        resolve(cookies || []);
      });
    });
  }

  groupCookiesBySite(cookies) {
    return cookies.reduce((acc, cookie) => {
      const site = (cookie.domain || "unknown").replace(/^\./, "");
      if (!acc[site]) {
        acc[site] = {};
      }
      acc[site][cookie.name] = { ...cookie };
      return acc;
    }, {});
  }

  // Hash simple de las cookies para evitar duplicados
  computeCookiesHash(cookies) {
    const normalized = cookies
      .map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite,
        expirationDate: c.expirationDate,
      }))
      .sort((a, b) => {
        const kA = `${a.domain}|${a.path}|${a.name}`;
        const kB = `${b.domain}|${b.path}|${b.name}`;
        return kA.localeCompare(kB);
      });

    const json = JSON.stringify(normalized);
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
      const chr = json.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // to 32-bit
    }
    return String(hash);
  }
}
