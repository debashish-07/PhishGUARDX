#!/usr/bin/env python
# type: ignore
# pyright: reportGeneralTypeIssues=false
"""
Complete Training Pipeline Runner
Orchestrates data preparation → training → evaluation → ONNX export

This script validates all claims in PROJECT_REPORT.md:
- Section 5.5: Feature Complementarity Analysis
- Section 5.6: Temporal Robustness & Concept Drift

Usage:
  python run_training.py                 # Run all steps
  python run_training.py --prepare-only  # Only prepare data
  python run_training.py --train-only    # Only train models
  python run_training.py --export-only   # Only export ONNX
"""

import sys
import os
import argparse
from pathlib import Path
import subprocess
import json
from typing import List, Tuple

def run_step(step_name: str, script_path: str, description: str):
    """Run a training step and report results"""
    
    print("\n" + "="*70)
    print(f"STEP: {step_name}")
    print("="*70)
    print(f"📝 {description}")
    print("-"*70)
    
    if not Path(script_path).exists():
        print(f"❌ Script not found: {script_path}")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=False,
            text=True
        )
        
        if result.returncode == 0:
            print(f"\n✅ {step_name} completed successfully")
            return True
        else:
            print(f"\n❌ {step_name} failed with return code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error running {step_name}: {str(e)}")
        return False

def check_dependencies():
    """Verify required packages are installed"""
    
    print("\n" + "="*70)
    print("CHECKING DEPENDENCIES")
    print("="*70)
    
    required_packages = {
        'numpy': 'numpy',
        'pandas': 'pandas',
        'sklearn': 'scikit-learn',
        'scipy': 'scipy',
        'requests': 'requests',
        'tqdm': 'tqdm',
    }
    
    optional_packages = {
        'torch': 'torch (PyTorch)',
        'transformers': 'transformers (HuggingFace)',
        'onnx': 'onnx',
        'onnxruntime': 'onnxruntime',
        'skl2onnx': 'skl2onnx',
    }
    
    missing_required = []  # type: ignore
    missing_optional = []  # type: ignore
    
    for module, package_name in required_packages.items():
        try:
            __import__(module)
            print(f"✓ {package_name:30} installed")
        except ImportError:
            missing_required.append(package_name)  # type: ignore
            print(f"❌ {package_name:30} NOT INSTALLED")
    
    for module, package_name in optional_packages.items():
        try:
            __import__(module)
            print(f"✓ {package_name:30} installed")
        except ImportError:
            missing_optional.append(package_name)  # type: ignore
            print(f"⚠️  {package_name:30} not installed (optional)")
    
    if missing_required:
        print(f"\n⚠️  Missing required packages: {', '.join(missing_required)}")  # type: ignore
        print(f"\nInstall with: pip install -r requirements.txt")
        return False
    
    if missing_optional:
        print(f"\n⚠️  Optional packages not installed:")
        for pkg in missing_optional:  # type: ignore
            print(f"    pip install {pkg.split('(')[0].strip()}")  # type: ignore
        print("\nYou can still run training, but ONNX export will be skipped.")
    
    print("\n✅ All required dependencies present")
    return True

def setup_directories():
    """Create necessary directories"""
    
    directories = [
        Path("./data"),
        Path("./models"),
        Path("./onnx"),
        Path("./results"),
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)

def load_results():
    """Load and display training results"""
    
    print("\n" + "="*70)
    print("RESULTS SUMMARY")
    print("="*70)
    
    # Load complementarity results
    complementarity_path = Path("./models/complementarity_results.json")
    if complementarity_path.exists():
        with open(complementarity_path) as f:
            results = json.load(f)
            print("\n✓ Feature Complementarity Analysis (Section 5.5)")
            print("  Mutual Information Scores:")
            for pair, mi in results.get('mi', {}).items():
                print(f"    {pair:40} {mi:.3f} bits")
    
    # Load temporal results
    temporal_path = Path("./models/temporal_results.json")
    if temporal_path.exists():
        with open(temporal_path) as f:
            results = json.load(f)
            print("\n✓ Temporal Robustness Evaluation (Section 5.6)")
            for test_set, metrics in results.items():
                ensemble_acc = metrics.get('Ensemble', {}).get('Accuracy', 0)
                print(f"  {test_set:20} Ensemble Accuracy: {ensemble_acc:.4f}")
    
    # Load ensemble weights
    weights_path = Path("./models/ensemble_weights.npy")
    if weights_path.exists():
        import numpy as np
        weights = np.load(weights_path)
        module_names = ['Heuristics', 'Phase-Encoded', 'Spatial', 'Frequency', 'Transformer']
        print("\n✓ Optimized Ensemble Weights:")
        for name, weight in zip(module_names, weights):
            print(f"  {name:20} {weight:.4f}")

def verify_outputs(executed_steps: List[Tuple[str, str, str]]):
    """Verify all output files were generated"""
    
    print("\n" + "="*70)
    print("VERIFYING OUTPUTS")
    print("="*70)
    
    base_dir = Path(__file__).parent

    step_names = {name for name, _, _ in executed_steps}

    expected_files = {
        'Data': [
            'data/train_features.npy',
            'data/train_labels.npy',
            'data/val_features.npy',
            'data/val_labels.npy',
            'data/test_3mo_features.npy',
            'data/test_6mo_features.npy',
            'data/test_12mo_features.npy',
        ],
        'Models': [
            'models/models.pkl',
            'models/complementarity_results.json',
            'models/temporal_results.json',
            'models/ensemble_weights.npy',
        ],
        'ONNX Exports': [
            'onnx/model_config.json',
            'onnx/onnx-loader.ts',
            'onnx/INTEGRATION_GUIDE.md',
        ],
    }

    categories_for_steps = {
        'Data Preparation': ['Data'],
        'Ensemble Training': ['Models'],
        'ONNX Export': ['ONNX Exports'],
    }

    enabled_categories = set()
    for step_name in step_names:
        enabled_categories.update(categories_for_steps.get(step_name, []))
    
    all_found = True
    for category, files in expected_files.items():
        if category not in enabled_categories:
            continue
        print(f"\n{category}:")
        for file_path in files:
            p = base_dir / file_path
            if p.exists():
                size = p.stat().st_size
                if size > 1024*1024:
                    size_str = f"{size/(1024*1024):.2f} MB"
                else:
                    size_str = f"{size/1024:.2f} KB"
                print(f"  ✓ {file_path:50} ({size_str})")
            else:
                print(f"  ❌ {file_path:50} (missing)")
                all_found = False
    
    return all_found

def main():
    """Main training pipeline orchestrator"""
    
    parser = argparse.ArgumentParser(description='Training Pipeline Runner')
    parser.add_argument('--prepare-only', action='store_true', help='Only prepare data')
    parser.add_argument('--train-only', action='store_true', help='Only train models')
    parser.add_argument('--export-only', action='store_true', help='Only export ONNX')
    args = parser.parse_args()
    
    # Change to training directory
    training_dir = Path(__file__).parent
    os.chdir(training_dir)
    
    print("\n" + "#"*70, flush=True)
    print("#" + " "*68 + "#", flush=True)
    print("#  🚀 PHISHING DETECTION ENSEMBLE TRAINING PIPELINE" + " "*16 + "#", flush=True)
    print("#" + " "*68 + "#", flush=True)
    print("#"*70, flush=True)
    print(f"Working directory: {os.getcwd()}", flush=True)
    
    # Check dependencies
    if not check_dependencies():
        print("\n⚠️  Some dependencies missing. Install with: pip install -r requirements.txt")
        sys.exit(1)
    
    # Setup directories
    setup_directories()
    
    # Determine which steps to run
    steps = []
    if not args.train_only and not args.export_only:
        steps.append(('Data Preparation', 'prepare_data.py',  # type: ignore 
                     'Generate temporal dataset with phishing/legitimate URLs'))
    
    if not args.prepare_only and not args.export_only:
        steps.append(('Ensemble Training', 'train_ensemble.py',  # type: ignore
                     'Train 5-module ensemble and validate complementarity (Section 5.5) + temporal robustness (Section 5.6)'))
    
    if not args.prepare_only and not args.train_only:
        steps.append(('ONNX Export', 'export_onnx.py',  # type: ignore
                     'Export trained models to ONNX format for browser deployment'))
    
    # Run requested steps
    success_count = 0
    for step_name, script, description in steps:  # type: ignore
        if run_step(step_name, script, description):  # type: ignore
            success_count += 1
    
    # Report results
    if success_count > 0:
        print("\n" + "#"*70, flush=True)
        print("#" + " "*68 + "#", flush=True)
        print("#  📊 PIPELINE EXECUTION SUMMARY" + " "*36 + "#", flush=True)
        print("#" + " "*68 + "#", flush=True)
        print("#"*70, flush=True)
        
        if success_count >= 2:
            load_results()
        
        if success_count == len(steps):  # type: ignore
            print("\n" + "#"*70, flush=True)
            print("#" + " "*68 + "#", flush=True)
            print("#  ✅ ALL STEPS COMPLETED SUCCESSFULLY" + " "*29 + "#", flush=True)
            print("#" + " "*68 + "#", flush=True)
            print("#"*70, flush=True)
            verify_outputs(steps)
        else:
            print("\n" + "⚠️ "*35, flush=True)
            print(f"  {success_count}/{len(steps)} steps completed", flush=True)  # type: ignore
            print("⚠️ "*35, flush=True)
    else:
        print("\n" + "#"*70, flush=True)
        print("#" + " "*68 + "#", flush=True)
        print("#  ❌ PIPELINE FAILED" + " "*48 + "#", flush=True)
        print("#" + " "*68 + "#", flush=True)
        print("#"*70, flush=True)
        sys.exit(1)
    
    print("\n" + "#"*70, flush=True)
    print("#" + " "*68 + "#", flush=True)
    print("#  📋 NEXT STEPS" + " "*54 + "#", flush=True)
    print("#" + " "*68 + "#", flush=True)
    print("#"*70, flush=True)
    print("""
1. Review results in:
   - models/complementarity_results.json (Section 5.5 validation)
   - models/temporal_results.json (Section 5.6 validation)

2. Copy ONNX models to browser deployment:
   cp onnx/*.onnx ../app/public/models/
   cp onnx/model_config.json ../app/public/models/

3. Integrate TypeScript loader:
   cp onnx/onnx-loader.ts ../lib/

4. Update PROJECT_REPORT.md with actual results from:
   - Section 5.5.2: Actual MI scores
   - Section 5.5.3: Actual ablation results  
   - Section 5.6.2: Actual temporal degradation curve

5. Validate browser integration with:
   npm run dev
   Navigate to demo page and test phishing detector
    """)

if __name__ == "__main__":
    main()
