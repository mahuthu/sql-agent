from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.config import get_settings
import logging
from typing import List

settings = get_settings()
logger = logging.getLogger(__name__)

# conf = ConnectionConfig(
#     MAIL_USERNAME=settings.MAIL_USERNAME,
#     MAIL_PASSWORD=settings.MAIL_PASSWORD,
#     MAIL_FROM=settings.MAIL_FROM,
#     MAIL_PORT=settings.MAIL_PORT,
#     MAIL_SERVER=settings.MAIL_SERVER,
#     MAIL_TLS=True,
#     MAIL_SSL=False,
#     USE_CREDENTIALS=True
# )


conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,  # Instead of MAIL_TLS
    MAIL_SSL_TLS=False,  # Instead of MAIL_SSL
    USE_CREDENTIALS=True
)

async def send_email(
    email: str,
    subject: str,
    body: str,
    template_name: str = None
):
    """Send email using FastMail"""
    try:
        message = MessageSchema(
            subject=subject,
            recipients=[email],
            body=body,
            subtype="html"
        )
        
        fm = FastMail(conf)
        await fm.send_message(message, template_name=template_name)
        logger.info(f"Email sent successfully to {email}")
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        raise

async def send_welcome_email(email: str):
    """Send welcome email to new users"""
    subject = "Welcome to SQL Agent Service"
    body = """
    <h2>Welcome to SQL Agent Service!</h2>
    <p>Thank you for registering. Here's how to get started:</p>
    <ol>
        <li>Create a query template</li>
        <li>Add example queries</li>
        <li>Start asking questions in natural language</li>
    </ol>
    """
    await send_email(email, subject, body)

async def send_password_reset_email(email: str, token: str):
    """Send password reset email"""
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"
    subject = "Password Reset Request"
    body = f"""
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <p><a href="{reset_link}">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    """
    await send_email(email, subject, body) 