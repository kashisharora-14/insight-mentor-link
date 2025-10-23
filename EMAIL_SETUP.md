
# 📧 Email Authentication Setup Guide

This application uses **email-based authentication** for both Students and Alumni. No passwords are stored - users login using verification codes sent to their email.

## Required Environment Variables

Set these in **Replit Secrets** (click the lock icon 🔒 in the left sidebar):

### Gmail SMTP Credentials

```
MAIL_USERNAME = your-gmail@gmail.com
MAIL_PASSWORD = your-16-char-app-password
```

**Important:** Do NOT use your regular Gmail password. Use an **App Password** instead.

## How to Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Enable **2-Step Verification** (required for App Passwords)
4. Search for "App Passwords" or go to: https://myaccount.google.com/apppasswords
5. Create a new App Password:
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: **Re-Connect Alumni Platform**
6. Click **Generate**
7. Copy the **16-character password** (without spaces)
8. Add to Replit Secrets as `MAIL_PASSWORD`

## Testing Email Configuration

After setting up the secrets:

1. Restart your Repl (click Stop, then Run)
2. Try registering a new user
3. Check the server console for email sending logs:
   - ✅ Success: "Email sent successfully to..."
   - ❌ Error: Check credentials and App Password

## Current Implementation

### Student/Alumni Login Flow
1. User enters email or student ID
2. System sends 6-digit verification code via email
3. User enters code to verify and login
4. JWT token generated for session

### Student/Alumni Registration Flow
1. User provides: email, name, student ID, role
2. System sends 6-digit verification code
3. User verifies code and sets password
4. Account created with email verified status

## Email Templates Used

- **Login Code** - 5-minute expiry
- **Registration Code** - 15-minute expiry
- **Welcome Email** - Sent after registration
- **Verification Approved** - Sent when admin approves account

## Troubleshooting

### "Email credentials not configured"
- Check Replit Secrets are set correctly
- Ensure no extra spaces in the values

### "SMTP Authentication Error"
- Verify you're using App Password, not regular password
- Ensure 2-Step Verification is enabled on Gmail
- Try regenerating the App Password

### "Failed to send email"
- Check Gmail account isn't blocked for suspicious activity
- Verify SMTP settings (smtp.gmail.com:587)
- Check Replit console logs for detailed error messages

## Files Using Email Service

- **Backend (Python):** `backend/utils/email_service.py`
- **Server (Node.js):** `server/services/email.ts`
- **Auth Routes:** `server/routes/auth.ts`, `backend/routes/auth.py`

## Security Notes

✅ Passwords are hashed with bcrypt
✅ Verification codes expire after 5-15 minutes
✅ JWT tokens for session management
✅ Email verification required for registration
✅ Admin approval workflow for new users
