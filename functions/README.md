# Firebase Functions - Email Service

This directory contains Firebase Functions for sending emails via Gmail.

## Setup Instructions

### 1. Enable Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already enabled)
3. Go to **App passwords**: https://myaccount.google.com/apppasswords
4. Create a new app password for "Mail" and "Other (Custom name)" - name it "Firebase Functions"
5. Copy the 16-character app password

### 2. Set Firebase Function Configuration

Run the following commands to set your Gmail credentials:

```bash
firebase functions:config:set gmail.user="your-email@gmail.com"
firebase functions:config:set gmail.password="your-16-char-app-password"
firebase functions:config:set contact.recipient="admin@medifocal.com"
```

Or set environment variables in Firebase Console:
- Go to Firebase Console → Functions → Configuration
- Add:
  - `GMAIL_USER`: your Gmail address
  - `GMAIL_APP_PASSWORD`: your 16-character app password
  - `CONTACT_RECIPIENT`: admin@medifocal.com (optional, defaults to admin@medifocal.com)

### 3. Deploy Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

## Function: sendContactEmail

This function sends emails from the contact form.

**Parameters:**
- `name` (string, required): Sender's name
- `email` (string, required): Sender's email
- `subject` (string, required): Email subject
- `message` (string, required): Email message

**Returns:**
- `{ success: true, message: 'Email sent successfully' }`

**Errors:**
- `invalid-argument`: Missing required fields or invalid email format
- `internal`: Failed to send email

## Testing

You can test the function using the Firebase Console or by calling it from your app's contact form.







