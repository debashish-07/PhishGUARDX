TITLE (Font: Times New Roman, size 16)
Quantum Phishing Detector — Phase‑1 Report

ABSTRACT (Font: Times New Roman, size 14)
Content (Font: Times New Roman, size 12)

This report documents Phase‑1 of the "Quantum Phishing Detector" project. The system aims to provide a privacy-first, explainable phishing detection demo that combines heuristic, visual, audio and transformer-based signals into a Multi-Modal Ensemble. Phase‑1 focuses on an interactive web demo (Next.js) with local-only storage, an on-device Trust Ledger (IndexedDB) for auditable scans, and visual explainers (heatmaps, visual DNA) together with test automation.

1. Title of the Project

- Quantum Phishing Detector (Privacy‑First, Multi‑Modal Ensemble)

2. Introduction & Background (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Context and Motivation
- Phishing remains a pervasive web threat. Modern detection benefits from multi-modal cues (URL heuristics, visual similarity, content embeddings, audio cues for voice-based attacks). Privacy and on-device processing are increasingly important to protect user data.

Technical Background
- This project uses a React + Next.js front-end, client-side feature extractors (Web Workers), Transformer and ONNX runtimes for model inference, Three.js for 3D visuals, and IndexedDB for local persistence.

3. Problem Statement (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Users need a lightweight, privacy-preserving phishing detection tool which:
- Provides accurate, explainable decisions combining multiple modalities.
- Keeps sensitive scan history local (no third-party storage) and auditable.
- Is demonstrable in-browser, with reproducible results for evaluation.

Constraints and Scope
- Work in Phase‑1 is limited to client-side functionality, local persistence, visual explainers, and an initial evaluation/demo; full offline model packaging and large-scale evaluation are in Phase‑2.

4. Literature Survey / Existing System Review (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Summary of relevant approaches
- Heuristic URL detectors: pattern-based checks, lexical features, WHOIS checks (fast, privacy-friendly but limited). 
- Visual similarity methods: screenshot hashing and perceptual hashing (robust to small layout changes but compute-heavy). 
- Transformer-based content classifiers: capture semantic phishing language (state of the art but model size and privacy concerns). 
- Hybrid systems: combine lexical + visual + embedding signals for higher accuracy.

Representative tools and papers (examples)
- Garera et al., "A Framework for Detecting Phishing Web Sites" (heuristic+ML approaches).
- Perceptual hashing and screenshot comparison literature.
- Recent transformer-based phishing classifiers and on-device model work.

5. Gap Analysis & Motivation (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Gaps in existing systems
- Many systems rely on server-side analysis, raising privacy concerns.
- Explainability is often limited; users get a binary label without per-module attribution.
- Auditability (tamper-evident histories) is rarely provided to end users.

Motivation for this project
- Provide a privacy-first demo that runs in-browser, offers per-module heatmaps, and stores a tamper-evident local Trust Ledger to enable reproducible audits for every scan.

6. Objectives of the Proposed Work (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Phase‑1 Objectives
- Implement a Next.js demo UI that accepts URLs and runs a multi-modal detection pipeline in-browser.
- Add per-module scoring visualizations (heatmaps, URL character attribution, audio spectrum) and a 3D visual DNA.
- Implement a local Trust Ledger (IndexedDB) that records scan entries with prev/curr hashes and signatures.
- Build settings UI for privacy/offline controls and worker toggles.
- Harden E2E tests (Playwright) and add demo automation for reproducibility.

Final Project Objectives (Phase‑2, summary)
- Bundle offline model weights for fully offline inference.
- Perform quantitative evaluation on held-out datasets and compare with baselines.
- Prepare deployment and user study material.

7. Proposed Methodology (Phase‑1 Scope Only) (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Architecture Overview
- Web front-end: Next.js (React) client components for UI and visualizations.
- Feature extraction: Web Workers for CPU-intensive tasks (visual DNA, MFCC audio features, quantum-hash approximations). Workers are toggleable via Settings.
- Models: Lightweight transformer / ONNX runtime inference where available; otherwise use heuristic fallbacks in offline mode.
- Storage: IndexedDB stores both analysis history and the Trust Ledger in a separate object store with chain-like hashes.

Data Flow for a Scan
1. User submits URL in the UI. 2. Front-end collects heuristic features and optionally snapshots the page for visual features. 3. Workers compute modality-specific features. 4. Module scorers (heuristic, quantum, visual, transformer) produce normalized scores. 5. Ensemble combines module outputs into final risk score. 6. Result is shown with heatmaps and visual DNA; a ledger entry is added to the Trust Ledger with previousHash/currentHash/signature.

Evaluation Plan (Phase‑1)
- Manual demo verification (Playwright demo script). 
- Basic accuracy sanity checks using small sample URLs (internal dataset `datasets/sample_urls.csv`).
- Ensure ledger chain integrity via verification routine in `app/utils/trustLedger.ts`.

8. Work Done So Far (Phase‑1 Progress) (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Implemented Components (high level)
- Frontend demo: `app/page.tsx`, `app/components/Dashboard.tsx`, `app/components/SettingsPanel.tsx`.
- Trust Ledger: `app/utils/trustLedger.ts` (IndexedDB implementation with `addEntry`, `getAllEntries`, `verifyChain`, `exportAsJSON/CSV`, `dispatchEntryAdded`).
- Trust Ledger Viewer: `app/components/TrustLedgerViewer.tsx` (auto-refresh on `trustledger:entryAdded`, displays prev/curr hashes and previous URL lookup).
- Visualizations: `src/components/visualizations/UrlHeatmap.tsx`, `AudioSpectrumChart.tsx`, `ModuleBreakdownHeatmap.tsx`, and a 3D visual DNA component in `app/components`.
- Detection orchestration: `src/hooks/useDetection.ts` (controls workers, respects offline toggles, writes history and triggers ledger addEntry).
- Tests and automation: Playwright tests under `e2e/` (updated helpers `tests/e2e-helpers.ts`) and a demo script `scripts/demo-run.js` for automated UI demo runs.

Repository pointers (examples)
- Trust Ledger: `app/utils/trustLedger.ts`
- Viewer: `app/components/TrustLedgerViewer.tsx`
- Demo runner: `scripts/demo-run.js`
- E2E tests: `e2e/*.spec.ts`

Known Limitations
- Some workers and model downloads rely on remote assets (Phase‑2 aims to package models for offline use).
- Playwright automation sometimes requires increased timeouts due to canvas/visual rendering.

9. Expected Outcome (Phase‑1 + Final Project) (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Phase‑1 Deliverables
- Functional web demo accessible locally (Next dev) with multi-modal scoring and Trust Ledger.
- Documentation and demo script to reproduce scans and ledger entries.
- Basic Playwright E2E tests showing demo flows.

Final Project Deliverables
- Fully offline-capable demo with bundled models where possible.
- Quantitative evaluation and comparison with baseline detectors.
- Final report, deployment guide, and reproducible test-suite.

10. Project Plan & Timeline (Gantt Chart) (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Suggested 12‑week schedule (example)
- Week 1–2: Requirements, architecture, corpus selection, prototype UI.
- Week 3–5: Implement feature extractors, workers, and per-module scorers.
- Week 6–7: Implement Trust Ledger, viewer and storage persistence.
- Week 8: Integrate ensemble, visualizations, and settings UI.
- Week 9: E2E tests, demo automation, and usability polish.
- Week 10–11: Evaluation on small dataset, results collection.
- Week 12: Report writing, final demos, buffer for fixes.

Gantt (textual)

| Task                        | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | W11 | W12 |
|-----------------------------|----|----|----|----|----|----|----|----|----|-----|-----|-----|
| Requirements & Design       | XX | XX |    |    |    |    |    |    |    |     |     |     |
| Feature Extractors / Workrs |    |    | XX | XX | XX |    |    |    |    |     |     |     |
| Trust Ledger & Storage      |    |    |    |    |    | XX | XX |    |    |     |     |     |
| Integration + Visuals       |    |    |    |    |    |    |    | XX | XX |     |     |     |
| Testing & Automation        |    |    |    |    |    |    |    |    | XX | XX  |     |     |
| Evaluation & Report         |    |    |    |    |    |    |    |    |    | XX  | XX  | XX  |

11. Conclusion / Summary of Phase‑1 (Font: Times New Roman, size 14)
Content: (Font: Times New Roman, size 12)

Phase‑1 delivered a running, privacy-first demo that demonstrates core concepts: multi-modal scoring, explainable visualizations, local auditability via a Trust Ledger, and automated demo/test flows. The system is ready for Phase‑2 where offline model packaging and a broader evaluation will be completed.

References (Font: Times New Roman, size 14)

[1] Garera, S., et al., "A Framework for Detecting Phishing Web Sites", Proceedings of the 2007 ACM conference on Computer and communications security. *(example citation)*
[2] Next.js Documentation — https://nextjs.org/
[3] Three.js Documentation — https://threejs.org/
[4] ONNX Runtime Web — https://onnxruntime.ai/
[5] Playwright — https://playwright.dev/
[6] Xenova Transformers (client-side) — https://github.com/xenova/transformers

--
Notes:
- The above content is provided in Markdown for easy editing. When producing the final PDF/printed report, apply the font/size guidelines to each heading and content block (Times New Roman 16/14/12 as indicated).
- If you want, I can export this to DOCX or generate a styled PDF with the specified fonts and a Gantt chart image.
