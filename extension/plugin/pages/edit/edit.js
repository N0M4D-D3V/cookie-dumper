import { normalizeDomain } from "../../utils/utils.js";
import "../../components/domain-editor/domain-editor.js";
import { extensionStorage } from "../../services/composition.root.js";

document.addEventListener("DOMContentLoaded", () => {
  const editor = document.querySelector("domain-editor");
  const params = new URLSearchParams(window.location.search);
  const original = params.get("domain") || "";

  editor.setDomain(original);
  editor.addEventListener("domain-save", async (e) => {
    console.log("edit.js domain editor");
    const next = normalizeDomain(e.detail?.value);

    if (!next) {
      editor.setStatus("Enter a valid hostname.");
      return;
    }

    const watchedDomains = await extensionStorage.getWatchedDomains();
    const exists = watchedDomains.includes(original);
    const duplicate = next !== original && watchedDomains.includes(next);

    if (duplicate) {
      editor.setStatus("Hostname already exists.");
      return;
    }
    const updated = exists
      ? watchedDomains.map((d) => (d === original ? next : d))
      : [...watchedDomains, next];

    await extensionStorage.setWatchedDomains(updated);
    editor.setStatus("Hostname saved.");
  });

  editor.addEventListener("domain-back", () => {
    window.location.href = "popup.html";
  });
});
