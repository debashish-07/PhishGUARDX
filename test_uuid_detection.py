#!/usr/bin/env python3
"""Test UUID detection on malicious/untrusted domains"""

from backend.runtime import engine

# Phishing URLs that SHOULD be detected regardless of UUID/obfuscation
test_urls = [
    # Clear phishing with UUIDs (should still be phishing >0.70)
    ("https://paypal-verify.com/account/69dbaed9-2f40-8322-a869-59b560ff29ad", "phishing"),
    ("https://amazon-security.tk/confirm/8f94c2e6-5a8d-4f3c-9e8b-1234567890ab", "phishing"),
    ("https://apple-id-verify.net/signin/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6", "phishing"),
    
    # UUID-like hex patterns (should be suspicious/phishing)
    ("https://verify-account.xyz/login/abcdef0123456789abcdef0123456789", "phishing"),
    ("https://confirm-identity.ru/verify/0123456789abcdef0123456789abcdef", "phishing"),
    
    # Legitimate UUID usage on trusted domains (may be suspicious or safe with trust adjustment)
    ("https://chatgpt.com/c/69dbaed9-2f40-8322-a869-59b560ff29ad", "phishing"),  # High risk due to UUID pattern
    
    # Random alphanumeric patterns (24+ chars)
    ("https://malware-site.ru/download/ABCD1234EFGH5678IJKL9012MNOP3456", "phishing"),
]

print("=" * 90)
print("UUID DETECTION TEST: Validating phishing detection on obfuscated URLs")
print("=" * 90)

passed = 0
failed = 0

for url, expected in test_urls:
    result = engine.analyze_url(url)
    label = result['label']
    risk = result['risk_score']
    
    match = "✓" if label == expected else "✗"
    if label == expected:
        passed += 1
    else:
        failed += 1
    
    print(f"\n{match} {url}")
    print(f"  Expected: {expected:12} | Got: {label:12} | Risk: {risk:.4f}")
    
    if result['reasons']:
        reason_str = "; ".join(result['reasons'][:3])
        print(f"  Reasons: {reason_str}")

print("\n" + "=" * 90)
print(f"SUMMARY: {passed} passed, {failed} failed out of {len(test_urls)} tests")
print("=" * 90)
print("\nAnalysis:")
print("- UUID patterns should trigger 'Obfuscated path detected' reason")
print("- Malicious domains should still be flagged even with UUID penalty softening")
print("- Trusted domains with UUIDs may have softened penalty applied")
