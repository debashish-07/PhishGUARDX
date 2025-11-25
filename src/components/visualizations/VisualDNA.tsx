'use client';

import React, { useEffect, useRef, useState } from 'react';

interface VisualDNAProps {
    data: number[][];
}

export const VisualDNA: React.FC<VisualDNAProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
    const [isHovering, setIsHovering] = useState(false);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const gridSize = data.length;
        const cellSize = Math.min(width, height) / (gridSize + 2);

        const draw3DHeatmap = (rotX: number, rotY: number) => {
            ctx.clearRect(0, 0, width, height);

            // Create 3D cube layers
            const layers = 3; // Number of depth layers
            const cubes: Array<{ x: number; y: number; z: number; value: number }> = [];

            // Generate 3D cube data
            for (let z = 0; z < layers; z++) {
                for (let y = 0; y < gridSize; y++) {
                    for (let x = 0; x < gridSize; x++) {
                        const value = data[y]?.[x] || 0;
                        cubes.push({ x, y, z, value });
                    }
                }
            }

            // Sort by depth for proper rendering
            cubes.sort((a, b) => {
                const depthA = a.z * Math.cos(rotX) + a.y * Math.sin(rotX);
                const depthB = b.z * Math.cos(rotX) + b.y * Math.sin(rotX);
                return depthA - depthB;
            });

            // Draw each cube
            cubes.forEach(({ x, y, z, value }) => {
                // 3D projection
                const centerX = width / 2;
                const centerY = height / 2;
                const scale = 0.8;
                const perspective = 600;

                // Rotate around Y axis
                const cosY = Math.cos(rotY);
                const sinY = Math.sin(rotY);
                const x1 = x * cosY - z * sinY;
                const z1 = x * sinY + z * cosY;

                // Rotate around X axis
                const cosX = Math.cos(rotX);
                const sinX = Math.sin(rotX);
                const y1 = y * cosX - z1 * sinX;
                const z2 = y * sinX + z1 * cosX;

                // Project to 2D
                const projScale = perspective / (perspective + z2 * cellSize);
                const screenX = centerX + x1 * cellSize * scale * projScale;
                const screenY = centerY + y1 * cellSize * scale * projScale;
                const size = cellSize * scale * projScale;

                // Color based on value (heatmap)
                const hue = 270 - (value * 100); // Purple to red gradient
                const saturation = 70 + (value * 30);
                const lightness = 30 + (value * 40);
                const alpha = 0.6 + (value * 0.4);

                // Draw cube face with gradient
                const gradient = ctx.createRadialGradient(
                    screenX + size / 2,
                    screenY + size / 2,
                    0,
                    screenX + size / 2,
                    screenY + size / 2,
                    size
                );
                gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, ${alpha})`);
                gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);

                ctx.fillStyle = gradient;
                ctx.fillRect(screenX, screenY, size, size);

                // Add border for high-risk cells
                if (value > 0.5) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${value * 0.5})`;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(screenX, screenY, size, size);
                }

                // Add glow effect for very high values
                if (value > 0.7) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = `hsla(${hue}, 100%, 60%, ${value})`;
                    ctx.fillRect(screenX, screenY, size, size);
                    ctx.shadowBlur = 0;
                }
            });

            // Add axis labels
            ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
            ctx.font = '10px monospace';
            ctx.fillText('3D Visual DNA Heatmap', 10, 20);
        };

        // Animation loop
        const animate = () => {
            if (isHovering) {
                setRotation(prev => ({
                    x: prev.x + 0.01,
                    y: prev.y + 0.015
                }));
            }
            draw3DHeatmap(rotation.x, rotation.y);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [data, rotation, isHovering]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setRotation({
            x: (y - 0.5) * Math.PI,
            y: (x - 0.5) * Math.PI
        });
    };

    return (
        <div className="p-4 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-lg border border-purple-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-purple-400 font-mono text-sm font-semibold">
                    🧬 3D Visual DNA Heatmap
                </h3>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-gray-400">Live</span>
                </div>
            </div>

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="w-full h-auto rounded-lg cursor-move bg-black/40"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    style={{
                        maxWidth: '300px',
                        margin: '0 auto',
                        display: 'block'
                    }}
                />

                {/* Heatmap Legend */}
                <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                        <div className="w-12 h-3 rounded" style={{
                            background: 'linear-gradient(to right, hsl(270, 70%, 50%), hsl(0, 100%, 50%))'
                        }}></div>
                        <span className="text-gray-400">Risk Level</span>
                    </div>
                    <div className="text-gray-500">
                        {isHovering ? '🔄 Auto-rotating' : '🖱️ Hover to rotate'}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-black/40 rounded p-2 text-center">
                    <div className="text-purple-400 font-semibold">{data.length}×{data.length}</div>
                    <div className="text-gray-500">Grid Size</div>
                </div>
                <div className="bg-black/40 rounded p-2 text-center">
                    <div className="text-blue-400 font-semibold">3D</div>
                    <div className="text-gray-500">Layers</div>
                </div>
                <div className="bg-black/40 rounded p-2 text-center">
                    <div className="text-cyan-400 font-semibold">
                        {Math.round(data.flat().reduce((a, b) => a + b, 0) / data.flat().length * 100)}%
                    </div>
                    <div className="text-gray-500">Avg Risk</div>
                </div>
            </div>
        </div>
    );
};
