'use client';

import { useState, useCallback } from 'react';
import { parseBatchFile, BatchJob, createBatchJob } from '../utils/batchProcessor';

interface BatchUploaderProps {
  onJobCreated: (job: BatchJob) => void;
}

export function BatchUploader({ onJobCreated }: BatchUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(csv|txt)$/i)) {
      alert('Please upload a CSV or TXT file');
      return;
    }

    setProcessing(true);
    try {
      const urls = await parseBatchFile(file);
      if (urls.length === 0) {
        alert('No valid URLs found in file');
        return;
      }
      const job = createBatchJob(urls);
      onJobCreated(job);
    } catch (error) {
      console.error('Failed to parse file:', error);
      alert('Failed to parse file');
    } finally {
      setProcessing(false);
    }
  }, [onJobCreated]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="p-6 glass rounded-xl border border-purple-500/30 mb-6">
      <h3 className="text-xl font-bold text-purple-400 mb-4">📦 Batch URL Analysis</h3>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 bg-gray-800/30'
        }`}
      >
        <div className="text-4xl mb-4">{processing ? '⏳' : '📤'}</div>
        <p className="text-gray-300 mb-2">
          {processing ? 'Processing file...' : 'Drag & drop CSV/TXT file here'}
        </p>
        <p className="text-xs text-gray-500 mb-4">or</p>
        <label className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded cursor-pointer transition-colors">
          Choose File
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileInput}
            className="hidden"
            disabled={processing}
          />
        </label>
        <p className="text-xs text-gray-500 mt-4">
          Supported formats: CSV, TXT (one URL per line)
        </p>
      </div>
    </div>
  );
}
