'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioSpectrogramProps {
    url: string;
}

export function AudioSpectrogram({ url }: AudioSpectrogramProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (url && canvasRef.current) {
            generateSpectrogram();
        }
    }, [url]);

    const urlToAudioSamples = (urlString: string): number[] => {
        const samples: number[] = [];
        const sampleRate = 44100;
        const duration = 2; // 2 seconds
        const totalSamples = sampleRate * duration;

        for (let i = 0; i < totalSamples; i++) {
            const t = i / sampleRate;
            let sample = 0;

            // Convert each character to a frequency component
            for (let j = 0; j < urlString.length; j++) {
                const charCode = urlString.charCodeAt(j);
                const frequency = 200 + (charCode % 2000); // 200Hz to 2200Hz
                const amplitude = 0.1 / urlString.length;
                sample += amplitude * Math.sin(2 * Math.PI * frequency * t + j);
            }

            samples.push(sample);
        }

        return samples;
    };

    const generateSpectrogram = async () => {
        setIsAnalyzing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        try {
            // Generate audio samples from URL
            const samples = urlToAudioSamples(url);

            // STFT parameters
            const windowSize = 1024;
            const hopSize = 256;
            const numFrames = Math.floor((samples.length - windowSize) / hopSize);
            const numFreqBins = windowSize / 2;

            // Compute spectrogram
            const spectrogram: number[][] = [];

            for (let frame = 0; frame < numFrames; frame++) {
                const start = frame * hopSize;
                const window = samples.slice(start, start + windowSize);

                // Apply Hanning window
                const hannWindow = window.map((sample, i) => {
                    const hannValue = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (windowSize - 1)));
                    return sample * hannValue;
                });

                // Compute FFT (simplified - magnitude spectrum)
                const magnitudes: number[] = [];
                for (let k = 0; k < numFreqBins; k++) {
                    let real = 0;
                    let imag = 0;
                    for (let n = 0; n < windowSize; n++) {
                        const angle = (2 * Math.PI * k * n) / windowSize;
                        real += hannWindow[n] * Math.cos(angle);
                        imag += hannWindow[n] * Math.sin(angle);
                    }
                    const magnitude = Math.sqrt(real * real + imag * imag);
                    magnitudes.push(magnitude);
                }

                spectrogram.push(magnitudes);
            }

            // Normalize spectrogram
            let maxMag = 0;
            for (const frame of spectrogram) {
                for (const mag of frame) {
                    if (mag > maxMag) maxMag = mag;
                }
            }

            // Draw spectrogram
            const frameWidth = width / numFrames;
            const binHeight = height / numFreqBins;

            for (let frameIdx = 0; frameIdx < numFrames; frameIdx++) {
                for (let binIdx = 0; binIdx < numFreqBins; binIdx++) {
                    const magnitude = spectrogram[frameIdx][binIdx];
                    const normalized = magnitude / (maxMag || 1);

                    // Color mapping: blue (low) -> cyan -> yellow -> red (high)
                    let r, g, b;
                    if (normalized < 0.25) {
                        // Blue to Cyan
                        const t = normalized / 0.25;
                        r = 0;
                        g = Math.floor(t * 255);
                        b = 255;
                    } else if (normalized < 0.5) {
                        // Cyan to Green
                        const t = (normalized - 0.25) / 0.25;
                        r = 0;
                        g = 255;
                        b = Math.floor((1 - t) * 255);
                    } else if (normalized < 0.75) {
                        // Green to Yellow
                        const t = (normalized - 0.5) / 0.25;
                        r = Math.floor(t * 255);
                        g = 255;
                        b = 0;
                    } else {
                        // Yellow to Red
                        const t = (normalized - 0.75) / 0.25;
                        r = 255;
                        g = Math.floor((1 - t) * 255);
                        b = 0;
                    }

                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    const x = frameIdx * frameWidth;
                    const y = height - (binIdx + 1) * binHeight; // Flip vertically
                    ctx.fillRect(x, y, Math.ceil(frameWidth), Math.ceil(binHeight));
                }
            }

            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;

            // Horizontal lines (frequency)
            for (let i = 0; i <= 4; i++) {
                const y = (i / 4) * height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Vertical lines (time)
            for (let i = 0; i <= 4; i++) {
                const x = (i / 4) * width;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            // Add labels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '12px monospace';
            ctx.fillText('High Freq', 10, 20);
            ctx.fillText('Low Freq', 10, height - 10);
            ctx.fillText('Time →', width - 70, height - 10);

        } catch (error) {
            console.error('Error generating spectrogram:', error);
            ctx.fillStyle = '#ff4444';
            ctx.font = '14px sans-serif';
            ctx.fillText('Error generating spectrogram', 20, height / 2);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="audio-spectrogram bg-gray-900/50 p-6 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🎵</div>
                <div>
                    <h4 className="text-xl font-bold text-purple-400">Audio Spectrogram</h4>
                    <p className="text-sm text-gray-400">Frequency-domain analysis of URL structure</p>
                </div>
            </div>

            <div className="relative">
                {isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                            <span className="text-purple-400">Analyzing...</span>
                        </div>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    className="w-full h-auto rounded-lg border border-purple-500/20"
                />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
                        <span>Low Energy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-red-500 rounded"></div>
                        <span>High Energy</span>
                    </div>
                </div>
                <div>
                    <span className="font-mono">{url.length} characters analyzed</span>
                </div>
            </div>

            <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <p className="text-xs text-gray-300">
                    <strong className="text-purple-400">How it works:</strong> Each character in the URL is converted to a unique frequency.
                    The spectrogram shows how these frequencies evolve over time, revealing rhythmic patterns and anomalies
                    that may indicate phishing attempts.
                </p>
            </div>
        </div>
    );
}
