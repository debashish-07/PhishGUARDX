'use client';

import { useEffect, useRef, useState } from 'react';

interface QuantumWaveformProps {
    features: number[];
    riskScore: number;
}

export function QuantumWaveform({ features, riskScore }: QuantumWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || features.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame = 0;
        let animationRunning = true;

        const animate = () => {
            if (!animationRunning || isPaused) return;

            const width = canvas.width;
            const height = canvas.height;

            // Clear canvas with solid background first
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, width, height);

            // Draw grid
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
            ctx.lineWidth = 1;

            // Horizontal grid lines
            for (let i = 0; i <= 4; i++) {
                const y = (i / 4) * height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Center line
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();

            // Calculate color based on risk score
            const hue = (1 - riskScore / 100) * 120; // Green (120) to Red (0)
            const saturation = 80;
            const lightness = 50;

            // Draw primary waveform (quantum superposition)
            ctx.beginPath();
            ctx.lineWidth = 3;

            for (let x = 0; x < width; x++) {
                const t = x / width;
                const featureIndex = Math.floor(t * features.length);
                const amplitude = features[featureIndex] || 0;

                // Quantum-inspired wave equation with multiple harmonics
                const y = height / 2 +
                    amplitude * Math.sin(2 * Math.PI * t * 3 + frame * 0.02) * 60 +
                    amplitude * Math.cos(2 * Math.PI * t * 5 + frame * 0.03) * 40 +
                    amplitude * Math.sin(2 * Math.PI * t * 7 + frame * 0.015) * 20;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`);
            gradient.addColorStop(0.5, `hsla(${hue + 30}, ${saturation}%, ${lightness + 10}%, 1)`);
            gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`);

            ctx.strokeStyle = gradient;
            ctx.stroke();

            // Draw secondary waveform (phase-shifted)
            ctx.beginPath();
            ctx.lineWidth = 2;

            for (let x = 0; x < width; x++) {
                const t = x / width;
                const featureIndex = Math.floor(t * features.length);
                const amplitude = features[featureIndex] || 0;

                const y = height / 2 +
                    amplitude * Math.sin(2 * Math.PI * t * 3 + frame * 0.02 + Math.PI / 4) * 40 +
                    amplitude * Math.cos(2 * Math.PI * t * 5 + frame * 0.03 + Math.PI / 4) * 25;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.strokeStyle = `hsla(${hue + 60}, ${saturation}%, ${lightness}%, 0.4)`;
            ctx.stroke();

            // Draw particles at peaks
            for (let i = 0; i < 20; i++) {
                const x = (i / 20) * width;
                const t = x / width;
                const featureIndex = Math.floor(t * features.length);
                const amplitude = features[featureIndex] || 0;

                const y = height / 2 +
                    amplitude * Math.sin(2 * Math.PI * t * 3 + frame * 0.02) * 60;

                const particleSize = 2 + amplitude * 4;
                const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize);
                particleGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 1)`);
                particleGradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);

                ctx.fillStyle = particleGradient;
                ctx.beginPath();
                ctx.arc(x, y, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw risk indicator
            ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.2)`;
            ctx.fillRect(0, 0, width * (riskScore / 100), 5);

            frame++;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            animationRunning = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [features, riskScore, isPaused]);

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    return (
        <div className="quantum-waveform bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">🌊</div>
                    <div>
                        <h4 className="text-xl font-bold text-cyan-400">Structural Waveform</h4>
                        <p className="text-sm text-gray-400">Phase-encoded structural signature</p>
                    </div>
                </div>
                <button
                    onClick={togglePause}
                    className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm transition-colors"
                >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
            </div>

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={250}
                    className="w-full h-auto rounded-lg border border-cyan-500/20 bg-black"
                />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                    <div className="text-cyan-400 font-semibold mb-1">Feature Dimensions</div>
                    <div className="text-white text-lg">{features.length}</div>
                </div>
                <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                    <div className="text-cyan-400 font-semibold mb-1">Avg Amplitude</div>
                    <div className="text-white text-lg">
                        {features.length > 0
                            ? (features.reduce((a, b) => a + b, 0) / features.length).toFixed(3)
                            : '0.000'
                        }
                    </div>
                </div>
                <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                    <div className="text-cyan-400 font-semibold mb-1">Risk Level</div>
                    <div className="text-white text-lg">{riskScore.toFixed(1)}%</div>
                </div>
            </div>

            <div className="mt-4 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                <p className="text-xs text-gray-300">
                    <strong className="text-cyan-400">Structural Signature:</strong> The waveform represents the structured
                    feature vector as a layered combination of harmonic frequencies. Peaks and troughs indicate structural
                    anomalies in the URL, while the color gradient reflects the overall risk assessment.
                </p>
            </div>
        </div>
    );
}
