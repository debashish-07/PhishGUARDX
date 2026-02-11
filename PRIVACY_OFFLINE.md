Privacy & Offline Guide

- By default this project supports an "offline" privacy mode which avoids external network calls for model downloads and remote CDNs.
- All analysis logic runs client-side in the browser (heuristics, web workers, and local explainability). Analysis records and feature caches are persisted using IndexedDB (`src/lib/storage.ts`).

How to enable offline/privacy mode

- The app exposes a small client-side flag stored in `localStorage` under the key `pd_offline_mode`.
  - To enable: `localStorage.setItem('pd_offline_mode', '1')`
  - To disable: `localStorage.setItem('pd_offline_mode', '0')`
- Programmatically you can call the helper functions in `lib/privacy.ts`:
  - `enableOfflineMode(true)` — enable offline/privacy mode
  - `enableOfflineMode(false)` — disable offline/privacy mode
  - `isOfflineMode()` — returns a boolean indicating the current mode

What offline mode does

- Prevents dynamic imports or runtime downloads from external CDNs for transformer/ONNX models.
- `classifyText()` and model preload functions become no-ops or return safe fallbacks when offline mode is active — the system will rely on heuristics and local worker features.
- The ONNX runtime loader (`src/models/EnsembleModel.ts`) will not attempt to set CDN wasm paths nor load a remote model when offline mode is active; the code falls back to an internal heuristic predictor.

Storage & Local Persistence

- Analysis results, verdicts and cached feature vectors are stored in IndexedDB using `src/lib/storage.ts`.
- This storage is fully local to the browser and survives restarts; data never leaves the user's machine unless explicitly exported by the user.

Notes & limitations

- Offline mode intentionally disables model downloads. If you want to use on-device ML models, add them to the application bundle and configure the model paths to local assets (and ensure your deployment does not serve them from remote CDNs).
- Some dev/test utilities (e.g., Playwright report viewers) may open local HTTP servers — this is only to serve static test reports when debugging and does not send any user data off-machine.

If you want, I can add a simple Settings toggle UI to the app to control offline mode from the UI.
