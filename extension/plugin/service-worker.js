import { getHostname, isWatchedHost } from "./utils/utils.js";
import {
  extensionStorage,
  dumperService,
} from "./services/composition.root.js";

// Listener de navegación (modo automático)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  // auto-dump active / mode set?
  const autoMode = await extensionStorage.getAutomode();
  const mode = await extensionStorage.getMode();
  if (!autoMode || mode === "disabled") {
    console.log("mode or auto-dump not set");
    return;
  }

  const hostname = getHostname(tab.url);
  if (!hostname) return;

  const domains = await extensionStorage.getWatchedDomains();

  if (!isWatchedHost(hostname, domains)) return;
  await dumperService.dumpTab();
});
