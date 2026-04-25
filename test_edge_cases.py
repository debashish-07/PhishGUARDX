#!/usr/bin/env python3
"""Test edge cases near detection system thresholds (0.45 and 0.70)"""

from backend.runtime import engine

# Test cases for edge case validation
test_urls = [
    # Benign trusted domains (should be safe, <0.45)
    ("https://google.com", "safe"),
    ("https://github.com/torvalds/linux", "safe"),
    ("https://microsoft.com/en-us/windows", "safe"),
    
    # Slightly suspicious patterns (should be in safe range, <0.45)
    ("https://example.com/api/user", "safe"),
    ("https://docs.example.org/guide", "safe"),
    
    # Moderately suspicious (may approach 0.45 boundary)
    ("https://suspicious-domain.com/login", "safe"),
    ("https://verify-account-update.com/confirm", "suspicious"),
    
    # Clear phishing indicators (should be >0.70)
    ("https://paypa1-verify.com/confirm-account", "phishing"),
    ("https://amaz0n-security.net/verify-password", "phishing"),
    ("https://g00gle-authentication.tk/signin", "phishing"),
]

print("=" * 90)
print("EDGE CASE VALIDATION: Testing threshold boundaries (0.45 safe/suspicious, 0.70 suspicious/phishing)")
print("=" * 90)

passed = 0
failed = 0

for url, expected_label in test_urls:
    result = engine.analyze_url(url)
    label = result['label']
    risk = result['risk_score']
    
    # Classify which band
    if risk < 0.45:
        band = "SAFE       "
    elif risk <= 0.70:
        band = "SUSPICIOUS"
    else:
        band = "PHISHING   "
    
    # Check if label matches expected
    match = "✓" if label == expected_label else "✗"
    if label == expected_label:
        passed += 1
    else:
        failed += 1
    
    print(f"\n{match} {url}")
    print(f"  Risk: {risk:.4f} | Label: {label:12} | Band: {band} | Expected: {expected_label}")
    
    # Show first reason
    if result['reasons']:
        print(f"  Reason: {result['reasons'][0]}")

print("\n" + "=" * 90)
print(f"SUMMARY: {passed} passed, {failed} failed out of {len(test_urls)} tests")
print("=" * 90)
