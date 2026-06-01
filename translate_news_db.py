#!/usr/bin/env python3
"""
Translate all News documents in MongoDB using deep_translator.
Usage: python3 translate_news_db.py [--prod]
  --prod  : use production DB (Config/.env)
  default : use dev DB (.env.local)
"""

import sys, os, re, time
from pymongo import MongoClient
from deep_translator import GoogleTranslator

# ── DB connection ─────────────────────────────────────────────────────────────
def load_env(filepath):
    env = {}
    if not os.path.exists(filepath): return env
    for line in open(filepath):
        line = line.strip()
        if not line or line.startswith("#"): continue
        if "=" in line:
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env

use_prod = "--prod" in sys.argv
if use_prod:
    env = load_env("backend/Config/.env")
    print("Using PRODUCTION DB")
else:
    env = load_env(".env.local")
    print("Using DEV DB (.env.local)")

MONGO_URI = env.get("MONGODB_URL") or env.get("MONGO_URI")
if not MONGO_URI:
    print("ERROR: MONGODB_URL not found")
    sys.exit(1)

client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
# Extract DB name from URI, default to 'test'
db_name = MONGO_URI.split("/")[-1].split("?")[0] or "test"
if not db_name or db_name == "":
    db_name = "test"
print(f"Connected. DB: {db_name}")

db = client[db_name]
collection = db["news"]

# ── Language map ──────────────────────────────────────────────────────────────
LANG_MAP = {
    "ar":"ar","da":"da","de":"de","el":"el","es":"es","fil":"tl","fr":"fr",
    "he":"iw","hi":"hi","id":"id","it":"it","ja":"ja","ko":"ko","ms":"ms",
    "nl":"nl","no":"no","pl":"pl","pt":"pt","ro":"ro","ru":"ru","sv":"sv",
    "th":"th","tr":"tr","vi":"vi","zh-TW":"zh-TW","zh":"zh-CN",
}

SEP = "✦✦✦"
PLACEHOLDER_RE = re.compile(r'\{\{[^}]+\}\}')

def replace_ph(text):
    m = {}
    def r(match):
        t = f"__PH{len(m)}__"
        m[t] = match.group(0)
        return t
    return PLACEHOLDER_RE.sub(r, text), m

def restore_ph(text, m):
    for t, orig in m.items():
        text = text.replace(t, orig)
    return text

CHUNK_SIZE = 4500  # Google Translate limit is 5000

def translate_long(text, gt_code):
    """Split text on paragraph boundaries and translate in chunks."""
    if len(text) <= CHUNK_SIZE:
        return GoogleTranslator(source="en", target=gt_code).translate(text)
    # split into paragraphs, then group into chunks < CHUNK_SIZE
    paragraphs = text.split("\n")
    chunks, current = [], ""
    for para in paragraphs:
        if len(current) + len(para) + 1 > CHUNK_SIZE:
            if current:
                chunks.append(current)
            current = para
        else:
            current = (current + "\n" + para) if current else para
    if current:
        chunks.append(current)
    translated_chunks = []
    for chunk in chunks:
        translated_chunks.append(GoogleTranslator(source="en", target=gt_code).translate(chunk))
        time.sleep(0.2)
    return "\n".join(translated_chunks)

def translate_pair(heading, description, gt_code):
    """Translate heading+description; handles texts longer than 5000 chars."""
    h_mod, h_map = replace_ph(heading)
    d_mod, d_map = replace_ph(description)
    # If combined fits in one call, batch them
    joined = f"{h_mod}{SEP}{d_mod}"
    if len(joined) <= CHUNK_SIZE:
        try:
            result = GoogleTranslator(source="en", target=gt_code).translate(joined)
            parts = result.split(SEP)
            if len(parts) == 2:
                return restore_ph(parts[0].strip(), h_map), restore_ph(parts[1].strip(), d_map)
        except Exception as e:
            print(f"    batch fail ({gt_code}): {e}")
    # Translate heading and description separately (handles long texts via chunking)
    try:
        th = translate_long(h_mod, gt_code)
        time.sleep(0.2)
        td = translate_long(d_mod, gt_code)
        return restore_ph(th.strip(), h_map), restore_ph(td.strip(), d_map)
    except Exception as e:
        print(f"    single fail ({gt_code}): {e}")
        return heading, description  # fallback

# ── Main ──────────────────────────────────────────────────────────────────────
docs = list(collection.find({}))
print(f"Found {len(docs)} news articles\n")

for doc in docs:
    heading = doc.get("heading", "")
    description = doc.get("description", "")
    print(f"[{str(doc['_id'])[-6:]}] {heading[:55]}...")

    translations = {}
    for locale_code, gt_code in LANG_MAP.items():
        th, td = translate_pair(heading, description, gt_code)
        translations[locale_code] = {"heading": th, "description": td}
        time.sleep(0.15)

    # Save to MongoDB
    collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"translations": translations}}
    )
    print(f"  ✓ Done (26 languages) — ko: {translations['ko']['heading'][:50]}")

print("\nAll done!")
client.close()
