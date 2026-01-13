'use client';

import { useState, useEffect, useRef } from 'react';

interface QRScannerProps {
  onScan: (url: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        scanQRCode();
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Camera error:', err);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // In a real implementation, you'd use a QR code library here
      // For now, this is a placeholder structure
    }
    
    if (scanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleManualInput = () => {
    const url = prompt('Enter URL manually:');
    if (url && url.match(/^https?:\/\//i)) {
      onScan(url);
      stopScanner();
      onClose();
    } else if (url) {
      alert('Please enter a valid URL starting with http:// or https://');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cyan-400">📱 Scan QR Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg mb-4">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-xs text-gray-400 mt-2">Use manual entry instead</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg mb-4 bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleManualInput}
            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm transition-colors"
          >
            📝 Manual Entry
          </button>
          <button
            onClick={() => { stopScanner(); onClose(); }}
            className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded text-red-400 text-sm transition-colors"
          >
            Close
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Point your camera at a QR code containing a URL
        </p>
      </div>
    </div>
  );
}
