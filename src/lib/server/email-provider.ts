import { Resend } from 'resend';
import type { Provider } from '@auth/core/providers';
import { env } from '$env/dynamic/private';

export default function ResendProvider(config: { from: string }): Provider {
	const resend = new Resend(env.RESEND_API_KEY);

	console.log('🔧 ResendProvider initialized with config:', config);
	console.log('🔧 RESEND_API_KEY exists:', !!env.RESEND_API_KEY);

	return {
		id: 'email',
		type: 'email',
		name: 'Email',
		server: {},
		from: config.from,
		maxAge: 10 * 60, // 10 minutes
		sendVerificationRequest: async ({ identifier, url, provider }) => {
			console.log('📧 sendVerificationRequest called with:', { identifier, url, provider });
			const { host } = new URL(url);

			try {
				console.log('📧 Attempting to send email via Resend...');
				const emailData = {
					from: provider.from || config.from,
					to: identifier,
					subject: `Sign in to ${host}`,
					html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Sign in to ${host}</h2>
              <p>Click the link below to sign in to your account:</p>
              <a href="${url}" style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                Sign in to ${host}
              </a>
              <p>If you didn't request this email, you can safely ignore it.</p>
              <p>This link will expire in 10 minutes.</p>
            </div>
          `,
					text: `Sign in to ${host}\n\nClick the link below to sign in to your account:\n\n${url}\n\nIf you didn't request this email, you can safely ignore it.\n\nThis link will expire in 10 minutes.`
				};

				console.log('📧 Email data:', emailData);
				const result = await resend.emails.send(emailData);
				console.log('✅ Email sent successfully via Resend:', result);
			} catch (error) {
				console.error('❌ Error sending email:', error);
				console.error('❌ Error details:', {
					message: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : 'No stack trace',
					code: (error as { code?: string })?.code || 'No error code'
				});
				throw new Error('Failed to send verification email');
			}
		}
	};
}
