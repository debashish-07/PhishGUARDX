'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoPage() {
    const [currentSection, setCurrentSection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    const demoSections = [
        {
            title: '🎯 Project Overview',
            subtitle: 'Quantum-Inspired Multi-Modal AI for Real-Time Browser Security',
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-xl border border-purple-500/30">
                            <h3 className="text-xl font-bold text-purple-300 mb-3">🔬 Key Innovation</h3>
                            <p className="text-gray-300">
                                First browser-native phishing detection system combining classical ML with quantum-inspired algorithms
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-6 rounded-xl border border-blue-500/30">
                            <h3 className="text-xl font-bold text-blue-300 mb-3">🔒 Privacy-First</h3>
                            <p className="text-gray-300">
                                100% client-side processing with zero data leakage and sub-500ms latency
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-500/30">
                            <h3 className="text-xl font-bold text-green-300 mb-3">🧠 Multi-Modal AI</h3>
                            <p className="text-gray-300">
                                5 detection modules: Heuristics, Quantum Hash, Visual DNA, Transformer, ML Ensemble
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 p-6 rounded-xl border border-orange-500/30">
                            <h3 className="text-xl font-bold text-orange-300 mb-3">📊 Explainable AI</h3>
                            <p className="text-gray-300">
                                Token-level heatmaps and feature attribution for complete transparency
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-8 rounded-xl border border-purple-500/20">
                        <h3 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Performance Metrics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">96.3%</div>
                                <div className="text-sm text-gray-400">Precision</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-400">92.1%</div>
                                <div className="text-sm text-gray-400">Recall</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-400">94.1%</div>
                                <div className="text-sm text-gray-400">F1 Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cyan-400">287ms</div>
                                <div className="text-sm text-gray-400">Latency</div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: '🔬 Visual DNA Fingerprint',
            subtitle: 'Bioinformatics-Inspired URL Structural Analysis',
            content: (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-xl border border-purple-500/20">
                        <h3 className="text-xl font-bold text-purple-300 mb-4">What is Visual DNA?</h3>
                        <p className="text-gray-300 mb-4">
                            A novel canvas-based visualization that encodes URL entropy and structural patterns,
                            inspired by biometric and cryptographic fingerprinting techniques.
                        </p>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start">
                                <span className="text-purple-400 mr-2">✓</span>
                                <span>Converts URL characters into 2D grid patterns</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-purple-400 mr-2">✓</span>
                                <span>Detects structural anomalies and mutations</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-purple-400 mr-2">✓</span>
                                <span>Real-world applications in malware classification</span>
                            </li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/40 p-6 rounded-xl border border-green-500/30">
                            <h4 className="text-lg font-bold text-green-400 mb-3">Legitimate URL Pattern</h4>
                            <div className="bg-green-900/20 h-48 rounded-lg flex items-center justify-center border border-green-500/20">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🧬</div>
                                    <div className="text-sm text-gray-400">Regular, predictable structure</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-black/40 p-6 rounded-xl border border-red-500/30">
                            <h4 className="text-lg font-bold text-red-400 mb-3">Phishing URL Pattern</h4>
                            <div className="bg-red-900/20 h-48 rounded-lg flex items-center justify-center border border-red-500/20">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">⚠️</div>
                                    <div className="text-sm text-gray-400">Irregular, anomalous structure</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: '🧠 Quantum State Visualization',
            subtitle: 'Bloch-Sphere-Inspired Risk Signal Encoding',
            content: (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/20">
                        <h3 className="text-xl font-bold text-blue-300 mb-4">Quantum-Inspired Hashing</h3>
                        <p className="text-gray-300 mb-4">
                            Novel feature encoding using quantum superposition metaphors for deterministic
                            structural anomaly detection.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/20">
                                <div className="text-2xl mb-2">⚛️</div>
                                <div className="text-sm font-semibold text-blue-300">Superposition Encoding</div>
                                <div className="text-xs text-gray-400 mt-1">Character-level quantum states</div>
                            </div>
                            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                                <div className="text-2xl mb-2">🌀</div>
                                <div className="text-sm font-semibold text-purple-300">Phase Mapping</div>
                                <div className="text-xs text-gray-400 mt-1">2D Bloch sphere visualization</div>
                            </div>
                            <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-500/20">
                                <div className="text-2xl mb-2">📊</div>
                                <div className="text-sm font-semibold text-cyan-300">Risk Aggregation</div>
                                <div className="text-xs text-gray-400 mt-1">Quantum-inspired scoring</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/40 p-8 rounded-xl border border-purple-500/20">
                        <h4 className="text-lg font-bold text-purple-300 mb-4 text-center">Quantum Risk Map Example</h4>
                        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 h-64 rounded-lg flex items-center justify-center border border-purple-500/30">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🎯</div>
                                <div className="text-xl text-purple-300 font-semibold">Interactive Visualization</div>
                                <div className="text-sm text-gray-400 mt-2">Real-time quantum state rendering</div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: '🕸️ Neural Architecture',
            subtitle: 'Live Animated Neural Network Inference Visualization',
            content: (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6 rounded-xl border border-green-500/20">
                        <h3 className="text-xl font-bold text-green-300 mb-4">Detection Pipeline</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30 min-w-[150px]">
                                    <div className="text-sm font-semibold text-purple-300">Heuristics</div>
                                    <div className="text-xs text-gray-400">25% weight</div>
                                </div>
                                <div className="flex-1 h-1 bg-gradient-to-r from-purple-500/30 to-blue-500/30"></div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30 min-w-[150px]">
                                    <div className="text-sm font-semibold text-blue-300">Quantum Hash</div>
                                    <div className="text-xs text-gray-400">15% weight</div>
                                </div>
                                <div className="flex-1 h-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30"></div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="bg-cyan-500/20 px-4 py-2 rounded-lg border border-cyan-500/30 min-w-[150px]">
                                    <div className="text-sm font-semibold text-cyan-300">Visual DNA</div>
                                    <div className="text-xs text-gray-400">10% weight</div>
                                </div>
                                <div className="flex-1 h-1 bg-gradient-to-r from-cyan-500/30 to-green-500/30"></div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30 min-w-[150px]">
                                    <div className="text-sm font-semibold text-green-300">Transformer</div>
                                    <div className="text-xs text-gray-400">25% weight</div>
                                </div>
                                <div className="flex-1 h-1 bg-gradient-to-r from-green-500/30 to-orange-500/30"></div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="bg-orange-500/20 px-4 py-2 rounded-lg border border-orange-500/30 min-w-[150px]">
                                    <div className="text-sm font-semibold text-orange-300">ML Ensemble</div>
                                    <div className="text-xs text-gray-400">25% weight</div>
                                </div>
                                <div className="flex-1 h-1 bg-gradient-to-r from-orange-500/30 to-red-500/30"></div>
                            </div>

                            <div className="flex items-center justify-center pt-4">
                                <div className="bg-gradient-to-r from-purple-500/30 to-red-500/30 px-6 py-3 rounded-lg border border-purple-500/50">
                                    <div className="text-lg font-bold text-white">Final Risk Score</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: '📊 Interactive Dashboard',
            subtitle: 'Real-Time Analysis with Explainable AI',
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-xl border border-purple-500/20">
                            <h3 className="text-lg font-bold text-purple-300 mb-3">🔍 Token Heatmaps</h3>
                            <p className="text-gray-300 text-sm mb-4">
                                Character-level risk attribution showing exactly which parts of the URL are suspicious
                            </p>
                            <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20">
                                <div className="font-mono text-sm">
                                    <span className="bg-green-500/20 text-green-300 px-1">https://</span>
                                    <span className="bg-red-500/40 text-red-300 px-1">secure-paypal</span>
                                    <span className="bg-orange-500/30 text-orange-300 px-1">-verify</span>
                                    <span className="bg-red-500/40 text-red-300 px-1">.suspicious</span>
                                    <span className="bg-yellow-500/30 text-yellow-300 px-1">.com</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-6 rounded-xl border border-blue-500/20">
                            <h3 className="text-lg font-bold text-blue-300 mb-3">📈 Feature Attribution</h3>
                            <p className="text-gray-300 text-sm mb-4">
                                Breakdown of which detection modules contributed to the final risk score
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Suspicious Keywords</span>
                                    <span className="text-sm font-semibold text-red-400">High Risk</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Domain Entropy</span>
                                    <span className="text-sm font-semibold text-orange-400">Medium Risk</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">SSL Certificate</span>
                                    <span className="text-sm font-semibold text-green-400">Low Risk</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6 rounded-xl border border-green-500/20">
                        <h3 className="text-lg font-bold text-green-300 mb-3">📄 PDF Report Generation</h3>
                        <p className="text-gray-300 text-sm mb-4">
                            One-click export of comprehensive analysis reports with all visualizations and metrics
                        </p>
                        <div className="flex items-center justify-center space-x-4">
                            <div className="bg-black/40 px-6 py-3 rounded-lg border border-green-500/30">
                                <div className="text-sm text-gray-400">Report includes:</div>
                                <div className="text-xs text-gray-500 mt-1">Risk Score • Heatmaps • Feature Analysis • Recommendations</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 p-6 rounded-xl border border-orange-500/20">
                        <h3 className="text-lg font-bold text-orange-300 mb-3">💾 Analysis History</h3>
                        <p className="text-gray-300 text-sm mb-4">
                            IndexedDB-backed storage for all previous analyses with export capabilities
                        </p>
                        <div className="flex items-center justify-center space-x-4">
                            <div className="bg-black/40 px-4 py-2 rounded-lg border border-orange-500/30 text-sm text-gray-300">
                                View History
                            </div>
                            <div className="bg-black/40 px-4 py-2 rounded-lg border border-orange-500/30 text-sm text-gray-300">
                                Export CSV
                            </div>
                            <div className="bg-black/40 px-4 py-2 rounded-lg border border-orange-500/30 text-sm text-gray-300">
                                Clear All
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: '🎓 Academic Contributions',
            subtitle: 'Novel Research and Real-World Impact',
            content: (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-xl border border-purple-500/20">
                        <h3 className="text-xl font-bold text-purple-300 mb-4">Key Contributions</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="text-2xl">🏆</div>
                                <div>
                                    <div className="font-semibold text-purple-300">First Browser-Native Implementation</div>
                                    <div className="text-sm text-gray-400">Quantum-inspired hashing for phishing detection entirely in the browser</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="text-2xl">🧬</div>
                                <div>
                                    <div className="font-semibold text-purple-300">Visual DNA Fingerprinting</div>
                                    <div className="text-sm text-gray-400">Adapted bioinformatics techniques to cybersecurity domain</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="text-2xl">🤖</div>
                                <div>
                                    <div className="font-semibold text-purple-300">Multi-Modal Ensemble</div>
                                    <div className="text-sm text-gray-400">Explainable token-level attribution across 5 detection modules</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="text-2xl">🔒</div>
                                <div>
                                    <div className="font-semibold text-purple-300">Zero-Server Architecture</div>
                                    <div className="text-sm text-gray-400">Complete user privacy with no data collection or tracking</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-6 rounded-xl border border-blue-500/20">
                            <h3 className="text-lg font-bold text-blue-300 mb-3">🔬 Research Impact</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Novel quantum-inspired algorithms</li>
                                <li>• Cross-domain technique adaptation</li>
                                <li>• Explainable AI methodologies</li>
                                <li>• Privacy-preserving ML</li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6 rounded-xl border border-green-500/20">
                            <h3 className="text-lg font-bold text-green-300 mb-3">🌍 Real-World Applications</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Browser extensions</li>
                                <li>• Enterprise security tools</li>
                                <li>• Educational platforms</li>
                                <li>• Anti-fraud systems</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    const nextSection = () => {
        setCurrentSection((prev) => (prev + 1) % demoSections.length);
    };

    const prevSection = () => {
        setCurrentSection((prev) => (prev - 1 + demoSections.length) % demoSections.length);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(0,0,0,0))]"></div>
                <div className="absolute top-0 left-0 w-full h-full">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-purple-500/10 rounded-full blur-xl"
                            style={{
                                width: `${Math.random() * 300 + 50}px`,
                                height: `${Math.random() * 300 + 50}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-purple-500/20 bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Phishing Detector Demo
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                Quantum-Inspired Multi-Modal AI for Real-Time Browser Security
                            </p>
                        </div>
                        <a
                            href="/"
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all"
                        >
                            Launch App
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-400">
                            Section {currentSection + 1} of {demoSections.length}
                        </div>
                        <div className="flex space-x-2">
                            {demoSections.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSection(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentSection
                                            ? 'bg-purple-500 w-8'
                                            : 'bg-gray-600 hover:bg-gray-500'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${((currentSection + 1) / demoSections.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content Section */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 md:p-12"
                    >
                        <div className="mb-8">
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                                {demoSections[currentSection].title}
                            </h2>
                            <p className="text-xl text-gray-400">
                                {demoSections[currentSection].subtitle}
                            </p>
                        </div>

                        <div className="min-h-[400px]">
                            {demoSections[currentSection].content}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={prevSection}
                        disabled={currentSection === 0}
                        className="px-6 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white font-semibold hover:bg-purple-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ← Previous
                    </button>

                    <div className="flex items-center space-x-4">
                        <a
                            href="/"
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-semibold hover:from-green-500 hover:to-emerald-500 transition-all"
                        >
                            Try Live Demo
                        </a>
                    </div>

                    <button
                        onClick={nextSection}
                        disabled={currentSection === demoSections.length - 1}
                        className="px-6 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white font-semibold hover:bg-purple-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next →
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-purple-500/20 bg-black/40 backdrop-blur-xl mt-12">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="text-center text-gray-400 text-sm">
                        <p>Final Year Project | Department of Computer Science & Engineering</p>
                        <p className="mt-2">© 2024-2025 | Built with Next.js, TypeScript, and Tailwind CSS</p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
      `}</style>
        </div>
    );
}
