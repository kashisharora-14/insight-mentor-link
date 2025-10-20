import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'onboarding@resend.dev'
  };
}

export async function sendVerificationEmail(email: string, code: string, type: 'registration' | 'password_reset' | 'login' = 'registration') {
  try {
    const { client, fromEmail } = await getResendClient();
    
    let subject: string;
    let html: string;

    if (type === 'login') {
      subject = 'Your Login Code - Re-Connect Alumni Platform';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🔐 Your Login Code</h2>
          <p>Here's your one-time login code for Re-Connect:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #1f2937;">${code}</h1>
          </div>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this login code, please ignore this email and your account will remain secure.</p>
        </div>
      `;
    } else if (type === 'registration') {
      subject = 'Verify your email - Alumni Platform';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to the Alumni Platform!</h2>
          <p>Thank you for registering. Please use the verification code below to complete your registration:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #1f2937;">${code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this verification code, please ignore this email.</p>
        </div>
      `;
    } else {
      subject = 'Reset your password - Alumni Platform';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You requested to reset your password. Please use the code below:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #1f2937;">${code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
      `;
    }

    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [email],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string, isVerified: boolean) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const html = isVerified
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to the Alumni Platform, ${name}!</h2>
          <p>Your account has been verified and you now have full access to all platform features.</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #047857;"><strong>✓ Verified Account</strong></p>
            <p style="margin: 8px 0 0 0; color: #065f46;">You have a verified badge on your profile.</p>
          </div>
          <h3>What you can do:</h3>
          <ul>
            <li>Connect with alumni and students</li>
            <li>Access mentorship programs</li>
            <li>Participate in events</li>
            <li>Browse job opportunities</li>
            <li>Shop at the gift store</li>
          </ul>
          <p>Start exploring the platform now!</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to the Alumni Platform, ${name}!</h2>
          <p>Thank you for registering! Your account has been created successfully.</p>
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⏳ Verification Pending</strong></p>
            <p style="margin: 8px 0 0 0; color: #78350f;">Your account is awaiting verification by our admin team. You'll receive an email once approved.</p>
          </div>
          <p>While you wait, you can explore the platform with limited access.</p>
        </div>
      `;

    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Welcome to the Alumni Platform',
      html: html,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    return { success: false, error };
  }
}

export async function sendVerificationApprovedEmail(email: string, name: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Account Verified! 🎉</h2>
        <p>Great news, ${name}!</p>
        <p>Your account has been verified by our admin team. You now have full access to all platform features with a verified badge on your profile.</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #047857;"><strong>✓ Your account is now verified</strong></p>
        </div>
        <p>Log in now to start connecting with the community!</p>
      </div>
    `;

    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Your Account Has Been Verified!',
      html: html,
    });

    if (error) {
      console.error('Error sending verification approved email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendVerificationApprovedEmail:', error);
    return { success: false, error };
  }
}
