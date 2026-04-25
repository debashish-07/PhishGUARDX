"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BrandResult = {
  domain: string;
  type: string;
  risk_score: number;
  verdict: "safe" | "suspicious" | "phishing";
  reasons: string[];
  ip: string;
  mx: boolean;
  ssl: boolean;
};

export default function DashboardPage() {
  const [domain, setDomain] = useState("linkedin.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<BrandResult[]>([]);

  const summary = useMemo(() => {
    const phishing = rows.filter((r) => r.verdict === "phishing").length;
    const suspicious = rows.filter((r) => r.verdict === "suspicious").length;
    const safe = rows.filter((r) => r.verdict === "safe").length;
    return { total: rows.length, phishing, suspicious, safe };
  }, [rows]);

  const runScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${backendBase}/api/scan-brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Brand scan failed (${res.status})`);
      }

      const payload = await res.json();
      setRows(payload.results || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to scan brand right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">PhishGuardX Dashboard</h1>
              <p className="mt-1 text-base text-slate-600 sm:text-lg">URL Scanner and brand-abuse detection</p>
            </div>
            <Link href="/" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Scanner
            </Link>
          </header>

          <section className="rounded-md border border-slate-300 bg-white p-5 sm:p-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Brand domain</label>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runScan()}
                placeholder="linkedin.com"
                className="w-full rounded border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500"
              />
              <button
                onClick={runScan}
                disabled={loading}
                className="rounded bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Scanning..." : "Scan Brand"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total" value={summary.total} />
            <Stat label="Phishing" value={summary.phishing} />
            <Stat label="Suspicious" value={summary.suspicious} />
            <Stat label="Safe" value={summary.safe} />
          </section>

          <section className="rounded-md border border-slate-300 bg-white p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Domain</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Risk</th>
                    <th className="px-4 py-3 text-left">Verdict</th>
                    <th className="px-4 py-3 text-left">IP</th>
                    <th className="px-4 py-3 text-left">MX</th>
                    <th className="px-4 py-3 text-left">SSL</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                        No data yet. Run a brand scan.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={`${r.domain}-${r.type}`} className="border-t border-slate-200">
                        <td className="px-4 py-3 font-mono text-slate-800">{r.domain}</td>
                        <td className="px-4 py-3 text-slate-700">{r.type}</td>
                        <td className="px-4 py-3 text-slate-700">{(r.risk_score * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2.5 py-1 text-xs font-semibold ${
                              r.verdict === "phishing"
                                ? "bg-red-600 text-white"
                                : r.verdict === "suspicious"
                                ? "bg-yellow-500 text-white"
                                : "bg-green-600 text-white"
                            }`}
                          >
                            {r.verdict}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{r.ip}</td>
                        <td className="px-4 py-3 text-slate-700">{r.mx ? "Yes" : "No"}</td>
                        <td className="px-4 py-3 text-slate-700">{r.ssl ? "Yes" : "No"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-slate-300 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
