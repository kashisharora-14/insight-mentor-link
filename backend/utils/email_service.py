from flask import current_app
from flask_mail import Mail, Message
from threading import Thread

mail = Mail()

def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

def send_email(subject, recipient, template):
    """
    Send email asynchronously
    """
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
    """
    Send verification code email
    """
    subject = "Verify Your Email - Insight Mentor Link"
    template = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome to Insight Mentor Link!</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4a90e2; font-size: 32px; letter-spacing: 5px; padding: 20px;">{verification_code}</h1>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>The Insight Mentor Link Team</p>
        </body>
    </html>
    """
    
    send_email(subject, email, template)

def send_welcome_email(email, name):
    """
    Send welcome email after successful registration
    """
    subject = "Welcome to Insight Mentor Link!"
    template = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome to Insight Mentor Link{', ' + name if name else ''}!</h2>
            <p>Thank you for joining our platform. We're excited to have you as part of our community!</p>
            <p>With Insight Mentor Link, you can:</p>
            <ul>
                <li>Connect with alumni and mentors</li>
                <li>Get career guidance</li>
                <li>Share your experiences</li>
                <li>Stay updated with opportunities</li>
            </ul>
            <p>Get started by completing your profile and exploring the platform.</p>
            <br>
            <p>Best regards,</p>
            <p>The Insight Mentor Link Team</p>
        </body>
    </html>
    """
    
    send_email(subject, email, template)