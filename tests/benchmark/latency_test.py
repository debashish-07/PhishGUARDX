import time
import requests
import statistics

BASE_URL = "http://localhost:8000"

def benchmark_health_check(iterations=100):
    latencies = []
    print(f"Benchmarking {BASE_URL}/health for {iterations} iterations...")
    
    for _ in range(iterations):
        start = time.time()
        try:
            requests.get(f"{BASE_URL}/health")
            latencies.append((time.time() - start) * 1000) # ms
        except Exception as e:
            print(f"Request failed: {e}")
            
    if latencies:
        print(f"Avg Latency: {statistics.mean(latencies):.2f} ms")
        print(f"Max Latency: {max(latencies):.2f} ms")
        print(f"Min Latency: {min(latencies):.2f} ms")
    else:
        print("No successful requests.")

if __name__ == "__main__":
    # Ensure backend is running before executing this
    try:
        benchmark_health_check()
    except requests.exceptions.ConnectionError:
        print("Backend is not running. Please start the FastAPI server first.")
