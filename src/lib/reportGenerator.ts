// PDF Report Generation using jsPDF

export interface ReportData {
    url: string;
    timestamp: number;
    score: number;
    breakdown: {
        heuristic: number;
        quantum: number;
        visual: number;
        transformer: number;
        ensemble: number;
    };
    explain: {
        attributions: any[];
        heatmap: any[];
    };
    verdict: 'safe' | 'suspicious' | 'phishing';
}

export async function generatePDFReport(data: ReportData): Promise<Blob> {
    // Dynamic import to reduce bundle size
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            return true;
        }
        return false;
    };

    // Helper function to add text with wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * (fontSize * 0.5); // Return height used
    };

    // ===== HEADER =====
    doc.setFillColor(0, 212, 255);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PHISHING DETECTION REPORT', pageWidth / 2, 25, { align: 'center' });

    yPos = 50;

    // ===== URL SECTION =====
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Analyzed URL:', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const urlHeight = addWrappedText(data.url, margin, yPos, pageWidth - 2 * margin, 10);
    yPos += urlHeight + 10;

    // ===== TIMESTAMP =====
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const date = new Date(data.timestamp).toLocaleString();
    doc.text(`Analysis Date: ${date}`, margin, yPos);
    yPos += 15;

    // ===== VERDICT BOX =====
    checkPageBreak(40);

    const verdictColor: [number, number, number] = data.verdict === 'safe' ? [76, 175, 80] :
        data.verdict === 'suspicious' ? [255, 152, 0] :
            [244, 67, 54];

    doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const verdictText = data.verdict === 'safe' ? '✓ SAFE' :
        data.verdict === 'suspicious' ? '⚠ SUSPICIOUS' :
            '⚠ PHISHING DETECTED';
    doc.text(verdictText, pageWidth / 2, yPos + 15, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`Risk Score: ${(data.score * 100).toFixed(1)}%`, pageWidth / 2, yPos + 27, { align: 'center' });

    yPos += 45;

    // ===== MODULE BREAKDOWN =====
    checkPageBreak(80);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detection Module Breakdown', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const modules: Array<{ name: string; weight: string; score: number; color: [number, number, number] }> = [
        { name: 'Heuristics Analysis', weight: '25%', score: data.breakdown.heuristic, color: [33, 150, 243] },
        { name: 'Quantum Hash', weight: '15%', score: data.breakdown.quantum, color: [156, 39, 176] },
        { name: 'Visual DNA', weight: '10%', score: data.breakdown.visual, color: [233, 30, 99] },
        { name: 'Transformer AI', weight: '25%', score: data.breakdown.transformer, color: [255, 193, 7] },
        { name: 'ML Ensemble', weight: '25%', score: data.breakdown.ensemble, color: [76, 175, 80] }
    ];

    modules.forEach((module) => {
        checkPageBreak(20);

        // Module name and weight
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`${module.name} (${module.weight})`, margin + 5, yPos);

        // Score
        doc.setFont('helvetica', 'normal');
        doc.text(`${module.score.toFixed(1)}/100`, pageWidth - margin - 30, yPos);

        yPos += 5;

        // Progress bar
        const barWidth = pageWidth - 2 * margin - 10;
        const barHeight = 6;

        // Background
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(margin + 5, yPos, barWidth, barHeight, 2, 2, 'F');

        // Foreground
        doc.setFillColor(module.color[0], module.color[1], module.color[2]);
        const fillWidth = (module.score / 100) * barWidth;
        doc.roundedRect(margin + 5, yPos, fillWidth, barHeight, 2, 2, 'F');

        yPos += 12;
    });

    yPos += 10;

    // ===== TOP RISK FACTORS =====
    if (data.explain.attributions && data.explain.attributions.length > 0) {
        checkPageBreak(60);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Top Risk Factors', margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const topFactors = data.explain.attributions
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        topFactors.forEach((factor) => {
            checkPageBreak(15);

            const riskLevel = factor.score > 0.7 ? 'High' : factor.score > 0.4 ? 'Medium' : 'Low';
            const riskColor: [number, number, number] = factor.score > 0.7 ? [244, 67, 54] : factor.score > 0.4 ? [255, 152, 0] : [76, 175, 80];

            // Bullet point
            doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
            doc.circle(margin + 3, yPos - 2, 2, 'F');

            // Factor text
            doc.setTextColor(0, 0, 0);
            const factorText = `"${factor.token}" - ${(factor.score * 100).toFixed(0)}% risk (${riskLevel})`;
            doc.text(factorText, margin + 10, yPos);

            yPos += 8;
        });

        yPos += 10;
    }

    // ===== RECOMMENDATIONS =====
    checkPageBreak(80);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Security Recommendations', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const recommendations = data.verdict === 'safe'
        ? [
            'This URL appears to be safe based on our multi-modal analysis.',
            'Always verify the domain matches the official website.',
            'Look for HTTPS and valid SSL certificates.',
            'Be cautious of unexpected emails or messages with links.'
        ]
        : data.verdict === 'suspicious'
            ? [
                'Exercise extreme caution with this URL.',
                'Verify the legitimacy through official channels (phone, official app).',
                'Do NOT enter passwords, credit card numbers, or personal information.',
                'Check for spelling errors in the domain name.',
                'Look for HTTPS and click the padlock to verify the certificate.',
                'When in doubt, navigate to the site directly instead of clicking links.'
            ]
            : [
                'DO NOT VISIT THIS URL - High phishing probability detected.',
                'Do NOT enter any personal information, passwords, or financial data.',
                'Report this URL to your IT security team immediately.',
                'Delete any emails or messages containing this link.',
                'Run a security scan on your device if you visited this site.',
                'Change passwords if you entered credentials on this site.',
                'Monitor your accounts for suspicious activity.'
            ];

    recommendations.forEach((rec) => {
        checkPageBreak(15);

        // Bullet point
        doc.setFillColor(0, 212, 255);
        doc.circle(margin + 3, yPos - 2, 2, 'F');

        // Recommendation text with wrapping
        doc.setTextColor(0, 0, 0);
        const recHeight = addWrappedText(rec, margin + 10, yPos, pageWidth - 2 * margin - 15, 10);
        yPos += recHeight + 5;
    });

    // ===== FOOTER =====
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by Quantum Phishing Detector - Privacy-First Browser Security', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Page 1 of ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });

    return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export async function generateAndDownloadReport(data: ReportData): Promise<void> {
    const blob = await generatePDFReport(data);
    const timestamp = new Date(data.timestamp).toISOString().split('T')[0];
    const filename = `phishing-report-${timestamp}-${Date.now()}.pdf`;
    downloadPDF(blob, filename);
}
