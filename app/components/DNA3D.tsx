'use client';

import { useEffect, useRef, useState } from 'react';
import { createDNA3DVisualization } from '@/lib/visual3d';

interface DNA3DProps {
  input: string;
  className?: string;
  width?: number;
  height?: number;
}

export function DNA3D({ input, className = '', width = 400, height = 400 }: DNA3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ReturnType<typeof createDNA3DVisualization> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !input) return;

    try {
      setIsLoading(true);
      setError(null);

      // Dispose previous scene if it exists
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }

      // Create new scene
      sceneRef.current = createDNA3DVisualization(canvasRef.current, input);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to create 3D structure visualization:', err);
      setError(err instanceof Error ? err.message : 'Failed to render 3D visualization');
      setIsLoading(false);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [input]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full rounded-lg border border-cyan-500/30 bg-black"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-cyan-400 animate-pulse">Generating 3D structure...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      )}
    </div>
  );
}
