import { Render } from "./render.js";
import { CookiesService } from "./cookies.service.js";
import { CryptoService } from "./crypto.service.js";
import { DumperService } from "./dumper.service.js";
import { ExtensionStorageService } from "./extension-storage.service.js";

export const cookiesService = new CookiesService();
export const cryptoService = new CryptoService();

export const dumperService = new DumperService();
export const extensionStorage = new ExtensionStorageService();

export const render = new Render();
