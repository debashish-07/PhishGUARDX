from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter

from ..runtime import engine

router = APIRouter()


@router.get("/")
def get_audit_trail() -> Dict[str, Any]:
    """Fetch full audit trail with chain verification."""
    ledger = engine.ledger
    is_valid = ledger.verify_chain()
    blocks = ledger.snapshot()
    tamper_alert = {
        "detected": not is_valid,
        "severity": "high" if not is_valid else "none",
        "message": "Potential tampering detected in trust ledger" if not is_valid else "No tampering detected",
    }
    
    return {
        "chain_valid": is_valid,
        "tamper_alert": tamper_alert,
        "total_blocks": len(blocks),
        "latest_hash": ledger.latest_hash(),
        "blocks": list(reversed(blocks)),
    }


@router.post("/verify")
def verify_chain_integrity() -> Dict[str, Any]:
    """Verify chain integrity and return status."""
    ledger = engine.ledger
    is_valid = ledger.verify_chain()
    
    if not is_valid:
        return {
            "status": "TAMPERED",
            "valid": False,
            "message": "Chain integrity check failed - potential tampering detected",
            "tamper_alert": {
                "detected": True,
                "severity": "high",
                "message": "Potential tampering detected in trust ledger",
            },
        }
    
    return {
        "status": "VALID",
        "valid": True,
        "message": "Chain integrity verified",
        "tamper_alert": {
            "detected": False,
            "severity": "none",
            "message": "No tampering detected",
        },
        "total_blocks": len(ledger.chain),
        "latest_hash": ledger.latest_hash()
    }


@router.get("/export")
def export_ledger() -> Dict[str, Any]:
    """Export full ledger as JSON."""
    ledger = engine.ledger
    is_valid = ledger.verify_chain()
    return {
        "chain_valid": is_valid,
        "tamper_alert": {
            "detected": not is_valid,
            "severity": "high" if not is_valid else "none",
            "message": "Potential tampering detected in trust ledger" if not is_valid else "No tampering detected",
        },
        "export_timestamp": datetime.now(timezone.utc).isoformat(),
        "blocks": ledger.snapshot()
    }


@router.post("/clear")
def clear_ledger() -> Dict[str, str]:
    """Clear ledger (admin only in production)."""
    engine.ledger.chain = []
    engine.ledger._save()
    return {"status": "ledger cleared", "message": "All audit trail entries have been removed"}
