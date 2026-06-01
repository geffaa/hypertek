#!/usr/bin/env python3
"""
Translate all Nft101 articles in MongoDB using deep_translator.
Usage: python3 translate_nft101_db.py [--prod]
  --prod  : use production DB (backend/Config/.env)
  default : use dev DB (backend/.env.local)
"""

import sys, os, re, time
from pymongo import MongoClient
from deep_translator import GoogleTranslator

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
    env = load_env("backend/.env.local")
    print("Using DEV DB")

MONGO_URI = env.get("MONGODB_URL") or env.get("MONGO_URI")
if not MONGO_URI:
    print("ERROR: MONGODB_URL not found")
    sys.exit(1)

client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
db_name = MONGO_URI.split("/")[-1].split("?")[0] or "test"
if not db_name: db_name = "test"
print(f"Connected. DB: {db_name}")

db = client[db_name]
collection = db["nft101"]

LANG_MAP = {
    "ar":"ar","da":"da","de":"de","el":"el","es":"es","fil":"tl","fr":"fr",
    "he":"iw","hi":"hi","id":"id","it":"it","ja":"ja","ko":"ko","ms":"ms",
    "nl":"nl","no":"no","pl":"pl","pt":"pt","ro":"ro","ru":"ru","sv":"sv",
    "th":"th","tr":"tr","vi":"vi","zh-TW":"zh-TW","zh":"zh-CN",
}

SEP = "✦✦✦"
CHUNK_SIZE = 4500

def translate_long(text, gt_code):
    if len(text) <= CHUNK_SIZE:
        return GoogleTranslator(source="en", target=gt_code).translate(text)
    # Split on newlines, group into chunks
    lines = text.split("\n")
    chunks, current = [], ""
    for line in lines:
        if len(current) + len(line) + 1 > CHUNK_SIZE:
            if current: chunks.append(current)
            current = line
        else:
            current = (current + "\n" + line) if current else line
    if current: chunks.append(current)
    parts = []
    for chunk in chunks:
        parts.append(GoogleTranslator(source="en", target=gt_code).translate(chunk))
        time.sleep(0.2)
    return "\n".join(parts)

def translate_batch(texts, gt_code):
    """Translate a list of short strings in one call using SEP separator."""
    joined = SEP.join(texts)
    if len(joined) > CHUNK_SIZE:
        return None  # too long, caller should handle individually
    try:
        result = GoogleTranslator(source="en", target=gt_code).translate(joined)
        parts = result.split(SEP)
        if len(parts) == len(texts):
            return [p.strip() for p in parts]
    except Exception as e:
        print(f"    batch fail ({gt_code}): {e}")
    return None

def translate_article(doc, gt_code):
    """Translate title, description, and all text/heading contentBlocks."""
    title = doc.get("title", "")
    description = doc.get("description", "")
    blocks = doc.get("contentBlocks", [])

    # Collect translatable block indices + values
    translatable = [(i, b["value"]) for i, b in enumerate(blocks) if b.get("type") in ("heading", "text")]

    # Try batching title + desc + all block values together
    all_texts = [title, description] + [v for _, v in translatable]
    result_texts = translate_batch(all_texts, gt_code)

    if result_texts and len(result_texts) == len(all_texts):
        t_title = result_texts[0]
        t_desc  = result_texts[1]
        t_block_values = result_texts[2:]
    else:
        # Fallback: translate individually
        try:
            t_title = translate_long(title, gt_code)
            time.sleep(0.15)
            t_desc = translate_long(description, gt_code)
            time.sleep(0.15)
        except Exception as e:
            print(f"    title/desc fail ({gt_code}): {e}")
            t_title, t_desc = title, description

        t_block_values = []
        for _, val in translatable:
            try:
                t_block_values.append(translate_long(val, gt_code))
                time.sleep(0.15)
            except Exception as e:
                print(f"    block fail ({gt_code}): {e}")
                t_block_values.append(val)

    # Rebuild contentBlocks — translate text/heading, keep images as-is
    t_blocks = []
    block_idx = 0
    for i, b in enumerate(blocks):
        if b.get("type") == "image":
            t_blocks.append({"type": b["type"], "value": b["value"], "caption": b.get("caption", "")})
        else:
            t_blocks.append({
                "type": b["type"],
                "value": t_block_values[block_idx] if block_idx < len(t_block_values) else b["value"],
                "caption": b.get("caption", ""),
            })
            block_idx += 1

    return {"title": t_title, "description": t_desc, "contentBlocks": t_blocks}


# ── Main ─────────────────────────────────────────────────────────────────────
docs = list(collection.find({}))
print(f"Found {len(docs)} articles\n")

for doc in docs:
    print(f"[{str(doc['_id'])[-6:]}] {doc.get('title','')[:60]}")
    translations = {}
    for locale_code, gt_code in LANG_MAP.items():
        result = translate_article(doc, gt_code)
        translations[locale_code] = result
        time.sleep(0.15)

    collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"translations": translations}}
    )
    print(f"  ✓ Done — ko: {translations['ko']['title'][:50]}")

print("\nAll done!")
client.close()
