import nodemailer from 'nodemailer';

async function getGmailCredentials() {
  const email = process.env.MAIL_USERNAME || process.env.GMAIL_USER;
  const password = process.env.MAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  console.log('📧 Checking Gmail credentials...');
  console.log('📧 Email configured:', email ? 'Yes' : 'No');
  console.log('📧 Password configured:', password ? 'Yes' : 'No');

  if (!email || !password) {
    console.error('❌ Gmail credentials not found in environment variables');
    throw new Error('Gmail credentials not found. Please set MAIL_USERNAME and MAIL_PASSWORD in Secrets.');
  }

  return { email, password };
}

async function getMailTransporter() {
  const { email, password } = await getGmailCredentials();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password,
    },
  });

  return { transporter, fromEmail: email };
}

export async function sendVerificationEmail(email: string, code: string, type: 'registration' | 'password_reset' | 'login' = 'registration') {
  try {
    const { transporter, fromEmail } = await getMailTransporter();

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

    const info = await transporter.sendMail({
      from: `"Re-Connect Alumni" <${fromEmail}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log(`✅ Email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return { success: true, data: info };
  } catch (error: any) {
    console.error('❌ Error in sendVerificationEmail:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string, isVerified: boolean) {
  try {
    const { transporter, fromEmail } = await getMailTransporter();

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

    const info = await transporter.sendMail({
      from: `"Re-Connect Alumni" <${fromEmail}>`,
      to: email,
      subject: 'Welcome to the Alumni Platform',
      html: html,
    });

    console.log(`✅ Welcome email sent to ${email}. Message ID: ${info.messageId}`);
    return { success: true, data: info };
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    return { success: false, error };
  }
}

export async function sendVerificationApprovedEmail(email: string, name: string) {
  try {
    const { transporter, fromEmail } = await getMailTransporter();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Account Verified!</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 18px; color: #1f2937;">Great news, ${name}!</p>
          <p style="color: #4b5563; line-height: 1.6;">
            Your account has been <strong>successfully verified</strong> by our admin team. 
            You now have full access to all Re-Connect Alumni Platform features!
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0; color: #047857; font-size: 16px;">
              <strong>✓ Verification Complete</strong>
            </p>
            <p style="margin: 10px 0 0 0; color: #065f46;">
              Your profile now displays a verified badge 
            </p>
          </div>

          <h3 style="color: #1f2937; margin-top: 30px;">What's Next?</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>Connect with alumni and students across the network</li>
            <li>Access exclusive mentorship programs</li>
            <li>Participate in events and workshops</li>
            <li>Browse job opportunities and career resources</li>
            <li>Shop at the alumni gift store</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.VITE_APP_URL || 'http://localhost:5000'}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block; 
                      font-weight: bold;">
              Log In to Your Account
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Welcome to the Re-Connect Alumni community! If you have any questions, 
            feel free to reach out to our support team.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Re-Connect Alumni Platform" <${fromEmail}>`,
      to: email,
      subject: '🎉 Your Account Has Been Verified - Re-Connect Alumni',
      html: html,
    });

    console.log(`✅ Verification approved email sent to ${email}. Message ID: ${info.messageId}`);
    return { success: true, data: info };
  } catch (error) {
    console.error('❌ Error in sendVerificationApprovedEmail:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
    });
    throw error;
  }
}