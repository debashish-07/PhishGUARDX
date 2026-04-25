#!/usr/bin/env python
import sys
sys.path.insert(0, '.')

try:
    from backend.main import app
    print("✓ App imported successfully")
    print(f"✓ App type: {type(app)}")
    print(f"✓ Routes count: {len(app.routes)}")
    for route in app.routes:
        print(f"  - {route}")
except Exception as e:
    print(f"✗ Import error: {e}")
    import traceback
    traceback.print_exc()
