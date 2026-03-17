import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)

def _send_smtp_email(to_email: str, subject: str, html_content: str, app_name: str) -> bool:
    """
    Internal helper to send email via SMTP.
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{app_name} <{settings.smtp_from}>"
        msg["To"] = to_email

        # Create the HTML part
        part = MIMEText(html_content, "html")
        msg.attach(part)

        # Connect and send
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()  # Secure the connection
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, to_email, msg.as_string())
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP: {e}")
        return False

def send_reset_email(to_email: str, reset_link: str, app_name: str = "BharatShodh") -> bool:
    """
    Send password reset email using SMTP.
    """
    subject = f"{app_name} — Password reset"
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .cta-button {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset</h1>
                </div>
                <div class="content">
                    <p>Hi,</p>
                    <p>We received a request to reset your {app_name} password.</p>
                    <p>Click the button below to reset your password. This link expires in {settings.reset_token_ttl_minutes} minutes.</p>
                    <center><a href="{reset_link}" class="cta-button" style="color: white;">Reset Your Password</a></center>
                    <p>If you didn't request a reset, you can safely ignore this email.</p>
                    <p>Best regards,<br><strong>{app_name} Team</strong></p>
                </div>
                <div class="footer">
                    <p>© {app_name}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    """
    return _send_smtp_email(to_email, subject, html_content, app_name)

def send_approval_email(to_email: str, login_link: str, app_name: str = "BharatShodh") -> bool:
    """
    Send account approval email using SMTP.
    """
    subject = f"🎉 {app_name} — Your Account is Approved!"
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .cta-button {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
                .check-mark {{ font-size: 48px; margin-bottom: 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="check-mark">✅</div>
                    <h1>Account Approved!</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Great news! Your account registration has been reviewed and <strong>approved</strong>. You can now log in to {app_name} and start using all the features.</p>
                    <p>Click the button below to log in:</p>
                    <center><a href="{login_link}" class="cta-button" style="color: white;">Login Now</a></center>
                    <p>Or copy and paste this link in your browser:</p>
                    <p><small>{login_link}</small></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p>Welcome to {app_name}! 🎉</p>
                    <p>Best regards,<br><strong>{app_name} Team</strong></p>
                </div>
                <div class="footer">
                    <p>© {app_name}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    """
    return _send_smtp_email(to_email, subject, html_content, app_name)

def send_rejection_email(to_email: str, reason: Optional[str], app_name: str = "BharatShodh") -> bool:
    """
    Send account rejection email using SMTP.
    """
    subject = f"{app_name} — Registration Update"
    reason_text = reason if reason else "Your application does not meet our requirements at this time."
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #f8d7da; color: #721c24; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Registration Decision</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Thank you for your interest in {app_name}. After reviewing your application, we regret to inform you that your registration request has been <strong>not approved</strong> at this time.</p>
                    <p><strong>Reason:</strong><br>{reason_text}</p>
                    <p>If you have questions about this decision or would like to reapply, please contact our support team.</p>
                    <p>Best regards,<br><strong>{app_name} Team</strong></p>
                </div>
                <div class="footer">
                    <p>© {app_name}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    """
    return _send_smtp_email(to_email, subject, html_content, app_name)
