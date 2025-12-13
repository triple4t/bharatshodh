# app/utils/emailer.py
import os
import requests
from typing import Optional
from config import Settings

settings = Settings()

BREVO_API_KEY = settings.brevo_api_key
FROM_EMAIL = settings.app_from_email
RESET_TOKEN_TTL_MINUTES = settings.reset_token_ttl_minutes
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"  # transactional endpoint

def send_reset_email(to_email: str, reset_link: str, app_name: str = "MyApp") -> Optional[dict]:
    """
    Send password reset email using Brevo HTTP API.
    Returns Brevo response JSON or raises on non-2xx.
    """
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY
    }
    data = {
        "sender": {"email": FROM_EMAIL, "name": app_name},
        "to": [{"email": to_email}],
        "subject": f"{app_name} — Password reset",
        "htmlContent": f"""
            <p>Hi,</p>
            <p>We received a request to reset your {app_name} password.</p>
            <p>Click the link below to reset your password. This link expires in {RESET_TOKEN_TTL_MINUTES} minutes.</p>
            <p><a href="{reset_link}">Reset your password</a></p>
            <p>If you didn't request a reset, ignore this email or contact support.</p>
        """
    }
    resp = requests.post(BREVO_API_URL, headers=headers, json=data, timeout=10)
    resp.raise_for_status()
    return resp.json()

def send_approval_email(to_email: str, login_link: str, app_name: str = "MyApp") -> Optional[dict]:
    """
    Send account approval email using Brevo HTTP API.
    Returns Brevo response JSON or raises on non-2xx.
    """
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY
    }
    data = {
        "sender": {"email": FROM_EMAIL, "name": app_name},
        "to": [{"email": to_email}],
        "subject": f"🎉 {app_name} — Your Account is Approved!",
        "htmlContent": f"""
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
                        <p><strong>What you can do now:</strong></p>
                        <ul>
                            <li>Log in to your account</li>
                            <li>Start chatting with our AI assistant</li>
                            <li>Manage your conversations</li>
                            <li>Access premium features</li>
                        </ul>
                        <p>Click the button below to log in:</p>
                        <center><a href="{login_link}" class="cta-button">Login Now</a></center>
                        <p>Or copy and paste this link in your browser:</p>
                        <p><small>{login_link}</small></p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p><strong>If you prefer to refresh and login:</strong></p>
                        <p>Simply visit {app_name}, refresh the page, and log in with your email and password.</p>
                        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
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
    }
    resp = requests.post(BREVO_API_URL, headers=headers, json=data, timeout=10)
    resp.raise_for_status()
    return resp.json()

def send_rejection_email(to_email: str, reason: Optional[str], app_name: str = "MyApp") -> Optional[dict]:
    """
    Send account rejection email using Brevo HTTP API.
    Returns Brevo response JSON or raises on non-2xx.
    """
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY
    }
    reason_text = reason if reason else "Your application does not meet our requirements at this time."
    
    data = {
        "sender": {"email": FROM_EMAIL, "name": app_name},
        "to": [{"email": to_email}],
        "subject": f"{app_name} — Registration Update",
        "htmlContent": f"""
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
                        <p>We appreciate your understanding.</p>
                        <p>Best regards,<br><strong>{app_name} Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© {app_name}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        """
    }
    resp = requests.post(BREVO_API_URL, headers=headers, json=data, timeout=10)
    resp.raise_for_status()
    return resp.json()
