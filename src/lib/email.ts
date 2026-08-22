import { BrevoClient } from '@getbrevo/brevo';
import {
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME
} from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import { db } from './db';
import { magicLinks } from './db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from './auth';
import { nowIST } from './utils/time';
import { randomUUID } from 'crypto';

// Initialize Brevo API client
const brevo = new BrevoClient({
  apiKey: BREVO_API_KEY,
});

export async function sendMagicLink(email: string, memberId: string) {
  // Invalidate all previous unused tokens for this member
  await db.update(magicLinks)
    .set({ used: 1 })
    .where(eq(magicLinks.memberId, memberId));

  // Generate new token
  const token = generateToken();
  const now = nowIST();

  // Expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    .toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' })
    .replace(' ', 'T');

  // Store token in database
  await db.insert(magicLinks).values({
    id: randomUUID(),
    memberId,
    token,
    expiresAt,
    used: 0,
    createdAt: now,
  });

  const link = `${PUBLIC_APP_URL}/auth/verify?token=${token}`;

  // Dev mode — print link to terminal instead of sending email
  if (process.env.NODE_ENV === 'development') {
    console.log('\n=============================');
    console.log('MAGIC LINK (dev mode)');
    console.log('To:', email);
    console.log('Link:', link);
    console.log('Expires in 15 minutes');
    console.log('=============================\n');
    return { success: true };
  }

  // Production — send via Brevo
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [{ email }],
      subject: 'Your login link — Household Ledger',
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Georgia, serif; background: #f0ebe0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #fff; border: 1px solid #c8b99a; padding: 36px;">
              <h2 style="font-size: 20px; color: #2c2518; margin: 0 0 16px;">
                Household Ledger
              </h2>
              <p style="color: #6b5f4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Click the link below to log in. This link expires in
                <strong>15 minutes</strong> and can only be used once.
              </p>
              <a
                href="${link}"
                style="display: inline-block; background: #2c2518; color: #f0ebe0;
                       padding: 12px 24px; text-decoration: none; font-size: 14px;
                       letter-spacing: 0.05em;"
              >
                Log in to Household Ledger
              </a>
              <p style="color: #9c8f78; font-size: 12px; margin: 24px 0 0; line-height: 1.5;">
                If you did not request this, ignore this email.<br>
                Do not share this link with anyone.
              </p>
            </div>
          </body>
        </html>
      `
    });

    return { success: true };

  } catch (err) {
    console.error('Brevo email error:', err);
    return { success: false, error: 'Could not send email. Try again in a moment.' };
  }
}
