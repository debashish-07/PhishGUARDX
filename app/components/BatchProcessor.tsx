'use client';

import { useState, useEffect } from 'react';
import { BatchJob } from '../utils/batchProcessor';

interface BatchProcessorProps {
  job: BatchJob;
  onScanUrl: (url: string) => Promise<any>;
  onComplete: () => void;
}

export function BatchProcessor({ job, onScanUrl, onComplete }: BatchProcessorProps) {
  const [currentJob, setCurrentJob] = useState(job);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentJob.status === 'pending') {
      processNextUrl();
    }
  }, [currentJob.status]);

  const processNextUrl = async () => {
    if (currentIndex >= currentJob.urls.length) {
      setCurrentJob(prev => ({ ...prev, status: 'completed', completedAt: Date.now() }));
      onComplete();
      return;
    }

    const url = currentJob.urls[currentIndex];
    setCurrentJob(prev => ({ ...prev, status: 'processing' }));

    try {
      const result = await onScanUrl(url);
      setCurrentJob(prev => ({
        ...prev,
        results: [...prev.results, {
          url,
          score: result.score * 100,
          verdict: result.score > 0.7 ? 'phishing' : result.score > 0.4 ? 'suspicious' : 'safe',
        }],
        progress: ((currentIndex + 1) / prev.urls.length) * 100,
      }));
    } catch (error) {
      setCurrentJob(prev => ({
        ...prev,
        results: [...prev.results, {
          url,
          score: 0,
          verdict: 'error',
          error: String(error),
        }],
        progress: ((currentIndex + 1) / prev.urls.length) * 100,
      }));
    }

    setCurrentIndex(prev => prev + 1);
    setTimeout(processNextUrl, 1000); // Delay between requests
  };

  return (
    <div className="p-6 glass rounded-xl border border-purple-500/30 mb-6">
      <h3 className="text-xl font-bold text-purple-400 mb-4">⚡ Batch Processing</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{currentIndex} / {currentJob.urls.length} URLs processed</span>
          <span>{currentJob.progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all"
            style={{ width: `${currentJob.progress}%` }}
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {currentJob.results.map((result, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${
              result.verdict === 'phishing' ? 'bg-red-500/10 border-red-500/50' :
              result.verdict === 'suspicious' ? 'bg-yellow-500/10 border-yellow-500/50' :
              result.verdict === 'safe' ? 'bg-green-500/10 border-green-500/50' :
              'bg-gray-500/10 border-gray-500/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs text-white truncate flex-1">{result.url}</span>
              <span className="text-xs ml-2">{result.score.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      {currentJob.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-center">
          <span className="text-green-400">✓ Batch processing completed</span>
        </div>
      )}
    </div>
  );
}
