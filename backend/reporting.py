from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict


def build_report_payload(result: Dict[str, Any], url: str) -> Dict[str, Any]:
    verdict = result.get("verdict") or result.get("label")
    risk = result.get("risk") if result.get("risk") is not None else result.get("risk_score")
    reasons = result.get("reasons", [])
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "url": url,
        "result": verdict,
        "verdict": verdict,
        "risk": risk,
        "risk_score": risk,
        "reasons": reasons,
        "explainability": {
            "verdict": verdict,
            "risk": risk,
            "reasons": reasons,
        },
        "action": result.get("recommended_action"),
        "block_hash": result.get("block_hash"),
        "status": result.get("status"),
        "risk_level": result.get("risk_level"),
        "confidence": result.get("confidence"),
        "summary": result.get("summary"),
    }