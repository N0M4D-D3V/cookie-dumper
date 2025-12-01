# Cookie Dumper Server

Minimal Flask server that receives cookies from a Chrome extension and writes them to disk in two formats:
1) Browser-style structure, exactly as sent by the extension.
2) HTTP header strings ready to copy/paste.

## Requirements
- Python 3.10+ (tested with 3.13)
- Dependencies: `flask`, `flask-cors`

## Quick setup
```bash
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install flask flask-cors
```

## Run
```bash
python main.py --port 5000 --static-folder ./static
```
- `--port` (optional): HTTP port.  
- `--static-folder` (optional): path to static assets for Flask.

## Endpoints (prefix `/api`)

- `POST /api/cookie`  
  - Writes cookies to `cookies/cookie.json`, preserving the domain/name structure.
  - Expected payload (example):
    ```json
    {
      "example.com": {
        "session": "abc123",
        "prefs": { "foo": "bar" }
      }
    }
    ```

- `POST /api/cookie-header`  
  - Converts each cookie to a header string and stores it in `cookies/cookie_header.json`.
  - Each domain stores a list of generated headers.
  - Expected payload (example):
    ```json
    {
      "example.com": {
        "session": {
          "name": "session",
          "value": "abc123",
          "path": "/",
          "secure": true,
          "httpOnly": true,
          "sameSite": "Lax"
        }
      }
    }
    ```

## Responses
- Success: `{"status":"OK","saved":true}` with HTTP 200.
- Common errors:
  - 400: empty payload or invalid format.
  - 403: write permission denied.
  - 500: unexpected processing or write error.

## Output files
- `cookies/cookie.json`: cookies by domain, original structure.
- `cookies/cookie_header.json`: list of generated headers per domain (`name=value; path=/; secure; HttpOnly; SameSite=Lax`).

## Notes
- CORS is open (`*`) to make it easy for the extension to send requests.
- If the target file already exists, new data is merged by domain, preserving previously stored cookies.
