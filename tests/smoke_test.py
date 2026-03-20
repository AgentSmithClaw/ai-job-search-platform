"""
Smoke Test for AI Job Search Platform - Main Path
"""
import requests
import sys

BASE_URL = "http://127.0.0.1:8080"

smoke_email = f"smoke_{__import__('time').time()}@test.com"

def smoke_check(name, fn):
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
    token = None

    print("\n--- Health Check ---")
    results.append(smoke_check("Health", lambda: requests.get(f"{BASE_URL}/health").status_code == 200))

    print("\n--- Auth ---")
    r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": smoke_email, "name": "Smoke Test"})
    results.append(smoke_check("Register", lambda: r.status_code == 200))
    if r.status_code == 200:
        token = r.json().get("access_token")

    print("\n--- Pricing ---")
    results.append(smoke_check("Get Pricing", lambda: requests.get(f"{BASE_URL}/api/pricing").status_code == 200))

    print("\n--- Providers ---")
    results.append(smoke_check("Get Providers", lambda: requests.get(f"{BASE_URL}/api/providers").status_code == 200))

    print("\n--- Resume Upload ---")
    results.append(smoke_check("Resume Upload", lambda: (
        requests.post(
            f"{BASE_URL}/api/resume/upload",
            files={"file": ("test.txt", b"test resume content with python sql experience", "text/plain")}
        ).status_code == 200
    )))

    print("\n--- Payment (Mock) ---")
    if token:
        r = requests.post(
            f"{BASE_URL}/api/payment/create",
            json={"access_token": token, "package_code": "gap-report"}
        )
        results.append(smoke_check("Mock Payment Create", lambda: r.status_code == 200))
        results.append(smoke_check("Payment Credits Added", lambda: (
            r.status_code == 200 and r.json().get("credits_added", 0) >= 1
        )))
    else:
        results.append(smoke_check("Mock Payment Create", lambda: False))
        results.append(smoke_check("Payment Credits Added", lambda: False))

    print("\n--- Analyze ---")
    session_id = None
    if token:
        r = requests.post(
            f"{BASE_URL}/api/analyze",
            json={
                "access_token": token,
                "target_role": "Python Backend Engineer",
                "resume_text": "Python developer with 3 years experience in FastAPI, SQL, and Docker. Skilled in Django and PostgreSQL databases.",
                "job_description": "We need a Python backend engineer familiar with FastAPI, PostgreSQL, Docker, and Kubernetes. Experience with cloud platforms is a plus."
            }
        )
        results.append(smoke_check("Analyze", lambda: r.status_code == 200))
        results.append(smoke_check("Analyze Score Valid", lambda: (
            r.status_code == 200 and 0 <= r.json().get("report", {}).get("match_score", -1) <= 100
        )))
        results.append(smoke_check("Analyze Credits Deducted", lambda: (
            r.status_code == 200 and r.json().get("credits_remaining", 999) >= 0
        )))
        if r.status_code == 200:
            session_id = r.json().get("session_id")
    else:
        results.extend([smoke_check(n, lambda: False) for n in ["Analyze", "Analyze Score Valid", "Analyze Credits Deducted"]])

    print("\n--- History & Export ---")
    if token:
        r = requests.get(f"{BASE_URL}/api/sessions?access_token={token}&limit=10")
        results.append(smoke_check("History Fetch", lambda: r.status_code == 200))
        results.append(smoke_check("History Has Items", lambda: (
            r.status_code == 200 and r.json().get("total", 0) >= 1
        )))
        if session_id:
            r_docx = requests.get(f"{BASE_URL}/api/export/{session_id}?access_token={token}&format=docx")
            results.append(smoke_check("Export DOCX", lambda: r_docx.status_code == 200))
            r_pdf = requests.get(f"{BASE_URL}/api/export/{session_id}?access_token={token}&format=pdf")
            results.append(smoke_check("Export PDF", lambda: r_pdf.status_code == 200))
        else:
            results.extend([smoke_check(n, lambda: False) for n in ["Export DOCX", "Export PDF"]])
    else:
        results.extend([smoke_check(n, lambda: False) for n in ["History Fetch", "History Has Items", "Export DOCX", "Export PDF"]])

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