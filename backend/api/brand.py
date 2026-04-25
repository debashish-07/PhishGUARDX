from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from ..brand_scan import scan_brand_domain

router = APIRouter()


class BrandScanRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    domain: str = Field(..., min_length=3, description="Brand domain, e.g., linkedin.com")
    model_type: str = Field(default="rf", description="Model selector: rf or xgb")


@router.post("/scan-brand")
def scan_brand(payload: BrandScanRequest):
    domain = payload.domain.strip().lower()
    if not domain:
        raise HTTPException(status_code=400, detail="domain cannot be empty")
    if " " in domain:
        raise HTTPException(status_code=400, detail="domain cannot contain spaces")

    model_type = payload.model_type.strip().lower()
    if model_type not in {"rf", "xgb"}:
        model_type = "rf"

    results = scan_brand_domain(domain, model_type=model_type)
    return {"domain": domain, "count": len(results), "results": results}
