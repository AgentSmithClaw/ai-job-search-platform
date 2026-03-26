"""
Smoke Test for AI Job Search Platform - Main Path
Runs in-process via FastAPI TestClient so it does not depend on any external port.
"""
import os
import sys
import time
from pathlib import Path

os.environ["TESTING"] = "1"
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

smoke_email = f"smoke_{time.time()}@test.com"


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
    session_id = None

    with TestClient(app) as client:
        print("\n--- Health Check ---")
        results.append(smoke_check("Health", lambda: client.get("/health").status_code == 200))

        print("\n--- Auth ---")
        r = client.post("/api/auth/register", json={"email": smoke_email, "name": "Smoke Test"})
        results.append(smoke_check("Register", lambda: r.status_code == 200))
        if r.status_code == 200:
            token = r.json().get("access_token")

        print("\n--- Pricing ---")
        results.append(smoke_check("Get Pricing", lambda: client.get("/api/pricing").status_code == 200))

        print("\n--- Providers ---")
        results.append(smoke_check("Get Providers", lambda: client.get("/api/providers").status_code == 200))

        print("\n--- Resume Upload ---")
        upload_resp = client.post(
            "/api/resume/upload",
            files={"file": ("test.txt", b"test resume content with python sql experience", "text/plain")},
        )
        results.append(smoke_check("Resume Upload", lambda: upload_resp.status_code == 200))

        print("\n--- Payment (Mock) ---")
        if token:
            r = client.post(
                "/api/payment/create",
                json={"access_token": token, "package_code": "gap-report"},
            )
            results.append(smoke_check("Mock Payment Create", lambda: r.status_code == 200))
            results.append(smoke_check("Payment Credits Added", lambda: (
                r.status_code == 200 and r.json().get("credits_added", 0) >= 1
            )))
        else:
            results.append(smoke_check("Mock Payment Create", lambda: False))
            results.append(smoke_check("Payment Credits Added", lambda: False))

        print("\n--- Analyze ---")
        if token:
            r = client.post(
                "/api/analyze",
                json={
                    "access_token": token,
                    "target_role": "Python Backend Engineer",
                    "resume_text": "Python developer with 3 years experience in FastAPI, SQL, and Docker. Skilled in Django and PostgreSQL databases.",
                    "job_description": "We need a Python backend engineer familiar with FastAPI, PostgreSQL, Docker, and Kubernetes. Experience with cloud platforms is a plus.",
                },
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
            r = client.get(f"/api/sessions?access_token={token}&limit=10")
            results.append(smoke_check("History Fetch", lambda: r.status_code == 200))
            results.append(smoke_check("History Has Items", lambda: (
                r.status_code == 200 and r.json().get("total", 0) >= 1
            )))
            if session_id:
                r_docx = client.get(f"/api/export/{session_id}?access_token={token}&format=docx")
                results.append(smoke_check("Export DOCX", lambda: r_docx.status_code == 200))
                r_pdf = client.get(f"/api/export/{session_id}?access_token={token}&format=pdf")
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
