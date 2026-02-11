License & Third-Party Components

Project license (example):
- The code in this repository is provided for academic use and demonstration purposes only. It is not intended for production security deployments without further review, testing and licensing.

Third-party components used by this project:
- onnxruntime-web — ONNX Runtime Web (https://github.com/microsoft/onnxruntime)
- @xenova/transformers — Transformers.js (https://github.com/xenova/transformers.js)
- three — Three.js (https://threejs.org/)

Respecting third-party model licenses

- Some third-party model runtimes and model weight distributions are governed by their own licenses and copyright terms. If you choose to embed pre-trained models or distribute model weights with this project, ensure you comply with the model author's license.
- This repository includes code to fall back to heuristic or local computation when offline/privacy mode is enabled; it does not bundle any third-party model weights by default.

If you need, I can add a short `LICENSE` file with a suitable academic-use license (e.g., CC BY-NC or an MIT variant). Let me know which license you'd prefer and I will add it and update attribution notes for bundled dependencies.
