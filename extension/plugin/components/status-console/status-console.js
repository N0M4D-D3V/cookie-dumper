import { render } from "../../services/composition.root.js";

const templatePromise = render.loadComponent("status-console");
class StatusConsoleElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentMessage = "";
    this.typingTimeout = null;
    this.deletingTimeout = null;
    this.statusTimeout = null;
    this.ready = this._init();
  }

  async _init() {
    const tpl = await templatePromise;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.rootEl = this.shadowRoot.querySelector(".status");
    this.textEl = this.shadowRoot.querySelector(".text");
    this.clearButton = this.shadowRoot.querySelector(".clear-btn");

    this.clearButton.addEventListener("click", () => this.clear());
  }

  async setMessage(msg) {
    await this.ready;
    this._clearTimers();
    this._resetTransform();

    const nextMessage = msg || "";
    this.rootEl.classList.add("visible");
    this.rootEl.classList.remove("flash");

    if (nextMessage === this.currentMessage && this.currentMessage) {
      this._restartFlash();
      return;
    }

    if (!nextMessage && !this.currentMessage) {
      this.clear();
      return;
    }

    const typeIn = () => {
      let i = 0;
      const type = () => {
        this._setText(nextMessage.slice(0, i));
        this._updateOverflowPosition();
        if (i === nextMessage.length) {
          this.currentMessage = nextMessage;
          return;
        }
        i += 1;
        this.typingTimeout = setTimeout(type, 35);
      };
      type();
    };

    const typeOut = () => {
      if (!this.currentMessage) {
        typeIn();
        return;
      }
      let i = this.currentMessage.length;
      const erase = () => {
        this._setText(this.currentMessage.slice(0, i));
        this._updateOverflowPosition();
        i -= 1;
        if (i >= 0) {
          this.deletingTimeout = setTimeout(erase, 25);
        } else {
          this.currentMessage = "";
          typeIn();
        }
      };
      erase();
    };

    typeOut();
  }

  async clear() {
    await this.ready;
    this._clearTimers();
    this.currentMessage = "";
    this._setText("");
    this.rootEl.classList.remove("flash");
    this._resetTransform();
  }

  _restartFlash() {
    this.rootEl.classList.remove("flash");
    void this.rootEl.offsetWidth;
    this.rootEl.classList.add("flash");
  }

  _resetTransform() {
    if (this.textEl) {
      this.textEl.style.transform = "translateX(0)";
    }
    this.rootEl.scrollLeft = 0;
  }

  _updateOverflowPosition() {
    if (!this.textEl || !this.rootEl) return;
    this.textEl.style.transform = "translateX(0)";
    const buttonWidth = this.clearButton
      ? this.clearButton.getBoundingClientRect().width || 0
      : 0;
    const available = this.rootEl.clientWidth - buttonWidth - 12;
    const overflow = this.textEl.scrollWidth - available;
    if (overflow > 0) {
      this.textEl.style.transform = `translateX(-${overflow}px)`;
    }
  }

  _setText(text) {
    if (!this.textEl) return;
    this.textEl.textContent = text;
  }

  _clearTimers() {
    clearTimeout(this.statusTimeout);
    clearTimeout(this.typingTimeout);
    clearTimeout(this.deletingTimeout);
    this.statusTimeout = null;
    this.typingTimeout = null;
    this.deletingTimeout = null;
  }
}

customElements.define("status-console", StatusConsoleElement);
export { StatusConsoleElement };
