from __future__ import annotations

from io import BytesIO
from typing import Any, Dict

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def build_pdf_report(report_data: Dict[str, Any]) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40,
        title="PhishGuardX Analysis Report",
    )

    styles = getSampleStyleSheet()
    title = styles["Title"]
    body = styles["BodyText"]

    story = [
        Paragraph("PhishGuardX Analysis Report", title),
        Spacer(1, 14),
    ]

    rows = [
        ["URL", str(report_data.get("url", "-"))],
        ["Result", str(report_data.get("status", report_data.get("result", "-")))],
        ["Risk Score", str(report_data.get("risk_score", "-"))],
        ["Risk Level", str(report_data.get("risk_level", "-"))],
        ["Summary", str(report_data.get("summary", "-"))],
        ["Recommended Action", str(report_data.get("action", "-"))],
        ["Timestamp", str(report_data.get("timestamp", "-"))],
        ["Block Hash", str(report_data.get("block_hash", "-"))],
    ]

    table = Table(rows, colWidths=[140, 360])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.extend([table, Spacer(1, 12)])

    reasons = report_data.get("reasons") or []
    story.append(Paragraph("Reasons", styles["Heading3"]))
    if reasons:
        for reason in reasons:
            story.append(Paragraph(f"- {reason}", body))
    else:
        story.append(Paragraph("- No strong phishing indicators.", body))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
