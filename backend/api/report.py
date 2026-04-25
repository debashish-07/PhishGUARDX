from __future__ import annotations

import json
from datetime import datetime, timezone
from io import BytesIO

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from ..report import build_pdf_report
from ..runtime import engine


router = APIRouter()


class ReportRequest(BaseModel):
    url: str = Field(..., min_length=4, description="URL to analyze and export as a report")


@router.post("")
def create_report(payload: ReportRequest):
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="url cannot be empty")
    if " " in url:
        raise HTTPException(status_code=400, detail="url cannot contain spaces")

    report = engine.build_report(url)
    filename = f"phishguardx-report-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.json"
    return JSONResponse(
        content=report,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/pdf")
def create_report_pdf(payload: ReportRequest):
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="url cannot be empty")
    if " " in url:
        raise HTTPException(status_code=400, detail="url cannot contain spaces")

    report = engine.build_report(url)
    pdf_bytes = build_pdf_report(report)
    filename = f"phishguardx-report-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )