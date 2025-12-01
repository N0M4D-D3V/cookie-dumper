import "../../components/status-console/status-console.js";

import {
  extensionStorage,
  dumperService,
  render,
} from "../../services/composition.root.js";

export function init() {
  const autoToggle = document.getElementById("autoModeToggle");

  const modeSelect = document.getElementById("mode-input");
  const clearModeBtn = document.getElementById("clear-mode-btn");

  const returnBtn = document.getElementById("return-btn");

  const endpointInput = document.getElementById("endpoint-input");
  const saveEndpointBtn = document.getElementById("save-endpoint-btn");
  const clearEndpointBtn = document.getElementById("clear-endpoint-btn");

  const sendAllBtn = document.getElementById("dumpAll");
  const dumpBtn = document.getElementById("dumpTab");

  const statusConsole = document.querySelector("status-console");

  load();
  wireEvents();

  async function load() {
    autoToggle.checked = await extensionStorage.getAutomode();
    modeSelect.value = await extensionStorage.getMode();
    endpointInput.value = await extensionStorage.getHttpEndpoint();
  }

  function wireEvents() {
    autoToggle.addEventListener("change", handleAutoToggle);

    // select actions
    modeSelect.addEventListener("change", handleModeChanged);
    clearModeBtn.addEventListener("click", handleClearMode);

    // endpoint
    clearEndpointBtn.addEventListener("click", handleClearEndpoint);
    saveEndpointBtn.addEventListener("click", handleSaveEndpoint);

    returnBtn.addEventListener("click", handleBackNavigation);
    sendAllBtn.addEventListener("click", handleHttpRequest);
    dumpBtn.addEventListener("click", handleDumpClick);
    endpointInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveEndpoint();
      }
    });
  }

  async function handleDumpClick() {
    const result = await dumperService.dumpTab();
    statusConsole.setMessage(result);
  }

  async function handleAutoToggle() {
    const enabled = autoToggle.checked;
    await extensionStorage.setAutomode(enabled);
    statusConsole.setMessage(enabled ? "AUTO-DUMP: ON" : "AUTO-DUMP: OFF");
  }

  async function handleModeChanged() {
    const mode = modeSelect.value;
    await extensionStorage.setMode(mode);
    statusConsole.setMessage("Mode changed: " + mode.toUpperCase());
  }

  function handleClearMode() {
    modeSelect.value = "disabled";
    statusConsole.setMessage("Mode cleared; Dumper disabled");
  }

  async function handleHttpRequest() {
    const response = await dumperService.dumpAll();
    statusConsole.setMessage(response);
  }

  function handleBackNavigation() {
    render.loadView("home");
  }

  async function handleClearEndpoint() {
    let endpoint = endpointInput.value;
    if (!endpoint) {
      statusConsole.setMessage("Endpoint is empty");
      return;
    }

    endpointInput.value = "";
    endpoint = "";
    await extensionStorage.setHttpEndpoint(endpoint);
    statusConsole.setMessage("Endpoint cleared");
  }

  async function handleSaveEndpoint() {
    const endpoint = endpointInput.value;
    if (!endpoint) {
      statusConsole.setMessage("Enter a valid endpoint");
      return;
    }

    await extensionStorage.setHttpEndpoint(endpoint);
    statusConsole.setMessage("Added " + endpoint);
  }
}
