from __future__ import annotations

from app.config import settings


class EmailService:
    def __init__(self):
        self.enabled = bool(settings.SMTP_USER and settings.SMTP_PASSWORD and settings.SMTP_HOST)

    def send_email(self, to: str, subject: str, body: str) -> bool:
        if not self.enabled:
            print(f"[Email] Would send to {to}: {subject}")
            return True

        try:
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText

            msg = MIMEMultipart()
            msg['From'] = settings.FROM_EMAIL
            msg['To'] = to
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'html', 'utf-8'))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

            return True
        except Exception as error:
            print(f"[Email] Failed to send email: {error}")
            return False

    def send_analysis_complete(self, to: str, target_role: str, match_score: int) -> bool:
        subject = f"GapPilot analysis complete - {target_role}"
        body = f"""
        <html>
        <body>
            <h2>Your job match analysis is ready</h2>
            <p>Target role: <strong>{target_role}</strong></p>
            <p>Match score: <strong>{match_score}%</strong></p>
            <p>Please sign in to GapPilot to review the full report, resume draft, and next-step recommendations.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">This email was sent automatically by GapPilot.</p>
        </body>
        </html>
        """
        return self.send_email(to, subject, body)

    def send_credit_reminder(self, to: str, credits: int) -> bool:
        subject = "GapPilot credit reminder"
        body = f"""
        <html>
        <body>
            <h2>Credit reminder</h2>
            <p>Your remaining analysis balance is <strong>{credits}</strong>.</p>
            <p>Please top up your credits if you want to continue using the analysis workflow without interruption.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">This email was sent automatically by GapPilot.</p>
        </body>
        </html>
        """
        return self.send_email(to, subject, body)


email_service = EmailService()
