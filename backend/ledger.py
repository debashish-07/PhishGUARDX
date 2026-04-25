from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional


def _canonical_json(data: Dict) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def sha256_hex(payload: str) -> str:
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


@dataclass
class LedgerBlock:
    index: int
    timestamp: str
    url: str
    user_id: Optional[str]
    result: str
    risk_score: float
    previous_hash: str
    block_hash: str


class TrustLedger:
    """Lightweight hash-linked audit trail for detections."""

    def __init__(self, storage_path: Optional[str] = None):
        self.storage_path = Path(storage_path) if storage_path else None
        self.chain: List[LedgerBlock] = []
        if self.storage_path and self.storage_path.exists():
            self._load()
            self.enforce_size_limit(50)

    def _load(self) -> None:
        try:
            data = json.loads(self.storage_path.read_text(encoding="utf-8"))
            hydrated: List[LedgerBlock] = []
            for block in data:
                if "user_id" not in block:
                    block["user_id"] = "anonymous"
                hydrated.append(LedgerBlock(**block))
            self.chain = hydrated
        except Exception:
            self.chain = []

    def _save(self) -> None:
        if not self.storage_path:
            return
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.storage_path.write_text(
            json.dumps([asdict(block) for block in self.chain], indent=2),
            encoding="utf-8",
        )

    def _make_hash(
        self,
        index: int,
        timestamp: str,
        url: str,
        user_id: Optional[str],
        result: str,
        risk_score: float,
        previous_hash: str,
    ) -> str:
        payload = _canonical_json(
            {
                "index": index,
                "timestamp": timestamp,
                "url": url,
                "user_id": user_id or "anonymous",
                "result": result,
                "risk_score": round(risk_score, 4),
                "previous_hash": previous_hash,
            }
        )
        return sha256_hex(payload)

    def append_block(self, url: str, result: str, risk_score: float, user_id: Optional[str] = None) -> LedgerBlock:
        timestamp = datetime.now(timezone.utc).isoformat()
        previous_hash = self.chain[-1].block_hash if self.chain else "0" * 64
        index = len(self.chain)
        normalized_user_id = (user_id or "anonymous").strip() or "anonymous"
        block_hash = self._make_hash(index, timestamp, url, normalized_user_id, result, risk_score, previous_hash)
        block = LedgerBlock(
            index=index,
            timestamp=timestamp,
            url=url,
            user_id=normalized_user_id,
            result=result,
            risk_score=round(risk_score, 4),
            previous_hash=previous_hash,
            block_hash=block_hash,
        )
        self.chain.append(block)
        self._save()
        return block

    def verify_chain(self) -> bool:
        previous_hash = "0" * 64
        for index, block in enumerate(self.chain):
            expected = self._make_hash(
                index,
                block.timestamp,
                block.url,
                block.user_id,
                block.result,
                block.risk_score,
                previous_hash,
            )
            if block.previous_hash != previous_hash or block.block_hash != expected:
                return False
            previous_hash = block.block_hash
        return True

    def enforce_size_limit(self, max_size: int = 50) -> None:
        """Keep only the most recent max_size entries."""
        if len(self.chain) > max_size:
            self.chain = self.chain[-max_size:]
            # Rebuild chain links and hashes for the retained blocks
            previous_hash = "0" * 64
            for idx, block in enumerate(self.chain):
                block.index = idx
                block.previous_hash = previous_hash
                block.block_hash = self._make_hash(
                    idx,
                    block.timestamp,
                    block.url,
                    block.user_id,
                    block.result,
                    block.risk_score,
                    previous_hash,
                )
                previous_hash = block.block_hash
            self._save()

    def latest_hash(self) -> str:
        return self.chain[-1].block_hash if self.chain else "0" * 64

    def snapshot(self) -> List[Dict]:
        return [asdict(block) for block in self.chain]

    def get_recent(self, limit: int = 20) -> List[Dict]:
        """Get the N most recent blocks (newest first)."""
        recent = list(reversed(self.chain[-limit:]))
        return [asdict(b) for b in recent]