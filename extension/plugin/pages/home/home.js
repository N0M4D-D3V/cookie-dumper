import "../../components/status-console/status-console.js";
import "../../components/domain-editor/domain-editor.js";

import { extensionStorage, render } from "../../services/composition.root.js";

import { normalizeDomain, getHostname } from "../../utils/utils.js";

export function init() {
  const domainInput = document.getElementById("domainInput");
  const addDomainBtn = document.getElementById("addDomainBtn");
  const addCurrentBtn = document.getElementById("addCurrentBtn");
  const domainsList = document.getElementById("domainsList");
  const statusConsole = document.querySelector("status-console");
  const viewMain = document.getElementById("view-main");
  const viewEditor = document.getElementById("view-editor");
  const domainEditor = viewEditor.querySelector("domain-editor");

  const advancedSettingsBtn = document.getElementById("advanced-settings-btn");

  let lastDomains = [];

  load();
  wireEvents();

  async function load() {
    const domains = await extensionStorage.getWatchedDomains();
    renderDomains(domains, lastDomains);
    lastDomains = domains.slice();
  }

  function wireEvents() {
    addDomainBtn.addEventListener("click", handleAddDomain);
    addCurrentBtn.addEventListener("click", handleAddCurrentTab);
    advancedSettingsBtn.addEventListener(
      "click",
      handleNavigateToAdvancedSettings
    );
    domainInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddDomain();
      }
    });
  }

  function handleNavigateToAdvancedSettings() {
    render.loadView("advanced-config");
  }

  function handleAddDomain() {
    const domain = normalizeDomain(domainInput.value);
    if (!domain) {
      statusConsole.setMessage("Enter a valid domain");
      return;
    }
    saveDomain(domain);
  }

  async function handleAddCurrentTab() {
    const activeTab = await extensionStorage.getActiveTab();

    if (!activeTab || !activeTab.url) {
      statusConsole.setMessage("No active tab URL.");
      return;
    }
    const domain = normalizeDomain(getHostname(activeTab.url));
    if (!domain) {
      statusConsole.setMessage("Cannot parse hostname.");
      return;
    }
    saveDomain(domain);
  }

  function renderDomains(domains, prevDomains = []) {
    domainsList.innerHTML = "";

    if (!domains.length) {
      const li = document.createElement("li");
      li.className = "empty enter";
      li.textContent = "No watched domains yet.";
      domainsList.appendChild(li);
      requestAnimationFrame(() => {
        li.classList.add("show");
      });
      return;
    }

    domains.forEach((domain) => {
      const li = document.createElement("li");
      const wasPresent = prevDomains.includes(domain);
      li.className = wasPresent ? "show" : "enter";
      const text = document.createElement("span");
      text.textContent = domain;
      text.className = "domain-text";

      const removeBtn = document.createElement("button");
      removeBtn.innerHTML = '<div class="pixel-icon backspace"></div>';
      removeBtn.className = "remove-btn";
      removeBtn.addEventListener("click", () => {
        li.classList.add("removing");
        let done = false;
        const finalize = async () => {
          if (done) return;
          done = true;
          const filtered = domains.filter((d) => d !== domain);
          await extensionStorage.setWatchedDomains(filtered);
          statusConsole.setMessage("Removed " + domain);
          load();
        };
        li.addEventListener("transitionend", finalize, { once: true });
        setTimeout(finalize, 400);
      });

      li.appendChild(text);
      li.appendChild(removeBtn);
      domainsList.appendChild(li);

      li.addEventListener("click", (e) => {
        if (e.target.closest(".remove-btn")) return;
        openEditor(domain);
      });

      if (!wasPresent) {
        requestAnimationFrame(() => {
          li.classList.add("show");
        });
      }
    });
  }

  async function saveDomain(domain) {
    const watchedDomains = await extensionStorage.getWatchedDomains();
    if (watchedDomains.includes(domain)) {
      statusConsole.setMessage("Already watching " + domain);
      domainInput.value = "";
      return;
    }
    const updated = [...watchedDomains, domain];
    await extensionStorage.setWatchedDomains(updated);
    domainInput.value = "";
    statusConsole.setMessage("Added " + domain);
    load();
  }

  function openEditor(domain) {
    domainEditor.setDomain(domain);
    domainEditor.setStatus("");
    switchView("editor");
  }

  function switchView(which) {
    if (which === "editor") {
      viewMain.classList.remove("active");
      viewMain.classList.add("hidden");
      viewEditor.classList.add("active");
      viewEditor.classList.remove("hidden");
    } else {
      viewEditor.classList.remove("active");
      viewEditor.classList.add("hidden");
      viewMain.classList.add("active");
      viewMain.classList.remove("hidden");
      load();
    }
  }

  domainEditor.addEventListener("domain-save", async (e) => {
    const next = normalizeDomain(e.detail?.value);
    const original = e.detail?.previous || "";
    if (!next) {
      domainEditor.setStatus("Enter a valid hostname.");
      return;
    }

    const watchedDomains = await extensionStorage.getWatchedDomains();
    const exists = watchedDomains.includes(original);
    const duplicate = next !== original && watchedDomains.includes(next);
    if (duplicate) {
      domainEditor.setStatus("Hostname already exists.");
      return;
    }
    const updated = exists
      ? watchedDomains.map((d) => (d === original ? next : d))
      : [...watchedDomains, next];

    await extensionStorage.setWatchedDomains(updated);
    domainEditor.setStatus("Hostname saved.");
    statusConsole.setMessage("Saved changes.");

    switchView("main");
  });

  domainEditor.addEventListener("domain-back", () => {
    switchView("main");
  });
}
