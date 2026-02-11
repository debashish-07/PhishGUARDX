import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generatePdfReport(input: {
  url: string;
  score: number;
  reasons: string[];
}): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { url, score, reasons } = input;
  page.drawText('Phishing Risk Report', { x: 50, y: 740, size: 20, font, color: rgb(0, 0, 0) });
  page.drawText(`URL: ${url}`, { x: 50, y: 710, size: 12, font });
  page.drawText(`Risk Score: ${score}/100`, { x: 50, y: 690, size: 12, font, color: rgb(score/100, 0, 0) });

  let y = 660;
  page.drawText('Reasons:', { x: 50, y, size: 14, font });
  y -= 20;
  for (const r of reasons.slice(0, 20)) {
    page.drawText(`• ${r}`.slice(0, 100), { x: 60, y, size: 11, font });
    y -= 16;
    if (y < 60) break;
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}


