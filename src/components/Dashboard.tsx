import React, { useState } from 'react';
import type { DetectionResult } from '@/src/hooks/useDetection';
import { LedgerTable } from './LedgerTable';

interface DashboardProps {
    url: string;
    result: DetectionResult | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ result, url }) => {
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    if (!result) return null;

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${backendBase}/api/report/pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error(`Report generation failed (${response.status})`);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `phishguardx-report-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const riskPercent = (result.risk_score * 100).toFixed(1);

    return (
        <div id="dashboard" className="mt-4 space-y-4" data-testid="dashboard-ready">
            <div className="rounded border border-slate-300 bg-white p-6">
                <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Risk Assessment</div>
                <div className="mb-3 text-4xl font-semibold sm:text-5xl">
                    <span className={
                        result.label === 'phishing' ? 'text-red-500' :
                            result.label === 'suspicious' ? 'text-yellow-500' :
                                'text-green-500'
                    }>
                        {riskPercent}%
                    </span>
                </div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-700" data-testid="analysis-complete-badge">
                    <span>✓ Analysis Complete</span>
                </div>
                <div className="mb-2 text-2xl sm:text-3xl">
                    <span className="font-semibold text-slate-900">{result.status}</span>
                </div>
                <p className="mb-2 text-base text-slate-700">{result.summary}</p>
                <p className="text-sm text-slate-600">Recommended action: {result.recommended_action}</p>

                <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="mt-4 rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    {isGeneratingReport ? 'Generating PDF...' : 'Download PDF Report'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="analysis-complete">
                <div className="rounded border border-slate-300 bg-white p-5">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Decision Summary</h3>
                    <div className="space-y-1.5 text-sm text-slate-700">
                        <p><span className="text-slate-500">Risk level:</span> {result.risk_level}</p>
                        <p><span className="text-slate-500">Confidence:</span> {result.confidence}</p>
                        <p><span className="text-slate-500">Model source:</span> {result.model_source}</p>
                        <p><span className="text-slate-500">Ledger:</span> {result.ledger_valid ? 'Valid' : 'Invalid'}</p>
                    </div>
                </div>
                <div className="rounded border border-slate-300 bg-white p-5">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Top Reasons</h3>
                    <ul className="space-y-1.5 text-sm text-slate-700">
                        {result.reasons.slice(0, 3).map((reason, idx) => (
                            <li key={`${reason}-${idx}`} className="flex items-start gap-2">
                                <span className="text-slate-500">•</span>
                                <span>{reason}</span>
                            </li>
                        ))}
                        {result.reasons.length === 0 && <li>No strong phishing indicators.</li>}
                    </ul>
                </div>
            </div>

            <div className="rounded border border-slate-300 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Core Signals</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 md:grid-cols-3">
                    <div>ML probability: {result.signals.ml_probability.toFixed(4)}</div>
                    <div>Heuristic risk: {result.signals.heuristic_risk.toFixed(4)}</div>
                    <div>HTTPS present: {result.signals.https_present ? 'Yes' : 'No'}</div>
                    <div>URL length: {result.signals.url_length}</div>
                    <div>Subdomain depth: {result.signals.subdomain_depth}</div>
                    <div>Keyword hits: {result.signals.keyword_hits ?? result.signals.suspicious_token_hits}</div>
                    <div>Structural flags: {result.signals.structural_hits ?? 0}</div>
                </div>
                <p className="mt-4 break-all text-xs text-slate-500">Block hash: {result.block_hash}</p>
            </div>

            <div className="rounded border border-slate-300 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Trust Ledger Audit Trail</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p><span className="text-slate-500">Chain status:</span> {result.ledger_valid ? 'Valid' : 'Invalid'}</p>
                    <p className="break-all"><span className="text-slate-500">Current block hash:</span> {result.block_hash}</p>
                </div>
            </div>

            <LedgerTable showLimit={20} />
        </div>
    );
};
