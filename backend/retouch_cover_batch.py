"""Two bounded, no-AI cleanups for newly generated covers only."""
import argparse
import fcntl
import io
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image, ImageChops, ImageFilter
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
from media_opt import QUALITY, upload_cover  # noqa: E402

RETOUCHES = {
    "v8-why-do-we-feel-embarrassed-for-other-people": "remove-header-lettering",
    "v8-why-do-we-drive-on-the-right-and-the-british-on-the-left": "blend-footer-artifact",
}


def retouch(raw, operation):
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    if image.size != (896, 1200):
        raise ValueError("Retouch coordinates require the reviewed 896x1200 source")
    if operation == "remove-header-lettering":
        header = image.crop((0, 0, 896, 270))
        channels = header.split()
        light = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2])
        mask = light.point(lambda value: 255 if value > 80 else 0)
        mask = mask.filter(ImageFilter.MaxFilter(19)).filter(ImageFilter.GaussianBlur(3))
        background = header.crop((0, 0, 95, 270)).resize((896, 270))
        background = background.filter(ImageFilter.GaussianBlur(12))
        image.paste(background, (0, 0), mask)
    else:
        # Existing unwanted rectangle begins at y=1080; fade the ground before it.
        mask = Image.new("L", image.size, 0)
        for y in range(970, 1200):
            t = min(1, (y - 970) / 108)
            mask.paste(round(255 * t * t * (3 - 2 * t)), (0, y, 896, y + 1))
        image.paste(Image.new("RGB", image.size, (3, 8, 11)), (0, 0), mask)
    output = io.BytesIO()
    image.save(output, "WEBP", quality=QUALITY, method=6)
    return output.getvalue()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    args = parser.parse_args()
    with (ROOT / ".cover_generation.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        report = json.loads(args.report.read_text())
        if report["status"] == "running":
            raise RuntimeError("Wait for generation to finish")
        baseline = {row["id"] for row in report["existing_covers"]}
        with MongoClient(os.environ["MONGO_URL"]) as client:
            db = client[os.environ["DB_NAME"]]
            for record in report["generated"]:
                sid = record["id"]
                if sid not in RETOUCHES or record.get("retouch"):
                    continue
                if sid in baseline:
                    raise RuntimeError("Pre-existing covers must never be retouched")
                source = ROOT.parent / record["source_file"]
                raw = retouch(source.read_bytes(), RETOUCHES[sid])
                fields = upload_cover(sid, raw)
                previous = record["hero_image_generated"]
                result = db.stories.update_one(
                    {"id": sid, "hero_image_generated": previous}, {"$set": fields})
                if not result.modified_count:
                    raise RuntimeError(f"Concurrent cover change: {sid}")
                temporary = source.with_suffix(".tmp")
                temporary.write_bytes(raw)
                temporary.replace(source)
                record.update(fields)
                record["retouch"] = {"operation": RETOUCHES[sid], "previous_hero": previous,
                                     "at": datetime.now(timezone.utc).isoformat(), "ai_calls": 0}
                temporary = args.report.with_suffix(".tmp")
                temporary.write_text(json.dumps(report, ensure_ascii=False, indent=2))
                temporary.replace(args.report)
                print(f"Retouched {sid}: no AI call, Q{QUALITY}", flush=True)


if __name__ == "__main__":
    main()