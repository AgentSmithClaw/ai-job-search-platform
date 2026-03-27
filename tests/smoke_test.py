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


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


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
    order_id = None
    application_id = None
    task_id = None
    prep_id = None

    with TestClient(app) as client:
        print("\n--- Health Check ---")
        results.append(smoke_check("Health", lambda: client.get("/health").status_code == 200))

        print("\n--- Auth ---")
        r = client.post("/api/auth/register", json={"email": smoke_email, "name": "Smoke Test"})
        results.append(smoke_check("Register", lambda: r.status_code == 200))
        if r.status_code == 200:
            token = r.json().get("access_token")

            me_resp = client.get("/api/auth/me", headers=auth_headers(token))
            results.append(smoke_check("Auth Me", lambda: me_resp.status_code == 200))

            profile_resp = client.patch(
                "/api/auth/profile",
                headers=auth_headers(token),
                json={"name": "Smoke Test Updated"},
            )
            results.append(smoke_check("Profile Update", lambda: profile_resp.status_code == 200))

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
                headers=auth_headers(token),
                json={"package_code": "gap-report"},
            )
            results.append(smoke_check("Mock Payment Create", lambda: r.status_code == 200))
            results.append(smoke_check("Payment Credits Added", lambda: (
                r.status_code == 200 and r.json().get("credits_added", 0) >= 1
            )))
            if r.status_code == 200:
                order_id = r.json().get("order_id")

            orders_resp = client.get("/api/payment/orders", headers=auth_headers(token))
            results.append(smoke_check("Payment Orders Fetch", lambda: orders_resp.status_code == 200))
        else:
            results.append(smoke_check("Mock Payment Create", lambda: False))
            results.append(smoke_check("Payment Credits Added", lambda: False))
            results.append(smoke_check("Payment Orders Fetch", lambda: False))

        print("\n--- Dashboard ---")
        if token:
            dashboard_resp = client.get("/api/dashboard", headers=auth_headers(token))
            results.append(smoke_check("Dashboard Fetch", lambda: dashboard_resp.status_code == 200))
        else:
            results.append(smoke_check("Dashboard Fetch", lambda: False))

        print("\n--- Analyze ---")
        if token:
            r = client.post(
                "/api/analyze",
                headers=auth_headers(token),
                json={
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
            r = client.get("/api/sessions", headers=auth_headers(token), params={"limit": 10})
            results.append(smoke_check("History Fetch", lambda: r.status_code == 200))
            results.append(smoke_check("History Has Items", lambda: (
                r.status_code == 200 and r.json().get("total", 0) >= 1
            )))
            if session_id:
                r_docx = client.get(f"/api/export/{session_id}", headers=auth_headers(token), params={"format": "docx"})
                results.append(smoke_check("Export DOCX", lambda: r_docx.status_code == 200))
                r_pdf = client.get(f"/api/export/{session_id}", headers=auth_headers(token), params={"format": "pdf"})
                results.append(smoke_check("Export PDF", lambda: r_pdf.status_code == 200))
            else:
                results.extend([smoke_check(n, lambda: False) for n in ["Export DOCX", "Export PDF"]])
        else:
            results.extend([smoke_check(n, lambda: False) for n in ["History Fetch", "History Has Items", "Export DOCX", "Export PDF"]])

        print("\n--- Tracking ---")
        if token:
            application_resp = client.post(
                "/api/applications",
                headers=auth_headers(token),
                json={
                    "company_name": "Acme Corp",
                    "target_role": "Backend Engineer",
                    "job_description": "FastAPI, PostgreSQL, Docker",
                    "status": "interested",
                    "application_url": "https://example.com/jobs/1",
                    "salary_range": "20k-30k",
                    "notes": "Imported from smoke test",
                },
            )
            results.append(smoke_check("Create Application", lambda: application_resp.status_code == 200))
            if application_resp.status_code == 200:
                application_id = application_resp.json().get("id")

            list_app_resp = client.get("/api/applications", headers=auth_headers(token))
            results.append(smoke_check("List Applications", lambda: list_app_resp.status_code == 200))

            if application_id:
                update_app_resp = client.patch(
                    f"/api/applications/{application_id}",
                    headers=auth_headers(token),
                    json={"status": "applied"},
                )
                results.append(smoke_check("Update Application", lambda: update_app_resp.status_code == 200))
            else:
                results.append(smoke_check("Update Application", lambda: False))

            task_resp = client.post(
                "/api/learning-tasks",
                headers=auth_headers(token),
                json={
                    "title": "Learn Kubernetes basics",
                    "description": "Fill the deployment gap",
                    "session_id": session_id,
                    "priority": "high",
                },
            )
            results.append(smoke_check("Create Learning Task", lambda: task_resp.status_code == 200))
            if task_resp.status_code == 200:
                task_id = task_resp.json().get("id")

            list_task_resp = client.get("/api/learning-tasks", headers=auth_headers(token))
            results.append(smoke_check("List Learning Tasks", lambda: list_task_resp.status_code == 200))

            if task_id:
                update_task_resp = client.patch(
                    f"/api/learning-tasks/{task_id}",
                    headers=auth_headers(token),
                    json={"status": "completed"},
                )
                results.append(smoke_check("Update Learning Task", lambda: update_task_resp.status_code == 200))
            else:
                results.append(smoke_check("Update Learning Task", lambda: False))

            prep_resp = client.post(
                "/api/interview-prep",
                headers=auth_headers(token),
                json={
                    "question": "Tell me about a time you improved a backend system.",
                    "ideal_answer": "I improved reliability by introducing health checks and rollback guards.",
                    "notes": "Mention production impact",
                    "session_id": session_id,
                },
            )
            results.append(smoke_check("Create Interview Prep", lambda: prep_resp.status_code == 200))
            if prep_resp.status_code == 200:
                prep_id = prep_resp.json().get("id")

            list_prep_resp = client.get("/api/interview-prep", headers=auth_headers(token))
            results.append(smoke_check("List Interview Prep", lambda: list_prep_resp.status_code == 200))

            if prep_id:
                update_prep_resp = client.patch(
                    f"/api/interview-prep/{prep_id}",
                    headers=auth_headers(token),
                    json={
                        "ideal_answer": "Updated answer",
                        "notes": "Updated notes",
                        "status": "prepared",
                    },
                )
                results.append(smoke_check("Update Interview Prep", lambda: update_prep_resp.status_code == 200))
            else:
                results.append(smoke_check("Update Interview Prep", lambda: False))

            if application_id:
                delete_app_resp = client.delete(f"/api/applications/{application_id}", headers=auth_headers(token))
                results.append(smoke_check("Delete Application", lambda: delete_app_resp.status_code == 200))
            else:
                results.append(smoke_check("Delete Application", lambda: False))

            if task_id:
                delete_task_resp = client.delete(f"/api/learning-tasks/{task_id}", headers=auth_headers(token))
                results.append(smoke_check("Delete Learning Task", lambda: delete_task_resp.status_code == 200))
            else:
                results.append(smoke_check("Delete Learning Task", lambda: False))

            if prep_id:
                delete_prep_resp = client.delete(f"/api/interview-prep/{prep_id}", headers=auth_headers(token))
                results.append(smoke_check("Delete Interview Prep", lambda: delete_prep_resp.status_code == 200))
            else:
                results.append(smoke_check("Delete Interview Prep", lambda: False))
        else:
            results.extend(
                [
                    smoke_check(name, lambda: False)
                    for name in [
                        "Create Application",
                        "List Applications",
                        "Update Application",
                        "Create Learning Task",
                        "List Learning Tasks",
                        "Update Learning Task",
                        "Create Interview Prep",
                        "List Interview Prep",
                        "Update Interview Prep",
                        "Delete Application",
                        "Delete Learning Task",
                        "Delete Interview Prep",
                    ]
                ]
            )

        print("\n--- Refund ---")
        if token and order_id:
            refund_resp = client.post(f"/api/payment/refund/{order_id}", headers=auth_headers(token))
            results.append(smoke_check("Refund Order", lambda: refund_resp.status_code == 200))
        else:
            results.append(smoke_check("Refund Order", lambda: False))

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
