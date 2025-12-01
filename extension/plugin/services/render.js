export class Render {
  pagesPath = "plugin/pages/";
  loadedCss = new Set();
  loadedModules = new Map();

  ensureCss(relativeHref) {
    if (!relativeHref || this.loadedCss.has(relativeHref)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL(relativeHref);
    document.head.appendChild(link);

    this.loadedCss.add(relativeHref);
  }

  async ensureModule(relativePath) {
    if (!relativePath) return null;

    const url = chrome.runtime.getURL(relativePath);

    if (this.loadedModules.has(url)) {
      return this.loadedModules.get(url);
    }

    const mod = await import(url);
    this.loadedModules.set(url, mod);
    return mod;
  }

  async loadComponent(component) {
    const [html, css] = await Promise.all([
      fetch(
        new URL(
          `/plugin/components/${component}/${component}.html`,
          import.meta.url
        )
      ).then((r) => r.text()),
      fetch(
        new URL(
          `/plugin/components/${component}/${component}.css`,
          import.meta.url
        )
      ).then((r) => r.text()),
    ]);
    const tpl = document.createElement("template");
    tpl.innerHTML = `<style>${css}</style>${html}`;
    return tpl;
  }

  async loadView(name) {
    const container = document.getElementById("root");
    if (!container) return;

    const base = `${this.pagesPath}${name}/${name}`;

    // CSS
    this.ensureCss(base + ".css");

    // HTML
    const res = await fetch(chrome.runtime.getURL(base + ".html"));
    const html = await res.text();
    container.innerHTML = html;

    // JS
    const mod = await this.ensureModule(base + ".js");
    if (mod && typeof mod.init === "function") {
      mod.init();
    }
  }
}
