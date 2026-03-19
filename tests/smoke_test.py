"""
Smoke Test for AI Job Search Platform - Main Path
"""
import requests
import sys

BASE_URL = "http://127.0.0.1:8080"

def test(name, fn):
    try:
        result = fn()
        status = "PASS" if result else "FAIL"
        print(f"[{status}] {name}")
        return result
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return False

def main():
    print("=" * 50)
    print("AI Job Search Platform - Smoke Test")
    print("=" * 50)

    results = []

    print("\n--- Health Check ---")
    results.append(test("Health", lambda: requests.get(f"{BASE_URL}/health").status_code == 200))

    print("\n--- Auth ---")
    results.append(test("Register/Login", lambda: (
        requests.post(f"{BASE_URL}/api/auth/register", json={"email": "smoke@test.com", "name": "Smoke Test"}).status_code in [200, 400]
    )))

    print("\n--- Pricing ---")
    results.append(test("Get Pricing", lambda: (
        requests.get(f"{BASE_URL}/api/pricing").status_code == 200
    )))

    print("\n--- Providers ---")
    results.append(test("Get Providers", lambda: (
        requests.get(f"{BASE_URL}/api/providers").status_code == 200
    )))

    print("\n--- Resume Upload ---")
    results.append(test("Resume Upload", lambda: (
        requests.post(
            f"{BASE_URL}/api/resume/upload",
            files={"file": ("test.txt", b"test resume content with python sql experience", "text/plain")}
        ).status_code == 200
    )))

    print("\n" + "=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} passed")

    if passed == total:
        print("All smoke tests PASSED")
        sys.exit(0)
    else:
        print("Some smoke tests FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()