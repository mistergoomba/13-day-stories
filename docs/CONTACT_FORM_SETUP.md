# Contact Form Setup

The contact form uses Resend to send emails without exposing your email address publicly.

## Setup Steps

1. **Create a Resend account** (if you don't have one)
   - Go to https://resend.com
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Add environment variables in Vercel**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add the following:
     - `RESEND_API_KEY`: Your Resend API key
     - `CONTACT_EMAIL`: (Optional) Email to receive contact form submissions (defaults to 13daystories@gmail.com)

3. **Verify your domain in Resend** (for production)
   - In Resend dashboard, go to "Domains"
   - Add and verify `13daystories.com`
   - This allows you to send from `contact@13daystories.com`
   - For testing, you can use Resend's test domain

4. **Install Resend package** (if not already installed)
   ```bash
   npm install resend
   ```

## How It Works

- Users fill out the contact form at `/contact`
- The form submits to `/api/contact` (Vercel serverless function)
- The serverless function uses Resend to send an email to your configured email address
- Your email address is never exposed in the HTML source code

## Benefits

- ✅ Email address protected from bots/scrapers
- ✅ Professional contact form experience
- ✅ Better user experience than mailto links
- ✅ Can add spam protection later if needed

## Testing

1. Fill out the contact form at https://13daystories.com/contact
2. Check your email inbox for the submission
3. The email will come from the configured "from" address with the user's email in the "reply-to" field

