from flask import current_app
from flask_mail import Mail, Message
from threading import Thread
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

mail = Mail()

def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

def send_email(subject, recipient, template):
    """Send email asynchronously"""
    app = current_app._get_current_object()
    msg = Message(
        subject,
        sender=app.config['MAIL_DEFAULT_SENDER'],
        recipients=[recipient]
    )
    msg.html = template

    # Send email asynchronously
    Thread(target=send_async_email, args=(app, msg)).start()

def send_verification_email(to_email, code):
    """Send verification code via email"""
    sender_email = os.getenv('MAIL_USERNAME')
    sender_password = os.getenv('MAIL_PASSWORD')

    print(f"📧 Attempting to send email to: {to_email}")
    print(f"📧 Using sender: {sender_email}")
    print(f"📧 MAIL_SERVER: {os.getenv('MAIL_SERVER', 'smtp.gmail.com')}")
    print(f"📧 MAIL_PORT: {os.getenv('MAIL_PORT', 587)}")

    if not sender_email or not sender_password:
        print("❌ Email credentials not configured!")
        raise ValueError("Email credentials not configured. Please set MAIL_USERNAME and MAIL_PASSWORD in Secrets.")

    message = MIMEMultipart("alternative")
    message["Subject"] = "Your Verification Code - ReConnect Platform"
    message["From"] = sender_email
    message["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4F46E5;">Your Verification Code</h2>
        <p>Your verification code is:</p>
        <h1 style="background: #F3F4F6; padding: 15px; border-radius: 8px; letter-spacing: 8px; color: #1F2937;">{code}</h1>
        <p style="color: #6B7280;">This code will expire in 15 minutes.</p>
        <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
      </body>
    </html>
    """

    part = MIMEText(html, "html")
    message.attach(part)

    try:
        print("📧 Connecting to SMTP server...")
        with smtplib.SMTP(os.getenv('MAIL_SERVER', 'smtp.gmail.com'), int(os.getenv('MAIL_PORT', 587))) as server:
            server.set_debuglevel(1)  # Enable debug output
            print("📧 Starting TLS...")
            server.starttls()
            print("📧 Logging in...")
            server.login(sender_email, sender_password)
            print("📧 Sending email...")
            server.sendmail(sender_email, to_email, message.as_string())
            print(f"✅ Email sent successfully to {to_email}")
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP Authentication Error: {str(e)}")
        raise Exception(f"Email authentication failed. Please verify your MAIL_USERNAME and MAIL_PASSWORD (use App Password for Gmail).")
    except smtplib.SMTPException as e:
        print(f"❌ SMTP Error: {str(e)}")
        raise Exception(f"Failed to send email: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        raise Exception(f"Failed to send email: {str(e)}")