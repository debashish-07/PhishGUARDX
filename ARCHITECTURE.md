# Architecture Documentation

## 1. System Overview
The Phishing Detector is a privacy-first, browser-native application designed to detect phishing websites in real-time using a hybrid ensemble of quantum-inspired hashing, visual analysis, and audio signal processing.

## 2. Component Architecture

### 2.1 Frontend (Next.js)
- **Dashboard**: Visualizes risk scores and feature maps (Quantum, Visual DNA, MFCC).
- **Hooks**: `useDetection` manages the detection lifecycle and worker communication.
- **Workers**:
    - `quantum_hash.worker.ts`: Computes quantum-inspired hash of the URL.
    - `visual_dna.worker.ts`: Generates a visual grid representing URL structure.
    - `mfcc.worker.ts`: Simulates audio spectrum analysis of the URL.

### 2.2 Backend (FastAPI) - Optional
- **Federated Learning API**: Endpoints for receiving model updates from clients.
- **Update Server**: Distributes signed model updates to clients.
- **Heavy Compute**: Fallback for complex deep learning tasks (if enabled).

### 2.3 Data Flow
1. **Input**: User enters a URL.
2. **Feature Extraction**: 
    - URL is sent to parallel WebWorkers.
    - Features (Hash, DNA, MFCC) are computed locally.
3. **Inference**:
    - Features are aggregated in the `useDetection` hook.
    - `EnsembleModel` (ONNX Runtime) predicts the phishing probability.
4. **Visualization**: Results are rendered in the Dashboard.
5. **Feedback (Optional)**: User feedback is sent to the backend for federated learning.

## 3. Design Rationale
- **Privacy-First**: All detection logic runs in the browser. No user data leaves the device unless explicitly opted-in for feedback.
- **Scalability**: WebWorkers ensure the UI remains responsive (<500ms latency).
- **Modularity**: Components are decoupled, allowing for easy updates and experiments.

## 4. Future Work
- **True Federated Learning**: Implement secure aggregation protocol.
- **Mobile Support**: Port the detection engine to React Native.
- **Browser Extension**: Package the core logic as a Chrome/Firefox extension.
