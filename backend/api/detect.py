from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from ..runtime import engine


router = APIRouter()


class UrlDetectionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    url: str = Field(..., min_length=4, description="URL to analyze")
    model_type: str = Field(default="rf", description="Model selector: rf or xgb")
    user_id: str = Field(default="anonymous", description="Optional user identifier for ledger traceability")

@router.post("/url")
def detect_url(payload: UrlDetectionRequest):
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="url cannot be empty")
    if " " in url:
        raise HTTPException(status_code=400, detail="url cannot contain spaces")

    model_type = payload.model_type.strip().lower()
    if model_type not in {"rf", "xgb"}:
        model_type = "rf"

    user_id = payload.user_id.strip() if payload.user_id else "anonymous"
    result = engine.analyze_url(url, model_type=model_type, user_id=user_id)
    return result