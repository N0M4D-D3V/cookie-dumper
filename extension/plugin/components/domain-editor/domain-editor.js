import { render } from "../../services/composition.root.js";

const tplPromise = render.loadComponent("domain-editor");
class DomainEditorElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.ready = this._init();
    this.currentValue = "";
  }

  async _init() {
    const tpl = await tplPromise;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.inputEl = this.shadowRoot.querySelector(".domain-input");
    this.statusEl = this.shadowRoot.querySelector(".status");

    this.shadowRoot
      .querySelector("[data-action='save']")
      .addEventListener("click", () => {
        this._emitSave();
      });
    this.shadowRoot
      .querySelector("[data-action='back']")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("domain-back", { bubbles: true, composed: true })
        );
      });
  }

  async setDomain(domain) {
    await this.ready;
    this.currentValue = domain || "";
    this.inputEl.value = this.currentValue;
  }

  async setStatus(msg) {
    await this.ready;
    if (!msg) {
      this.statusEl.hidden = true;
      this.statusEl.textContent = "";
    } else {
      this.statusEl.hidden = false;
      this.statusEl.textContent = msg;
    }
  }

  _emitSave() {
    const value = (this.inputEl.value || "").trim().toLowerCase();
    this.dispatchEvent(
      new CustomEvent("domain-save", {
        detail: { value, previous: this.currentValue },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("domain-editor", DomainEditorElement);
export { DomainEditorElement };
