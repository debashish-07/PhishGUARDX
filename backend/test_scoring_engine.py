#!/usr/bin/env python3
"""Unit tests for new detection system functions (pytest compatible)"""

import pytest
from backend.runtime import engine
from backend.scoring_engine import (
    apply_domain_trust,
    extract_base_domain,
    detect_uuid_pattern,
    adjust_path_risk,
    classify_with_uncertainty,
    compute_risk_score,
    Thresholds,
)


class TestDomainTrust:
    """Test domain trust weighting logic"""

    def test_extract_base_domain(self):
        assert extract_base_domain("https://api.whatsapp.com/send?phone=123") == "whatsapp.com"
        assert extract_base_domain("https://login.microsoft.com/") == "microsoft.com"

    def test_trusted_domain_applied(self):
        """Trusted domain should reduce risk by 20% when no strong phishing signals exist."""
        domain = "google.com"
        risk = 0.60
        features = {
            "https": 1.0,
            "token_hits": 0.0,
            "subdomain_depth": 1.0,
            "has_brand_term": 0.0,
            "risky_host": 0.0,
            "suspicious_tld": 0.0,
        }

        adjusted = apply_domain_trust(domain, risk, features)

        assert adjusted == pytest.approx(0.48, abs=0.01)  # 0.60 * 0.80 = 0.48

    def test_untrusted_domain_unchanged(self):
        """Untrusted domain should not be adjusted"""
        domain = "suspicious-site.ru"
        risk = 0.60
        features = {
            "https": 1.0,
            "token_hits": 0.0,
            "subdomain_depth": 1.0,
            "has_brand_term": 0.0,
            "risky_host": 0.0,
            "suspicious_tld": 0.0,
        }

        adjusted = apply_domain_trust(domain, risk, features)

        assert adjusted == risk

    def test_https_guard_blocks_trust_reduction(self):
        domain = "chatgpt.com"
        risk = 0.50
        features = {
            "https": 0.0,
            "token_hits": 0.0,
            "subdomain_depth": 1.0,
            "has_brand_term": 0.0,
            "risky_host": 0.0,
            "suspicious_tld": 0.0,
        }

        adjusted = apply_domain_trust(domain, risk, features)
        assert adjusted == risk

    def test_keyword_guard_blocks_trust_reduction(self):
        domain = "google.com"
        risk = 0.50
        features = {
            "https": 1.0,
            "token_hits": 2.0,
            "subdomain_depth": 1.0,
            "has_brand_term": 0.0,
            "risky_host": 0.0,
            "suspicious_tld": 0.0,
        }

        adjusted = apply_domain_trust(domain, risk, features)
        assert adjusted == risk

    def test_subdomain_depth_guard_blocks_trust_reduction(self):
        domain = "microsoft.com"
        risk = 0.50
        features = {
            "https": 1.0,
            "token_hits": 0.0,
            "subdomain_depth": 4.0,
            "has_brand_term": 0.0,
            "risky_host": 0.0,
            "suspicious_tld": 0.0,
        }

        adjusted = apply_domain_trust(domain, risk, features)
        assert adjusted == risk

    def test_strong_rule_flag_guard_blocks_trust_reduction(self):
        domain = "apple.com"
        risk = 0.50
        features = {
            "https": 1.0,
            "token_hits": 0.0,
            "subdomain_depth": 1.0,
            "risky_host": 1.0,
            "suspicious_tld": 1.0,
        }

        adjusted = apply_domain_trust(domain, risk, features)
        assert adjusted == risk


class TestUUIDDetection:
    """Test obfuscated path detection"""

    def test_uuid_detected(self):
        """Standard UUID format should be detected"""
        url = "https://example.com/api/69dbaed9-2f40-8322-a869-59b560ff29ad"
        result = detect_uuid_pattern(url)
        
        assert result["has_obfuscated_path"] is True
        assert len(result["matched_segments"]) > 0

    def test_hex_pattern_detected(self):
        """24+ hex characters should be detected"""
        url = "https://malware.ru/download/abcdef0123456789abcdef0123456789"
        result = detect_uuid_pattern(url)
        
        assert result["has_obfuscated_path"] is True
        assert result["severity"] > 0

    def test_random_alphanumeric_detected(self):
        """24+ alphanumeric chars should be detected"""
        url = "https://phishing-kit.com/login/ABCD1234EFGH5678IJKL9012"
        result = detect_uuid_pattern(url)
        
        assert result["has_obfuscated_path"] is True

    def test_no_obfuscation_clean_path(self):
        """Clean paths should not be flagged"""
        url = "https://example.com/api/users/search"
        result = detect_uuid_pattern(url)
        
        assert result["has_obfuscated_path"] is False
        assert len(result["matched_segments"]) == 0


class TestPathRiskAdjustment:
    """Test path-based risk adjustment"""

    def test_obfuscated_path_untrusted_domain(self):
        """Obfuscated paths on untrusted domains should increase risk"""
        url = "https://malware.ru/download/abcdef0123456789abcdef0123456789"
        risk = 0.50
        reasons = []
        
        adjusted, reasons_out = adjust_path_risk(url, risk, reasons, trusted_domain=False)
        
        assert adjusted > risk  # Risk should increase
        assert any("Obfuscated path" in r for r in reasons_out)

    def test_obfuscated_path_trusted_domain(self):
        """Obfuscated paths on trusted domains should have softened penalty"""
        url = "https://chatgpt.com/c/69dbaed9-2f40-8322-a869-59b560ff29ad"
        risk = 0.50
        reasons = []
        
        adjusted, reasons_out = adjust_path_risk(url, risk, reasons, trusted_domain=True)
        
        # Should be increased but less aggressively
        assert adjusted > risk
        assert adjusted < risk + 0.20  # Softened penalty
        assert any("penalty softened for trusted domain" in r for r in reasons_out)

    def test_clean_path_no_adjustment(self):
        """Clean paths should not be adjusted"""
        url = "https://example.com/api/users"
        risk = 0.50
        reasons = []
        
        adjusted, reasons_out = adjust_path_risk(url, risk, reasons, trusted_domain=False)
        
        assert adjusted == risk


class TestThresholdClassification:
    """Test classify_with_uncertainty with threshold+margin behavior."""

    def test_safe_classification(self):
        """Risk < 0.45 should be safe"""
        thresholds = Thresholds(mid=0.45, high=0.70)
        
        assert classify_with_uncertainty(0.30, thresholds) == "safe"
        assert classify_with_uncertainty(0.44, thresholds) == "safe"

    def test_suspicious_classification(self):
        """Risk between 0.45-0.70 should be suspicious"""
        thresholds = Thresholds(mid=0.45, high=0.70)
        
        assert classify_with_uncertainty(0.45, thresholds) == "suspicious"
        assert classify_with_uncertainty(0.50, thresholds) == "suspicious"
        assert classify_with_uncertainty(0.70, thresholds) == "suspicious"

    def test_phishing_classification(self):
        """Risk must exceed threshold + margin to be phishing."""
        thresholds = Thresholds(mid=0.45, high=0.70)
        
        assert classify_with_uncertainty(0.71, thresholds) == "suspicious"
        assert classify_with_uncertainty(0.73, thresholds) == "suspicious"
        assert classify_with_uncertainty(0.731, thresholds) == "phishing"
        assert classify_with_uncertainty(0.95, thresholds) == "phishing"

    def test_boundary_stability(self):
        """Classification should be stable at boundaries"""
        thresholds = Thresholds(mid=0.45, high=0.70)
        
        # Just below boundaries
        assert classify_with_uncertainty(0.449, thresholds) == "safe"
        assert classify_with_uncertainty(0.699, thresholds) == "suspicious"
        
        # At and above boundaries
        assert classify_with_uncertainty(0.450, thresholds) == "suspicious"
        assert classify_with_uncertainty(0.701, thresholds) == "suspicious"


class TestTrustedConversationPathRegression:
    """Regression tests for trusted and untrusted URL behavior."""

    def test_chatgpt_uuid_path_not_phishing(self):
        url = "https://chatgpt.com/c/69dbaed9-2f40-8322-a869-59b560ff29ad"
        result = compute_risk_score(url)

        assert result["label"] in {"safe", "suspicious", "phishing"}
        assert any("Trusted domain risk adjustment applied" in reason for reason in result["override_reasons"])

    def test_trusted_domain_with_strong_signals_has_no_trust_reason(self):
        url = "http://login.google.com/verify/account"
        result = compute_risk_score(url)

        assert not any("Trusted domain risk adjustment applied" in reason for reason in result["override_reasons"])
        assert result["label"] in {"suspicious", "phishing"}

    def test_untrusted_uuid_path_still_high_risk(self):
        url = "https://phishing-example.ru/login/69dbaed9-2f40-8322-a869-59b560ff29ad"
        result = compute_risk_score(url)

        assert result["label"] in {"suspicious", "phishing"}
        assert result["risk_score"] >= 0.45

    def test_trusted_tracking_query_not_phishing(self):
        url = (
            "https://chatgpt.com/?utm_source=microsoft&utm_medium=paid_search"
            "&utm_campaign=MSFT_C_SEM_BBR_Core_CHT_BAU_ACQ_PER_MIX_ALL_APAC_IN_EN_110625"
            "&c_id=570613014&c_agid=1175379920558659"
            "&c_kwid=kwd-73461689170595:loc-90&c_pms=155620&c_nw=o&c_dvc=c"
            "&msclkid=9082d121f1db12442f52b8c7bdf6d07b"
        )
        result = compute_risk_score(url)

        assert result["label"] == "safe"
        assert any("Tracking query pattern on trusted domain" in reason for reason in result["override_reasons"])
        assert any("Trusted root tracking URL risk normalization" in reason for reason in result["override_reasons"])
        assert not any("Very long URL" in reason for reason in result["override_reasons"])


class TestTrustedDomainAdditionalRegression:
    def test_example_com_reserved_domain_is_safe(self):
        """Reserved/documentation domains should be explicitly safe."""
        url = "https://example.com"
        result = compute_risk_score(url)

        assert result["label"] == "safe"
        assert result["risk_score"] == 0.0
        assert any("Reserved/documentation domain" in reason for reason in result["override_reasons"])

    def test_whatsapp_invite_not_phishing(self):
        url = "https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrStUvWxYz123456"
        result = compute_risk_score(url)

        assert result["label"] in {"safe", "suspicious"}
        assert any("Trusted domain risk adjustment applied" in reason for reason in result["override_reasons"])

    def test_amazon_legit_path_trust_reason_present(self):
        url = "https://www.amazon.com/gp/help/customer/display.html"
        result = compute_risk_score(url)

        assert result["label"] in {"safe", "suspicious"}
        assert any("Trusted domain risk adjustment applied" in reason for reason in result["override_reasons"])

    def test_untrusted_long_url_remains_high_risk(self):
        url = (
            "https://fake-bing-login.ru/very/long/path/"
            "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef/"
            "tracking/segment/that/makes/this/url/long/enough/for/the/override"
        )
        result = compute_risk_score(url)

        assert result["label"] in {"suspicious", "phishing"}
        assert any("Very long URL" in reason for reason in result["override_reasons"])


class TestLowSignalNormalization:
    def test_linkedin_clean_https_is_safe(self):
        result = engine.analyze_url("https://linkedin.com", model_type="rf", user_id="test")

        assert result["label"] == "safe"
        assert result["risk_score"] <= 0.44

    def test_phishing_control_still_phishing(self):
        result = compute_risk_score("http://paypa1-verification-login.tk/account/update")

        assert result["label"] == "phishing"
        assert result["risk_score"] >= 0.90

    def test_real_hyphenated_comparison_url_not_phishing(self):
        url = "https://www.bikewale.com/compare-bikes/bmw-f-450-gs-vs-ktm-390-adventure-s/?source=3"
        result = engine.analyze_url(url, model_type="rf", user_id="test")

        assert result["label"] == "safe"
        assert result["risk_score"] <= 0.44
        assert any("Human-readable slug normalization" in reason for reason in result["reasons"])

    def test_flowcv_readable_path_url_is_safe(self):
        url = "https://app.flowcv.com/resume/content"
        result = engine.analyze_url(url, model_type="rf", user_id="test")

        assert result["label"] == "safe"
        assert result["risk_score"] <= 0.44
        assert any("Readable-path HTTPS normalization" in reason for reason in result["reasons"])


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
