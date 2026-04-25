#!/usr/bin/env python
"""Lightweight backend smoke checks without HTTP client dependencies."""

import sys

sys.path.insert(0, '.')

from backend.core_detection import CoreDetectionEngine
from backend.main import app


print("Testing backend route registration and core engine...")
print("-" * 50)

paths = sorted(route.path for route in app.routes)
for required in ["/", "/health", "/api/detect/url", "/api/report", "/api/report/pdf"]:
	status = "OK" if required in paths else "MISSING"
	print(f"{required}: {status}")

engine = CoreDetectionEngine()
phish = engine.analyze_url("https://forterasecure.weebly.com/")
benign = engine.analyze_url("https://brooksbrothers.com/")
sample = engine.analyze_url("https://prezo.ai/public/new-prezo--0adb545b-a52c-4940-a4ce-ab9614aea6e8")

print("\nCore detector outputs:")
print(f"phish  -> label={phish['label']} risk={phish['risk_score']} reasons={phish['reasons']}")
print(f"benign -> label={benign['label']} risk={benign['risk_score']} reasons={benign['reasons']}")
print(
	"sample -> label={label} keyword_hits={keyword_hits} structural_hits={structural_hits} reasons={reasons}".format(
		label=sample["label"],
		keyword_hits=sample["signals"]["keyword_hits"],
		structural_hits=sample["signals"]["structural_hits"],
		reasons=sample["reasons"],
	)
)

assert sample["signals"]["keyword_hits"] == sample["signals"]["suspicious_token_hits"]
assert sample["signals"]["structural_hits"] >= 1

print("-" * 50)
print("✓ Smoke checks complete")
