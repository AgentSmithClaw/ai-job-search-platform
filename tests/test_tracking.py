import pytest
from app.services.tracking import (
    create_job_application,
    get_user_applications,
    update_application_status,
    delete_application,
    ApplicationStatus,
    create_learning_task,
    get_user_learning_tasks,
    update_learning_task_status,
    delete_learning_task,
    LearningTaskStatus,
    create_interview_prep,
    get_user_interview_prep,
    update_interview_prep,
)


class TestJobApplications:
    def test_create_application(self, test_user):
        app_id = create_job_application(
            user_id=test_user.id,
            company_name="TestCorp",
            target_role="Backend Engineer",
            job_description="Python developer needed",
            status=ApplicationStatus.INTERESTED,
        )
        assert app_id > 0

    def test_get_user_applications(self, test_user):
        create_job_application(test_user.id, "Acme", "Engineer", "desc", ApplicationStatus.INTERESTED)
        create_job_application(test_user.id, "Beta", "DevOps", "desc", ApplicationStatus.APPLIED)
        apps = get_user_applications(test_user.id)
        assert len(apps) == 2

    def test_get_user_applications_filtered(self, test_user):
        create_job_application(test_user.id, "Acme", "Engineer", "desc", ApplicationStatus.INTERESTED)
        create_job_application(test_user.id, "Beta", "DevOps", "desc", ApplicationStatus.APPLIED)
        apps = get_user_applications(test_user.id, ApplicationStatus.APPLIED)
        assert len(apps) == 1
        assert apps[0]["company_name"] == "Beta"

    def test_update_application_status(self, test_user):
        app_id = create_job_application(test_user.id, "Acme", "Engineer", "desc", ApplicationStatus.INTERESTED)
        result = update_application_status(app_id, test_user.id, ApplicationStatus.APPLIED)
        assert result is True
        apps = get_user_applications(test_user.id)
        assert apps[0]["status"] == "applied"

    def test_update_application_status_not_found(self, test_user):
        result = update_application_status(99999, test_user.id, ApplicationStatus.APPLIED)
        assert result is False

    def test_delete_application(self, test_user):
        app_id = create_job_application(test_user.id, "Acme", "Engineer", "desc")
        result = delete_application(app_id, test_user.id)
        assert result is True
        apps = get_user_applications(test_user.id)
        assert len(apps) == 0

    def test_delete_application_not_found(self, test_user):
        result = delete_application(99999, test_user.id)
        assert result is False


class TestLearningTasks:
    def test_create_task(self, test_user):
        task_id = create_learning_task(
            user_id=test_user.id,
            session_id=None,
            title="Learn Kubernetes",
            description="Complete K8s course",
            priority="high",
        )
        assert task_id > 0

    def test_get_tasks(self, test_user):
        create_learning_task(test_user.id, None, title="Task 1", description="", priority="high")
        create_learning_task(test_user.id, None, title="Task 2", description="", priority="low")
        tasks = get_user_learning_tasks(test_user.id)
        assert len(tasks) == 2

    def test_get_tasks_high_priority_first(self, test_user):
        create_learning_task(test_user.id, None, title="Low", description="", priority="low")
        create_learning_task(test_user.id, None, title="High", description="", priority="high")
        tasks = get_user_learning_tasks(test_user.id)
        assert tasks[0]["priority"] == "high"

    def test_update_task_status(self, test_user):
        task_id = create_learning_task(test_user.id, None, title="Task", description="")
        result = update_learning_task_status(task_id, test_user.id, LearningTaskStatus.COMPLETED)
        assert result is True
        tasks = get_user_learning_tasks(test_user.id)
        assert tasks[0]["status"] == "completed"

    def test_delete_task(self, test_user):
        task_id = create_learning_task(test_user.id, None, title="Task", description="")
        result = delete_learning_task(task_id, test_user.id)
        assert result is True
        tasks = get_user_learning_tasks(test_user.id)
        assert len(tasks) == 0


class TestInterviewPrep:
    def test_create_prep(self, test_user):
        prep_id = create_interview_prep(
            user_id=test_user.id,
            session_id=None,
            application_id=None,
            question="Tell me about yourself",
            ideal_answer="I am a developer...",
        )
        assert prep_id > 0

    def test_get_preps(self, test_user):
        create_interview_prep(test_user.id, None, None, question="Q1")
        create_interview_prep(test_user.id, None, None, question="Q2")
        preps = get_user_interview_prep(test_user.id)
        assert len(preps) == 2

    def test_update_prep(self, test_user):
        prep_id = create_interview_prep(test_user.id, None, None, question="Q1")
        result = update_interview_prep(prep_id, test_user.id, ideal_answer="My answer is...", status="prepared")
        assert result is True
        preps = get_user_interview_prep(test_user.id)
        assert preps[0]["status"] == "prepared"
