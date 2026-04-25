import { useCallback, useState } from 'react';

export interface DetectionResult {
    status: string;
    label: 'safe' | 'suspicious' | 'phishing';
    verdict?: 'safe' | 'suspicious' | 'phishing';
    risk_score: number;
    risk?: number;
    risk_level: 'Low' | 'Medium' | 'High';
    confidence: 'Low' | 'Medium' | 'High';
    summary: string;
    reasons: string[];
    explainability?: {
        verdict: 'safe' | 'suspicious' | 'phishing';
        risk: number;
        reasons: string[];
    };
    recommended_action: string;
    block_hash: string;
    user_id?: string;
    ledger_valid: boolean;
    thresholds: {
        mid_threshold: number;
        high_threshold: number;
    };
    signals: {
        ml_probability: number;
        heuristic_risk: number;
        https_present: boolean;
        url_length: number;
        subdomain_depth: number;
        suspicious_token_hits: number;
        keyword_hits?: number;
        structural_hits?: number;
    };
    model_source: string;
}

export function useDetection() {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

    const validateUrl = (input: string): string | null => {
        const normalized = input.trim();
        if (!normalized) {
            return 'Please enter a URL.';
        }

        try {
            const parsed = new URL(normalized);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return 'Only http:// or https:// URLs are supported.';
            }

            const labels = parsed.hostname.split('.');
            if (labels.some((label) => label.length === 0)) {
                return 'Invalid hostname format. Please check the URL.';
            }
        } catch {
            return 'Invalid URL format. Example: https://example.com';
        }

        return null;
    };

    const scanUrl = useCallback(async (url: string) => {
        setIsScanning(true);
        setError(null);
        setResult(null);

        const validationError = validateUrl(url);
        if (validationError) {
            setError(validationError);
            setIsScanning(false);
            return;
        }

        try {
            const response = await fetch(`${backendBase}/api/detect/url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() }),
            });

            if (!response.ok) {
                throw new Error(`Detection failed (${response.status})`);
            }

            const detectionResult = (await response.json()) as DetectionResult;
            setResult(detectionResult);
        } catch (err) {
            if (err instanceof TypeError) {
                setError(`Unable to reach backend at ${backendBase}. Start backend: python backend/run_backend.py`);
            } else {
                setError(err instanceof Error ? err.message : 'Unable to analyze URL right now.');
            }
        } finally {
            setIsScanning(false);
        }
    }, [backendBase]);

    return {
        scanUrl,
        isScanning,
        result,
        error
    };
}
