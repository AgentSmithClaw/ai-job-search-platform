from __future__ import annotations

import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

SMTP_HOST = os.getenv('SMTP_HOST', '')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
FROM_EMAIL = os.getenv('FROM_EMAIL', SMTP_USER)


class EmailService:
    def __init__(self):
        self.enabled = bool(SMTP_USER and SMTP_PASSWORD and SMTP_HOST)

    def send_email(self, to: str, subject: str, body: str) -> bool:
        if not self.enabled:
            print(f"[Email] Would send to {to}: {subject}")
            return True

        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart()
            msg['From'] = FROM_EMAIL
            msg['To'] = to
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'html', 'utf-8'))

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)

            return True
        except Exception as e:
            print(f"[Email] Failed to send email: {e}")
            return False

    def send_analysis_complete(self, to: str, target_role: str, match_score: int) -> bool:
        subject = f"求职分析完成 - {target_role}"
        body = f"""
        <html>
        <body>
            <h2>您的求职分析报告已生成</h2>
            <p>目标岗位: <strong>{target_role}</strong></p>
            <p>匹配度: <strong>{match_score}%</strong></p>
            <p>请登录平台查看完整的分析报告、简历草稿和学习建议。</p>
            <hr>
            <p style="color: #666; font-size: 12px;">此邮件由 AI Job Search Platform 自动发送</p>
        </body>
        </html>
        """
        return self.send_email(to, subject, body)

    def send_credit_reminder(self, to: str, credits: int) -> bool:
        subject = "额度提醒 - 您的分析额度即将用完"
        body = f"""
        <html>
        <body>
            <h2>额度提醒</h2>
            <p>您当前的剩余分析额度为: <strong>{credits} 次</strong></p>
            <p>请及时购买套餐以继续使用服务。</p>
            <hr>
            <p style="color: #666; font-size: 12px;">此邮件由 AI Job Search Platform 自动发送</p>
        </body>
        </html>
        """
        return self.send_email(to, subject, body)


email_service = EmailService()