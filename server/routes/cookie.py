from flask import Blueprint, request, jsonify
import json
from pathlib import Path

cookie_bp = Blueprint("cookie", __name__)

@cookie_bp.route('/cookie', methods=['POST'])
def receive():
    try:
        payload = request.get_json()
        if not payload or not isinstance(payload, dict):
            return jsonify(error='No JSON received or invalid format'), 400

        cookies_dir = Path("cookies")
        cookies_dir.mkdir(parents=True, exist_ok=True)

        cookie_file = cookies_dir / "cookie.json"

        existing_data = {}
        if cookie_file.exists():
            try:
                with cookie_file.open("r", encoding="utf-8") as f:
                    existing_data = json.load(f)
                    if not isinstance(existing_data, dict):
                        existing_data = {}
            except json.JSONDecodeError:
                existing_data = {}

        for domain, cookies in payload.items():
            if not isinstance(cookies, dict):
                existing_data[domain] = cookies
                continue

            domain_cookies = existing_data.get(domain, {})
            if not isinstance(domain_cookies, dict):
                domain_cookies = {}

            for name, cookie_value in cookies.items():
                domain_cookies[name] = cookie_value

            existing_data[domain] = domain_cookies

        with cookie_file.open("w", encoding="utf-8") as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)

        return jsonify({'status':'OK', 'saved': True}), 200


    except PermissionError:
        return jsonify(error='Permission denied when writing'), 403
    except Exception as e:
        return jsonify(error='Unexpected error'), 500


def _cookie_name_from_header(header_value: str) -> str:
    name_part = header_value.split(";", 1)[0]
    return name_part.split("=", 1)[0].strip()


def _format_cookie_as_header(cookie: dict) -> str:
    name = cookie.get("name")
    value = cookie.get("value", "")
    parts = [f"{name}={value}"]

    path = cookie.get("path")
    if path:
        parts.append(f"path={path}")

    if cookie.get("secure"):
        parts.append("secure")

    if cookie.get("httpOnly"):
        parts.append("HttpOnly")

    same_site = cookie.get("sameSite")
    if same_site:
        parts.append(f"SameSite={same_site}")

    return "; ".join(parts)


@cookie_bp.route('/cookie-header', methods=['POST'])
def receive_header():
    try:
        payload = request.get_json()
        if not payload or not isinstance(payload, dict):
            return jsonify(error='No JSON received or invalid format'), 400

        cookies_dir = Path("cookies")
        cookies_dir.mkdir(parents=True, exist_ok=True)

        cookie_file = cookies_dir / "cookie_header.json"

        existing_data = {}
        if cookie_file.exists():
            try:
                with cookie_file.open("r", encoding="utf-8") as f:
                    existing_data = json.load(f)
                    if not isinstance(existing_data, dict):
                        existing_data = {}
            except json.JSONDecodeError:
                existing_data = {}

        for domain, cookies in payload.items():
            if not isinstance(cookies, dict):
                continue

            existing_headers = existing_data.get(domain, [])
            domain_cookie_map = {}
            if isinstance(existing_headers, list):
                for header_value in existing_headers:
                    name = _cookie_name_from_header(str(header_value))
                    domain_cookie_map[name] = header_value

            for name, cookie_value in cookies.items():
                if isinstance(cookie_value, dict):
                    header_value = _format_cookie_as_header(cookie_value)
                else:
                    header_value = str(cookie_value)
                domain_cookie_map[name] = header_value

            existing_data[domain] = list(domain_cookie_map.values())

        with cookie_file.open("w", encoding="utf-8") as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)

        return jsonify({'status':'OK', 'saved': True}), 200

    except PermissionError:
        return jsonify(error='Permission denied when writing'), 403
    except Exception as e:
        return jsonify(error='Unexpected error'), 500
