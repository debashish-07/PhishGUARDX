"use client";

import Link from "next/link";
import { useState } from "react";
import { useDetection } from "@/src/hooks/useDetection";
import { Dashboard } from "@/src/components/Dashboard";

export default function Page() {
  const [url, setUrl] = useState("https://example.com");
  const { scanUrl, isScanning, result, error } = useDetection();

  const handleAnalyze = async () => {
    if (!url) return;
    await scanUrl(url);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4">
          <header>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">PhishGuardX</h1>
                <p className="mt-1 text-base text-slate-600 sm:text-lg">URL Scanner</p>
              </div>
              <Link href="/dashboard" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Dashboard
              </Link>
            </div>
          </header>

          <section id="scanner" className="rounded-md border border-slate-300 bg-white p-5 sm:p-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">URL</label>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAnalyze();
                  }
                }}
                placeholder="https://example.com"
                className="w-full rounded border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500"
              />
              <button
                onClick={handleAnalyze}
                disabled={isScanning}
                className="rounded bg-blue-700 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isScanning ? "Scanning..." : "Scan URL"}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
          </section>

          {result && <Dashboard result={result} url={url} />}
        </div>
      </section>
    </main>
  );
}
