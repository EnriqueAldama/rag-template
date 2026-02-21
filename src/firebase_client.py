import os
import json
from typing import Any, Dict, Optional
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

FIREBASE_DB_URL = os.getenv("FIREBASE_DB_URL", "").rstrip("/")
FIREBASE_DB_AUTH = os.getenv("FIREBASE_DB_AUTH", "")


class FirebaseError(RuntimeError):
    pass


def _build_url(path: str) -> str:
    if not FIREBASE_DB_URL:
        raise FirebaseError("FIREBASE_DB_URL is not set.")
    clean_path = path.strip("/")
    url = f"{FIREBASE_DB_URL}/{clean_path}.json"
    if FIREBASE_DB_AUTH:
        joiner = "&" if "?" in url else "?"
        url = f"{url}{joiner}auth={FIREBASE_DB_AUTH}"
    return url


def firebase_get(path: str) -> Any:
    url = _build_url(path)
    resp = requests.get(url, timeout=15)
    if not resp.ok:
        raise FirebaseError(f"GET {url} failed: {resp.status_code} {resp.text}")
    if not resp.text:
        return None
    return resp.json()


def firebase_post(path: str, payload: Dict[str, Any]) -> Optional[str]:
    url = _build_url(path)
    resp = requests.post(
        url,
        data=json.dumps(payload, ensure_ascii=True),
        headers={"Content-Type": "application/json"},
        timeout=15,
    )
    if not resp.ok:
        raise FirebaseError(f"POST {url} failed: {resp.status_code} {resp.text}")
    data = resp.json()
    return data.get("name")


def firebase_put(path: str, payload: Dict[str, Any]) -> None:
    url = _build_url(path)
    resp = requests.put(
        url,
        data=json.dumps(payload, ensure_ascii=True),
        headers={"Content-Type": "application/json"},
        timeout=15,
    )
    if not resp.ok:
        raise FirebaseError(f"PUT {url} failed: {resp.status_code} {resp.text}")
