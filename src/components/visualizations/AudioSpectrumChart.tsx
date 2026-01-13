'use client';

import { useEffect, useRef } from 'react';

interface AudioSpectrumProps {
  audioData?: number[];
  className?: string;
}

export function AudioSpectrumChart({ audioData = [], className = '' }: AudioSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fallback: generate a pseudo spectrum if no audio data provided
    const data: number[] = (audioData && audioData.length > 0)
      ? audioData
      : Array.from({ length: 64 }, (_, i) => {
          const base = Math.sin(i / 6) * 0.5 + 0.5;
          const noise = (Math.random() - 0.5) * 0.2;
          return Math.max(0.05, base + noise);
        });

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, chartWidth, chartHeight);

    // Find max value for scaling
    const maxValue = Math.max(...data, 1);

    // Draw frequency bins
    const barWidth = chartWidth / data.length;
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#ff00ff');
    gradient.addColorStop(1, '#ff0080');

    data.forEach((value, index) => {
      const normalizedValue = value / maxValue;
      const barHeight = normalizedValue * chartHeight;
      const x = padding + index * barWidth;
      const y = height - padding - barHeight;

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
      ctx.globalAlpha = 1;
    });

    // Draw axes labels
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let i = 0; i < data.length; i += Math.ceil(data.length / 4)) {
      const x = padding + (i * barWidth) + barWidth / 2;
      ctx.fillText(`${i}`, x, height - padding + 20);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = height - padding - (i * chartHeight / 5);
      const value = ((i / 5) * maxValue).toFixed(2);
      ctx.fillText(value, padding - 10, y + 5);
    }

    // Labels
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Audio Frequency Spectrum', width / 2, 20);
    ctx.font = '12px monospace';
    ctx.fillText('Frequency Bin', width / 2, height - 10);

    ctx.textAlign = 'right';
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Magnitude', 0, 0);
    ctx.restore();
  }, [audioData]);

  return (
    <div className={`${className}`}>
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="w-full border border-cyan-500/30 rounded-lg bg-black"
      />
    </div>
  );
}
