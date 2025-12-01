# Cookie Dumper

[Leer en español 🇪🇸​](README.md)

Extensions and utilities to export cookies from domains you choose. The extension can dump cookies to disk or send them over HTTP; the optional server in `server/` receives those payloads and saves them.

> ### DISCLAIMER
>
> **Responsible use:** This project is only for educational and defensive research purposes. Do not use it to access systems or accounts without explicit authorization.
>
> It is not authorized to use, copy, modify, or distribute this software without the express permission of the author.

## What's included

- Chrome/Chromium extension (MV3) with a SPA-style popup to manage watched domains, auto-dump, and manual sends.
- Delivery modes: File (downloads JSON) or HTTP (POST).
- Double encryption of payloads before serializing.
- Minimal Flask server to receive `/api/cookie` or `/api/cookie-header` and store results under `server/cookies/`.
- Visual docs in `extension/docs/index.html` (ES) and `extension/docs/index-en.html` (EN).

## Repository structure

- `extension/`: extension code (popup, service worker, assets, icons).
- `extension/docs/`: quick UI guides and screenshots.
- `server/`: optional HTTP receiver. See `server/README.md` for full details.

## Requirements

- Chrome or Chromium with Developer mode enabled to load unpacked extensions.
- Optional for the server: Python 3.10+ and `pip`.

## Install the extension from source

1. Clone the repo and open the folder:
   ```bash
   git clone https://github.com/N0M4D-D3V/cookie-dumper.git
   cd cookie-dumper
   ```
2. Open `chrome://extensions/` and enable _Developer mode_.
3. Click _Load unpacked_ and select the `extension/` folder from the repo.
4. Pin the Cookie Dumper icon to the toolbar for quick access.

## Quick usage

- Add watched domains from the home view; grab the active tab hostname with the bookmark button.
- In **Advanced**, pick `File` or `HTTP` and save the endpoint if using HTTP.
- `AUTO-DUMP` listens to navigation events in the background and triggers dumps when domains match.
- Manual actions: `DUMP TAB` (active tab) or `DUMP ALL` (every watched domain stored).
- In File mode, Chrome downloads the JSON into `cookie-dumps/` under your downloads folder. In HTTP mode it sends the payload in a single POST.

## Optional receiver server

If you want to receive dumps over HTTP locally:

```bash
cd server
python -m venv venv
source venv/bin/activate        # on Windows: venv\\Scripts\\activate
pip install flask flask-cors
python main.py --port 5000
```

- Endpoints: `http://localhost:5000/api/cookie` (original structure) or `/api/cookie-header` (HTTP headers). Configure one of them in the extension's **Advanced** screen.
- Files are generated in `server/cookies/`.
- More info in `server/README.md` and `server/README_en.md`.

## UI documentation

- Open `extension/docs/index.html` (Spanish) or `extension/docs/index-en.html` (English) in your browser to see the illustrated guide.

## License

All rights reserved. See `LICENSE`.
