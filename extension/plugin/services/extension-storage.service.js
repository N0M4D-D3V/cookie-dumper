export class ExtensionStorageService {
  async setMode(mode) {
    const response = await chrome.storage.local.set({ mode, mode });
    return response;
  }

  async getMode() {
    const res = await chrome.storage.local.get({ mode: "disabled" });
    return res ? res.mode : "disabled";
  }

  async setAutomode(autoModeEnabled) {
    const res = await chrome.storage.local.set({
      autoModeEnabled: autoModeEnabled,
    });
    return res;
  }

  async getAutomode() {
    const res = await chrome.storage.local.get({ autoModeEnabled: false });
    return !!res.autoModeEnabled;
  }

  async setHttpEndpoint(endpoint) {
    const result = await chrome.storage.local.set({ endpoint });
    return result;
  }

  async getHttpEndpoint() {
    const result = await chrome.storage.local.get({ endpoint: "" });
    return result.endpoint;
  }

  async getActiveTab() {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    return tabs[0] || undefined;
  }

  async getWatchedDomains() {
    const res = await chrome.storage.local.get({ watchedDomains: [] });
    return Array.isArray(res.watchedDomains) ? res.watchedDomains : [];
  }

  async setWatchedDomains(updated) {
    const res = await chrome.storage.local.set({ watchedDomains: updated });
    return res;
  }
}
