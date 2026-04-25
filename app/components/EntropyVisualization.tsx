'use client';

import { useEffect, useRef } from 'react';

interface EntropyVisualizationProps {
  url: string;
  className?: string;
}

export function EntropyVisualization({ url, className = '' }: EntropyVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, width, height);

    // Calculate entropy for each character position
    const entropies: number[] = [];
    const windowSize = 4;

    for (let i = 0; i < url.length - windowSize + 1; i++) {
      const window = url.substring(i, i + windowSize);
      const freq: Record<string, number> = {};

      for (const char of window) {
        freq[char] = (freq[char] || 0) + 1;
      }

      let entropy = 0;
      for (const count of Object.values(freq)) {
        const p = count / windowSize;
        entropy -= p * Math.log2(p);
      }

      entropies.push(entropy);
    }

    // Normalize entropies
    const maxEntropy = Math.max(...entropies, 1);
    const normalized = entropies.map(e => e / maxEntropy);

    // Draw entropy bars
    const barWidth = Math.max(1, width / normalized.length);
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff8855';
    ctx.shadowBlur = 10;

    normalized.forEach((entropy, i) => {
      const x = (i / normalized.length) * width;
      const barHeight = entropy * height * 0.8;
      const y = height - barHeight;

      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Draw grid
    ctx.strokeStyle = '#22d3ee22';
    ctx.lineWidth = 1;

    // Vertical gridlines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal gridlines
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0', 5, height - 5);
    ctx.fillText(`${maxEntropy.toFixed(1)}`, 5, 15);

  }, [url]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className={`w-full border border-cyan-500/30 rounded-lg bg-gray-900/50 ${className}`}
    />
  );
}
