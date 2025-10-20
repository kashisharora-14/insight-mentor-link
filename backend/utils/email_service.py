from flask import current_app
from flask_mail import Mail, Message
from threading import Thread

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

def send_verification_email(email, verification_code):
    """Send verification code email"""
    subject = "Your Login Code - Re-Connect"
    template = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Welcome to Re-Connect!</h2>
                <p style="color: #666; font-size: 16px;">Your verification code is:</p>
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h1 style="color: #4a90e2; font-size: 36px; letter-spacing: 8px; margin: 0;">{verification_code}</h1>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">Re-Connect Alumni Platform</p>
            </div>
        </body>
    </html>
    """

    send_email(subject, email, template)