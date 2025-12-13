/**
 * Vercel Serverless Function for Contact Form
 * Uses Resend to send emails
 * 
 * Environment variables needed in Vercel:
 * - RESEND_API_KEY: Your Resend API key
 * - CONTACT_EMAIL: Email to receive contact form submissions (defaults to 13daystories@gmail.com)
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Get environment variables
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL || '13daystories@gmail.com';

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      // Return a user-friendly error message
      return res.status(503).json({ 
        error: 'Contact form is temporarily unavailable. Please try again later or contact us directly.' 
      });
    }

    // Import Resend dynamically (only when needed)
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    // Send email
    const emailResult = await resend.emails.send({
      from: '13-Day Stories <contact@13daystories.com>', // You'll need to verify this domain in Resend
      to: contactEmail,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      text: `
New Contact Form Submission

From: ${name} (${email})
Subject: ${subject}

Message:
${message}
      `,
    });

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

