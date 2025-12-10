"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserLoginType = exports.getBacklinkJobStatus = exports.buildBacklinksManual = exports.buildBacklinksScheduled = exports.handleCustomerPortalWebhook = exports.syncAllCustomersToStripe = exports.setDefaultStripePaymentMethod = exports.deleteStripePaymentMethod = exports.getStripePaymentMethods = exports.reactivateStripeSubscription = exports.cancelStripeSubscription = exports.updateStripeCustomerBilling = exports.createCheckoutSession = exports.getStripeCustomerBilling = exports.getStripeInvoices = exports.searchStripeCustomer = exports.getStripeSubscriptions = exports.createStripePortalSession = exports.getStripeCustomerId = exports.onCreateCustomer = exports.sendContactEmail = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const stripe_1 = require("stripe");
const backlinkBuilder_1 = require("./backlinkBuilder");
admin.initializeApp();
// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key);
if (!stripeSecretKey) {
    console.warn('Stripe secret key not configured. Payment methods features will not work.');
}
const stripe = stripeSecretKey ? new stripe_1.default(stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
}) : null;
// Configure Gmail SMTP transporter
// You'll need to set these environment variables in Firebase:
// GMAIL_USER: your Gmail address
// GMAIL_APP_PASSWORD: Gmail App Password (not your regular password)
const createTransporter = () => {
    var _a, _b;
    const gmailUser = ((_a = functions.config().gmail) === null || _a === void 0 ? void 0 : _a.user) || process.env.GMAIL_USER;
    const gmailPassword = ((_b = functions.config().gmail) === null || _b === void 0 ? void 0 : _b.password) || process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailPassword) {
        throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD.');
    }
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailPassword,
        },
    });
};
// Contact form email function
exports.sendContactEmail = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e;
    console.log('sendContactEmail called with data:', JSON.stringify(data));
    // Verify the request - check for empty strings too
    if (!data || typeof data !== 'object') {
        console.error('Invalid data format:', data);
        throw new functions.https.HttpsError('invalid-argument', 'Invalid request data format');
    }
    // Extract and trim fields - handle both direct access and optional chaining, ensure strings
    const name = (data.name || '').toString().trim();
    const email = (data.email || '').toString().trim();
    const subject = (data.subject || '').toString().trim();
    const message = (data.message || '').toString().trim();
    // Input length validation to prevent DoS attacks
    const MAX_NAME_LENGTH = 100;
    const MAX_EMAIL_LENGTH = 254; // RFC 5321 standard
    const MAX_SUBJECT_LENGTH = 200;
    const MAX_MESSAGE_LENGTH = 5000;
    if (name.length > MAX_NAME_LENGTH) {
        throw new functions.https.HttpsError('invalid-argument', `Name must be less than ${MAX_NAME_LENGTH} characters`);
    }
    if (email.length > MAX_EMAIL_LENGTH) {
        throw new functions.https.HttpsError('invalid-argument', `Email must be less than ${MAX_EMAIL_LENGTH} characters`);
    }
    if (subject.length > MAX_SUBJECT_LENGTH) {
        throw new functions.https.HttpsError('invalid-argument', `Subject must be less than ${MAX_SUBJECT_LENGTH} characters`);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
        throw new functions.https.HttpsError('invalid-argument', `Message must be less than ${MAX_MESSAGE_LENGTH} characters`);
    }
    console.log('Extracted fields:', {
        name: name.substring(0, 20),
        email: email.substring(0, 30),
        subject: subject.substring(0, 30),
        message: message.substring(0, 50),
        nameLen: name.length,
        emailLen: email.length,
        subjectLen: subject.length,
        messageLen: message.length
    });
    if (!name || !email || !subject || !message) {
        console.error('Missing required fields:', { name: !!name, email: !!email, subject: !!subject, message: !!message });
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: name, email, subject, message');
    }
    // Validate email format with stricter regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
        console.error('Invalid email format:', email);
        throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
    }
    try {
        const transporter = createTransporter();
        const recipientEmail = ((_a = functions.config().contact) === null || _a === void 0 ? void 0 : _a.recipient) || 'admin@medifocal.com';
        console.log('Sending email to:', recipientEmail);
        // Escape HTML to prevent XSS
        const escapeHtml = (text) => {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };
        // Email to admin - Professional HTML template
        const mailOptions = {
            from: `"Medifocal Contact Form" <${((_b = functions.config().gmail) === null || _b === void 0 ? void 0 : _b.user) || process.env.GMAIL_USER}>`,
            replyTo: email,
            to: recipientEmail,
            subject: `Contact Form: ${subject}`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #017bbf 0%, #005a8f 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">New Contact Form Submission</h1>
              <p style="margin: 10px 0 0; color: #e0f2ff; font-size: 14px; font-weight: 400;">You have received a new message from your website</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Name -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border-left: 4px solid #017bbf; border-radius: 4px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Name</div>
                    <div style="color: #212529; font-size: 16px; font-weight: 500;">${escapeHtml(name)}</div>
                  </td>
                </tr>
              </table>
              
              <!-- Email -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border-left: 4px solid #017bbf; border-radius: 4px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Email Address</div>
                    <div style="color: #212529; font-size: 16px; font-weight: 500;">
                      <a href="mailto:${escapeHtml(email)}" style="color: #017bbf; text-decoration: none;">${escapeHtml(email)}</a>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Subject -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border-left: 4px solid #017bbf; border-radius: 4px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Subject</div>
                    <div style="color: #212529; font-size: 16px; font-weight: 500;">${escapeHtml(subject)}</div>
                  </td>
                </tr>
              </table>
              
              <!-- Message -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td>
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Message</div>
                    <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0; color: #212529; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="mailto:${escapeHtml(email)}?subject=Re: ${escapeHtml(subject)}" style="display: inline-block; padding: 14px 32px; background-color: #017bbf; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; text-align: center;">Reply to ${escapeHtml(name)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; text-align: center;">
              <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.5;">
                This email was automatically sent from the <strong style="color: #017bbf;">Medifocal</strong> contact form.<br>
                <span style="color: #adb5bd;">${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'long', timeStyle: 'short' })}</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
            text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from the Medifocal contact form.
      `,
        };
        console.log('Sending admin email...');
        await transporter.sendMail(mailOptions);
        console.log('Admin email sent successfully');
        // Optional: Send confirmation email to user
        try {
            const confirmationMailOptions = {
                from: `"Medifocal" <${((_c = functions.config().gmail) === null || _c === void 0 ? void 0 : _c.user) || process.env.GMAIL_USER}>`,
                to: email,
                subject: 'Thank you for contacting Medifocal',
                html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting Medifocal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #017bbf 0%, #005a8f 100%); padding: 50px 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="white"/>
                </svg>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Thank You!</h1>
              <p style="margin: 12px 0 0; color: #e0f2ff; font-size: 16px; font-weight: 400;">We've received your message</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #212529; font-size: 16px; line-height: 1.6;">
                Dear <strong style="color: #017bbf;">${escapeHtml(name)}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #495057; font-size: 15px; line-height: 1.6;">
                Thank you for reaching out to Medifocal. We have successfully received your message and our team will review it shortly.
              </p>
              
              <p style="margin: 0 0 30px; color: #495057; font-size: 15px; line-height: 1.6;">
                We typically respond within 24-48 hours during business days. If your inquiry is urgent, please feel free to call us at <a href="tel:0240561419" style="color: #017bbf; text-decoration: none; font-weight: 600;">(02) 4056 1419</a>.
              </p>
              
              <!-- Message Summary -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px; background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Your Message Summary</div>
                    <div style="color: #212529; font-size: 14px; line-height: 1.5; margin-bottom: 8px;">
                      <strong>Subject:</strong> ${escapeHtml(subject)}
                    </div>
                    <div style="color: #495057; font-size: 14px; line-height: 1.6; padding: 12px; background-color: #ffffff; border-radius: 4px; border-left: 3px solid #017bbf;">
                      ${escapeHtml(message.substring(0, 200))}${message.length > 200 ? '...' : ''}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Contact Info -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px;">
                    <div style="color: #212529; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Need immediate assistance?</div>
                    <div style="color: #495057; font-size: 13px; line-height: 1.8;">
                      📞 <a href="tel:0240561419" style="color: #017bbf; text-decoration: none;">(02) 4056 1419</a><br>
                      ✉️ <a href="mailto:admin@medifocal.com" style="color: #017bbf; text-decoration: none;">admin@medifocal.com</a><br>
                      📍 Site 2, 7 Friesian Close, Sandgate NSW 2304
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 12px; color: #212529; font-size: 15px; font-weight: 600;">Best regards,</p>
              <p style="margin: 0 0 20px; color: #495057; font-size: 14px;">The Medifocal Team</p>
              
              <div style="border-top: 1px solid #e9ecef; padding-top: 20px; text-align: center;">
                <p style="margin: 0 0 8px; color: #6c757d; font-size: 12px;">
                  <strong style="color: #017bbf;">Medifocal</strong> | Australia's Leading Dental Equipment Supplier
                </p>
                <p style="margin: 0; color: #adb5bd; font-size: 11px;">
                  Trade Name: Medifocal Pty Ltd | ABN: 13 674 191 649
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
                text: `
Thank you for contacting Medifocal

Dear ${name},

We have received your message and will get back to you as soon as possible.

Your message:
${message}

Best regards,
The Medifocal Team
        `,
            };
            console.log('Sending confirmation email to user...');
            await transporter.sendMail(confirmationMailOptions);
            console.log('Confirmation email sent successfully');
        }
        catch (confirmationError) {
            // Don't fail the whole request if confirmation email fails
            console.error('Error sending confirmation email:', confirmationError);
        }
        return { success: true, message: 'Email sent successfully' };
    }
    catch (error) {
        console.error('Error sending email:', error);
        console.error('Error stack:', error.stack);
        // Provide more specific error messages
        let errorMessage = 'Failed to send email. Please try again later.';
        if (error.message) {
            errorMessage = error.message;
        }
        // Check if it's a Gmail authentication error
        if (error.code === 'EAUTH' || ((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes('Invalid login'))) {
            errorMessage = 'Email service configuration error. Please contact support.';
            console.error('Gmail authentication failed. Check credentials.');
        }
        else if (error.code === 'ECONNECTION' || ((_e = error.message) === null || _e === void 0 ? void 0 : _e.includes('connection'))) {
            errorMessage = 'Unable to connect to email service. Please try again later.';
        }
        throw new functions.https.HttpsError('internal', errorMessage, error.message);
    }
});
/**
 * Create Stripe customer when user signs up (triggered by Firestore onCreate)
 */
exports.onCreateCustomer = functions.region('australia-southeast1').firestore
    .document('customers/{userId}')
    .onCreate(async (snap, context) => {
    if (!stripe) {
        console.warn('Stripe not configured, skipping customer creation');
        return;
    }
    try {
        const userId = context.params.userId;
        const userData = snap.data();
        // Check if Stripe customer already exists
        if ((userData === null || userData === void 0 ? void 0 : userData.stripeId) || (userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId)) {
            console.log('Stripe customer already exists for user:', userId);
            return;
        }
        // Create Stripe customer
        const customer = await stripe.customers.create({
            email: userData === null || userData === void 0 ? void 0 : userData.email,
            name: (userData === null || userData === void 0 ? void 0 : userData.displayName) || (userData === null || userData === void 0 ? void 0 : userData.name) || `${(userData === null || userData === void 0 ? void 0 : userData.firstName) || ''} ${(userData === null || userData === void 0 ? void 0 : userData.lastName) || ''}`.trim(),
            phone: (userData === null || userData === void 0 ? void 0 : userData.phoneNumber) || (userData === null || userData === void 0 ? void 0 : userData.phone),
            metadata: {
                firebaseUID: userId,
                practiceName: (userData === null || userData === void 0 ? void 0 : userData.practiceName) || '',
            },
        });
        // Update Firestore with Stripe customer ID
        // Firebase Extension uses 'stripeId', but we'll also store 'stripeCustomerId' for compatibility
        await snap.ref.update({
            stripeId: customer.id,
            stripeCustomerId: customer.id,
        });
        console.log('Created Stripe customer:', customer.id, 'for Firebase user:', userId);
    }
    catch (error) {
        console.error('Error creating Stripe customer on user creation:', error);
        // Don't throw - allow user creation to succeed even if Stripe fails
    }
});
/**
 * Get or create Stripe customer ID for a user
 */
exports.getStripeCustomerId = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const userId = context.auth.uid;
        const userDoc = await admin.firestore().collection('customers').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        // Check if Stripe customer ID exists (from Firebase Extension)
        // The extension stores it as 'stripeId' in customers/{uid} document
        let stripeCustomerId = (userData === null || userData === void 0 ? void 0 : userData.stripeId) || (userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId);
        // If not found, check the payments subcollection (Firebase Extension pattern)
        if (!stripeCustomerId) {
            const paymentsRef = admin.firestore().collection('customers').doc(userId).collection('payments');
            const paymentsSnapshot = await paymentsRef.limit(1).get();
            if (!paymentsSnapshot.empty) {
                const paymentDoc = paymentsSnapshot.docs[0];
                stripeCustomerId = ((_a = paymentDoc.data()) === null || _a === void 0 ? void 0 : _a.stripeId) || ((_b = paymentDoc.data()) === null || _b === void 0 ? void 0 : _b.stripeCustomerId);
            }
        }
        // If still not found, create a new Stripe customer
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: (userData === null || userData === void 0 ? void 0 : userData.email) || context.auth.token.email,
                name: (userData === null || userData === void 0 ? void 0 : userData.displayName) || (userData === null || userData === void 0 ? void 0 : userData.name),
                phone: (userData === null || userData === void 0 ? void 0 : userData.phoneNumber) || (userData === null || userData === void 0 ? void 0 : userData.phone),
                metadata: {
                    firebaseUID: userId,
                    practiceName: (userData === null || userData === void 0 ? void 0 : userData.practiceName) || '',
                },
            });
            stripeCustomerId = customer.id;
            // Store in user document
            await admin.firestore().collection('customers').doc(userId).update({
                stripeCustomerId: customer.id,
            });
        }
        return { customerId: stripeCustomerId };
    }
    catch (error) {
        console.error('Error getting Stripe customer ID:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to get Stripe customer ID');
    }
});
/**
 * Create Stripe Customer Portal session for managing payment methods
 */
exports.createStripePortalSession = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const userId = context.auth.uid;
        const returnUrl = data.returnUrl || `${data.baseUrl || 'https://medifocal.com'}/account?tab=payment`;
        const portalConfigurationId = data.portalConfigurationId || 'bpc_1SXCLYS5loAzWKwGVmVVTjU9';
        let userData = null;
        let stripeCustomerId = null;
        // Get Stripe customer ID from user document
        try {
            const userDoc = await admin.firestore().collection('customers').doc(userId).get();
            if (userDoc.exists) {
                userData = userDoc.data();
                // Firebase Extension stores it as 'stripeId', we also use 'stripeCustomerId'
                stripeCustomerId = (userData === null || userData === void 0 ? void 0 : userData.stripeId) || (userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId) || null;
            }
        }
        catch (firestoreError) {
            console.error('Error reading user document:', firestoreError);
            // Continue - we'll create customer if needed
        }
        // If not found, check payments subcollection (Firebase Extension pattern)
        if (!stripeCustomerId) {
            try {
                const paymentsRef = admin.firestore().collection('customers').doc(userId).collection('payments');
                const paymentsSnapshot = await paymentsRef.limit(1).get();
                if (!paymentsSnapshot.empty) {
                    stripeCustomerId = ((_a = paymentsSnapshot.docs[0].data()) === null || _a === void 0 ? void 0 : _a.stripeId) || ((_b = paymentsSnapshot.docs[0].data()) === null || _b === void 0 ? void 0 : _b.stripeCustomerId) || null;
                }
            }
            catch (paymentsError) {
                console.error('Error reading payments subcollection:', paymentsError);
                // Continue - we'll create customer if needed
            }
        }
        // If still not found, create a new Stripe customer
        if (!stripeCustomerId) {
            console.log('Creating Stripe customer for user:', userId);
            const customerEmail = (userData === null || userData === void 0 ? void 0 : userData.email) || context.auth.token.email || undefined;
            if (!customerEmail) {
                throw new functions.https.HttpsError('invalid-argument', 'User email is required to create Stripe customer');
            }
            const customer = await stripe.customers.create({
                email: customerEmail,
                name: (userData === null || userData === void 0 ? void 0 : userData.displayName) || (userData === null || userData === void 0 ? void 0 : userData.name) || `${(userData === null || userData === void 0 ? void 0 : userData.firstName) || ''} ${(userData === null || userData === void 0 ? void 0 : userData.lastName) || ''}`.trim() || undefined,
                phone: (userData === null || userData === void 0 ? void 0 : userData.phoneNumber) || (userData === null || userData === void 0 ? void 0 : userData.phone) || undefined,
                metadata: {
                    firebaseUID: userId,
                    practiceName: (userData === null || userData === void 0 ? void 0 : userData.practiceName) || '',
                },
            });
            stripeCustomerId = customer.id;
            // Try to update Firestore, but don't fail if it doesn't work
            try {
                const customerRef = admin.firestore().collection('customers').doc(userId);
                if (userData) {
                    // Document exists, update it
                    await customerRef.update({
                        stripeId: customer.id,
                        stripeCustomerId: customer.id,
                    });
                }
                else {
                    // Document doesn't exist, create it
                    await customerRef.set({
                        stripeId: customer.id,
                        stripeCustomerId: customer.id,
                        email: customerEmail,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
                console.log('Created/updated Stripe customer in Firestore:', customer.id);
            }
            catch (updateError) {
                console.error('Error updating Firestore with Stripe customer ID:', updateError);
                // Don't fail - we have the Stripe customer ID, that's what matters
            }
            console.log('Created Stripe customer:', customer.id);
        }
        // Create billing portal session using best practices:
        // 1. Use the configured portal configuration ID
        // 2. Set proper return URL
        // 3. The session URL will allow customer to manage their billing
        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: returnUrl,
            configuration: portalConfigurationId, // Use the pre-configured portal: bpc_1SXCLYS5loAzWKwGVmVVTjU9
        });
        // Return the session URL - this is a secure, one-time use URL
        // The URL format will be: https://billing.stripe.com/p/session/{sessionId}
        return { url: session.url };
    }
    catch (error) {
        console.error('Error creating portal session:', error);
        console.error('Error stack:', error.stack);
        // Provide more specific error messages
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', error.message || 'Failed to create portal session');
    }
});
/**
 * Get customer's subscriptions from Stripe
 */
exports.getStripeSubscriptions = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        return { subscriptions: [] };
    }
    try {
        const userId = context.auth.uid;
        const userDoc = await admin.firestore().collection('customers').doc(userId).get();
        if (!userDoc.exists) {
            return { subscriptions: [] };
        }
        const userData = userDoc.data();
        let customerId = (userData === null || userData === void 0 ? void 0 : userData.stripeId) || (userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId);
        if (!customerId) {
            return { subscriptions: [] };
        }
        // Get all subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            limit: 100,
        });
        const formattedSubscriptions = subscriptions.data.map((sub) => ({
            id: sub.id,
            status: sub.status,
            currentPeriodStart: sub.current_period_start,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            canceledAt: sub.canceled_at,
            items: sub.items.data.map((item) => {
                var _a, _b, _c;
                return ({
                    id: item.id,
                    priceId: item.price.id,
                    productId: typeof item.price.product === 'string' ? item.price.product : (_a = item.price.product) === null || _a === void 0 ? void 0 : _a.id,
                    quantity: item.quantity,
                    price: {
                        amount: item.price.unit_amount,
                        currency: item.price.currency,
                        interval: (_b = item.price.recurring) === null || _b === void 0 ? void 0 : _b.interval,
                        intervalCount: (_c = item.price.recurring) === null || _c === void 0 ? void 0 : _c.interval_count,
                    },
                });
            }),
        }));
        return { subscriptions: formattedSubscriptions };
    }
    catch (error) {
        console.error('Error fetching subscriptions:', error);
        return { subscriptions: [] };
    }
});
/**
 * Search for Stripe customer by email or phone
 * Note: Stripe API only supports searching by email directly, so for phone we need to search all and filter
 */
exports.searchStripeCustomer = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const { email, phone } = data;
        if (!email && !phone) {
            throw new functions.https.HttpsError('invalid-argument', 'Email or phone is required');
        }
        let customers = [];
        // Search by email (Stripe supports this directly)
        if (email) {
            const emailResults = await stripe.customers.list({
                email: email,
                limit: 10,
            });
            customers = emailResults.data;
        }
        // For phone search, we need to use Stripe's search API or list and filter
        // Since phone search isn't directly supported, we'll search by email first
        // and if phone is provided, filter the results
        if (phone && !email) {
            // If only phone is provided, we need to search all customers (limited)
            // This is less efficient but necessary since Stripe doesn't support phone search directly
            // We'll limit to recent customers to avoid performance issues
            const allCustomers = await stripe.customers.list({
                limit: 100, // Limit to prevent performance issues
            });
            // Filter by phone number (normalize both for comparison)
            const normalizedPhone = phone.replace(/\D/g, '');
            customers = allCustomers.data.filter(customer => {
                if (!customer.phone)
                    return false;
                const customerPhone = customer.phone.replace(/\D/g, '');
                return customerPhone.includes(normalizedPhone) || normalizedPhone.includes(customerPhone);
            });
        }
        else if (phone && email && customers.length > 0) {
            // If both email and phone provided, filter email results by phone
            const normalizedPhone = phone.replace(/\D/g, '');
            customers = customers.filter(customer => {
                if (!customer.phone)
                    return false;
                const customerPhone = customer.phone.replace(/\D/g, '');
                return customerPhone.includes(normalizedPhone) || normalizedPhone.includes(customerPhone);
            });
        }
        if (customers.length === 0) {
            return { found: false, customers: [] };
        }
        // Return the first match with relevant data
        const customer = customers[0];
        return {
            found: true,
            customer: {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
                address: customer.address ? {
                    line1: customer.address.line1,
                    city: customer.address.city,
                    state: customer.address.state,
                    postal_code: customer.address.postal_code,
                    country: customer.address.country,
                } : null,
                metadata: customer.metadata,
            },
            allMatches: customers.length
        };
    }
    catch (error) {
        console.error('Error searching Stripe customer:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to search Stripe customer');
    }
});
/**
 * Get customer's invoices from Stripe
 */
exports.getStripeInvoices = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        return { invoices: [] };
    }
    try {
        const userId = context.auth.uid;
        const limit = (data === null || data === void 0 ? void 0 : data.limit) || 50;
        const userDoc = await admin.firestore().collection('customers').doc(userId).get();
        if (!userDoc.exists) {
            return { invoices: [] };
        }
        const userData = userDoc.data();
        let customerId = (userData === null || userData === void 0 ? void 0 : userData.stripeId) || (userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId);
        if (!customerId) {
            return { invoices: [] };
        }
        // Get invoices for the customer
        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit: limit,
        });
        const formattedInvoices = invoices.data.map((inv) => {
            var _a, _b, _c;
            return ({
                id: inv.id,
                number: inv.number,
                status: inv.status,
                amountDue: inv.amount_due,
                amountPaid: inv.amount_paid,
                total: inv.total,
                currency: inv.currency,
                created: inv.created,
                dueDate: inv.due_date,
                paidAt: (_a = inv.status_transitions) === null || _a === void 0 ? void 0 : _a.paid_at,
                hostedInvoiceUrl: inv.hosted_invoice_url,
                invoicePdf: inv.invoice_pdf,
                lineItems: ((_c = (_b = inv.lines) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.map((line) => ({
                    description: line.description,
                    amount: line.amount,
                    quantity: line.quantity,
                }))) || [],
            });
        });
        return { invoices: formattedInvoices };
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        return { invoices: [] };
    }
});
/**
 * Get customer's billing information from Stripe
 */
exports.getStripeCustomerBilling = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        return null;
    }
    try {
        const userId = context.auth.uid;
        const userDoc = await admin.firestore().collection('customers').doc(userId).get();
        if (!userDoc.exists) {
            return null;
        }
        const userData = userDoc.data();
        let customerId = (userData === null || userData === void 0 ? void 0 : userData.stripeId) || (userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId);
        if (!customerId) {
            return null;
        }
        // Get customer from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        return {
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            address: customer.address ? {
                line1: customer.address.line1,
                line2: customer.address.line2,
                city: customer.address.city,
                state: customer.address.state,
                postal_code: customer.address.postal_code,
                country: customer.address.country,
            } : null,
            defaultPaymentMethod: (_a = customer.invoice_settings) === null || _a === void 0 ? void 0 : _a.default_payment_method,
            taxIds: ((_b = customer.tax_ids) === null || _b === void 0 ? void 0 : _b.data) || [],
            balance: customer.balance,
            currency: customer.currency,
        };
    }
    catch (error) {
        console.error('Error fetching customer billing:', error);
        return null;
    }
});
/**
 * Create Stripe Checkout Session for cart checkout
 * This directly creates a checkout session and returns the URL (matching Stripe example pattern)
 */
exports.createCheckoutSession = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const { cartItems, successUrl, cancelUrl, customerEmail, stripeCustomerId, paymentMethod, customerDetails, shippingAddress } = data;
        // Input validation
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Cart items are required');
        }
        // Validate cart items array size to prevent DoS
        if (cartItems.length > 100) {
            throw new functions.https.HttpsError('invalid-argument', 'Cart cannot contain more than 100 items');
        }
        // Validate URLs to prevent open redirect attacks
        const isValidUrl = (url) => {
            try {
                const parsed = new URL(url);
                // Only allow same origin or trusted domains
                return parsed.origin === 'https://medifocal.com' ||
                    parsed.origin === 'https://www.medifocal.com' ||
                    parsed.origin === 'https://medifocal.firebaseapp.com';
            }
            catch (_a) {
                return false;
            }
        };
        if (successUrl && !isValidUrl(successUrl)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid success URL');
        }
        if (cancelUrl && !isValidUrl(cancelUrl)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid cancel URL');
        }
        // Validate email format if provided
        if (customerEmail) {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!emailRegex.test(customerEmail) || customerEmail.length > 254) {
                throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
            }
        }
        // Validate cart items structure
        for (const item of cartItems) {
            if (!item.name || typeof item.name !== 'string' || item.name.length > 500) {
                throw new functions.https.HttpsError('invalid-argument', 'Invalid item name');
            }
            if (typeof item.price !== 'number' || item.price < 0 || item.price > 1000000) {
                throw new functions.https.HttpsError('invalid-argument', 'Invalid item price');
            }
            if (item.quantity && (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 1000)) {
                throw new functions.https.HttpsError('invalid-argument', 'Invalid item quantity');
            }
        }
        // Handle invoice payment - create invoice directly
        if (paymentMethod === 'invoice') {
            if (!customerEmail) {
                throw new functions.https.HttpsError('invalid-argument', 'Email is required for invoice payment');
            }
            // Get or create customer
            let customer;
            if (stripeCustomerId) {
                customer = await stripe.customers.retrieve(stripeCustomerId);
            }
            else {
                // Search for existing customer by email
                const existingCustomers = await stripe.customers.list({
                    email: customerEmail,
                    limit: 1,
                });
                if (existingCustomers.data.length > 0) {
                    customer = existingCustomers.data[0];
                    // Update customer with provided details
                    if (customerDetails || shippingAddress) {
                        const updateData = {};
                        if (customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.name)
                            updateData.name = customerDetails.name;
                        if (customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.phone)
                            updateData.phone = customerDetails.phone;
                        if (shippingAddress) {
                            updateData.shipping = {
                                name: (customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.name) || customer.name || '',
                                phone: (customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.phone) || customer.phone || '',
                                address: {
                                    line1: shippingAddress.line1 || '',
                                    line2: shippingAddress.line2 || '',
                                    city: shippingAddress.city || '',
                                    state: shippingAddress.state || '',
                                    postal_code: shippingAddress.postal_code || '',
                                    country: shippingAddress.country || 'AU',
                                },
                            };
                        }
                        if (Object.keys(updateData).length > 0) {
                            customer = await stripe.customers.update(customer.id, updateData);
                        }
                    }
                }
                else {
                    // Create new customer with provided details
                    const customerData = {
                        email: customerEmail,
                        metadata: {
                            created_via: 'checkout_invoice',
                        },
                    };
                    if (customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.name)
                        customerData.name = customerDetails.name;
                    if (customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.phone)
                        customerData.phone = customerDetails.phone;
                    if (shippingAddress) {
                        customerData.shipping = {
                            name: (customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.name) || '',
                            phone: (customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.phone) || '',
                            address: {
                                line1: shippingAddress.line1 || '',
                                line2: shippingAddress.line2 || '',
                                city: shippingAddress.city || '',
                                state: shippingAddress.state || '',
                                postal_code: shippingAddress.postal_code || '',
                                country: shippingAddress.country || 'AU',
                            },
                        };
                    }
                    customer = await stripe.customers.create(customerData);
                }
            }
            // Set invoice template on customer before creating invoice
            await stripe.customers.update(customer.id, {
                invoice_settings: {
                    default_invoice_template: 'inrtem_1SVQ1DS5loAzWKwGn7H2gKDu', // Invoice template ID
                }, // TypeScript types may not include this field yet
            });
            // Create invoice with line items
            const invoice = await stripe.invoices.create({
                customer: customer.id,
                collection_method: 'send_invoice',
                days_until_due: 30, // Payment due in 30 days
                auto_advance: true, // Automatically finalize the invoice
                metadata: {
                    cartItemCount: cartItems.length.toString(),
                    paymentMethod: 'invoice',
                    customPaymentMethodType: 'cpmt_1SZ18hS5loAzWKwGTwxBPnLl', // Store custom payment method type ID
                },
            });
            // Add line items to invoice using invoice items
            // Note: Stripe invoice items require either 'amount' (total) OR 'quantity' + 'unit_amount'
            // We'll use 'amount' (total) for simplicity
            for (const item of cartItems) {
                const description = `${item.name}${item.manufacturer ? ` - ${item.manufacturer}` : ''}`;
                const unitAmount = Math.round((item.price || 0) * 100); // Convert to cents
                const quantity = item.quantity || 1;
                const totalAmount = unitAmount * quantity; // Total amount for this line item
                await stripe.invoiceItems.create({
                    customer: customer.id,
                    invoice: invoice.id,
                    description: description,
                    amount: totalAmount, // Total amount (don't use quantity when using amount)
                    currency: 'aud',
                });
            }
            // Create a custom payment method for invoice payment
            // This allows the invoice to be paid using the custom payment method type
            const customPaymentMethod = await stripe.paymentMethods.create({
                type: 'custom',
                custom: {
                    type: 'cpmt_1SZ18hS5loAzWKwGTwxBPnLl', // Custom payment method type for invoice
                },
                billing_details: {
                    email: customerEmail,
                    name: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.name,
                    phone: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.phone,
                    address: shippingAddress ? {
                        line1: shippingAddress.line1,
                        line2: shippingAddress.line2,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        postal_code: shippingAddress.postal_code,
                        country: shippingAddress.country || 'AU',
                    } : undefined,
                },
            });
            // Attach the custom payment method to the customer
            await stripe.paymentMethods.attach(customPaymentMethod.id, {
                customer: customer.id,
            });
            // Set as default payment method for invoices
            await stripe.customers.update(customer.id, {
                invoice_settings: {
                    default_payment_method: customPaymentMethod.id,
                },
            });
            // Finalize and send the invoice
            const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
            await stripe.invoices.sendInvoice(finalizedInvoice.id);
            // Return success with invoice details
            return {
                success: true,
                invoiceId: finalizedInvoice.id,
                invoiceUrl: finalizedInvoice.hosted_invoice_url,
                message: 'Invoice has been sent to your email. Please pay within 30 days.',
            };
        }
        // Regular checkout session for card payment or bank transfer
        if (!successUrl || !cancelUrl) {
            throw new functions.https.HttpsError('invalid-argument', 'Success and cancel URLs are required');
        }
        // Build line items (matching Stripe example pattern)
        // Set tax_behavior to 'exclusive' so tax is added on top of prices, not included
        const lineItems = cartItems.map((item) => ({
            price_data: {
                currency: 'aud',
                product_data: {
                    name: item.name || 'Product',
                    description: item.manufacturer || item.description || '',
                    images: item.imageUrl ? [item.imageUrl] : [],
                },
                unit_amount: Math.round((item.price || 0) * 100), // Convert to cents - price is exclusive of tax
                tax_behavior: 'exclusive', // Tax will be added on top of this price
            },
            quantity: item.quantity || 1,
        }));
        // Create checkout session (matching Stripe example pattern)
        // For bank transfer, use payment mode to collect all details (phone, address, etc.)
        // We'll cancel/refund the payment in the webhook and create an invoice instead
        const sessionParams = {
            mode: 'payment',
            line_items: lineItems,
            success_url: successUrl,
            cancel_url: cancelUrl,
            // Include PayTo for Australian customers (real-time bank payments)
            // Note: PayTo must be enabled in Stripe Dashboard first
            payment_method_types: ['card', 'payto', 'afterpay_clearpay', 'klarna'],
            shipping_address_collection: {
                allowed_countries: ['AU', 'NZ', 'CA', 'GB', 'US', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'EE', 'LV', 'LT', 'MT', 'LU', 'CY'], // International support
            },
            phone_number_collection: {
                enabled: true,
            },
            customer_creation: 'always', // Always create customer if they don't exist
            automatic_tax: {
                enabled: true, // Enable automatic tax calculation
            },
            invoice_creation: {
                enabled: true, // Enable invoice creation - creates invoice PDF after payment
            },
            metadata: {
                cartItemCount: cartItems.length.toString(),
                paymentMethod: paymentMethod || 'card', // Store payment method for webhook handling
            },
        };
        // Add customer if provided (matching Stripe example pattern)
        if (stripeCustomerId) {
            sessionParams.customer = stripeCustomerId;
        }
        else if (customerEmail) {
            sessionParams.customer_email = customerEmail;
        }
        // Create the session (matching Stripe example: stripe.checkout.sessions.create)
        const session = await stripe.checkout.sessions.create(sessionParams);
        // Return URL (matching Stripe example: res.redirect(303, session.url))
        return {
            url: session.url,
            sessionId: session.id
        };
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to create checkout session');
    }
});
/**
 * Update customer billing information in Stripe
 */
exports.updateStripeCustomerBilling = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const userId = context.auth.uid;
        const { email, name, phone, address } = data;
        const userDoc = await admin.firestore().collection('customers').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        let customerId = (userData === null || userData === void 0 ? void 0 : userData.stripeId) || (userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId);
        if (!customerId) {
            throw new functions.https.HttpsError('not-found', 'Stripe customer not found');
        }
        const updateData = {};
        if (email)
            updateData.email = email;
        if (name)
            updateData.name = name;
        if (phone !== undefined)
            updateData.phone = phone || null;
        if (address)
            updateData.address = address;
        const customer = await stripe.customers.update(customerId, updateData);
        // Update Firestore
        await userDoc.ref.update({
            billingEmail: customer.email,
            billingName: customer.name,
            billingPhone: customer.phone,
            billingAddress: customer.address,
            lastBillingUpdate: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, customer: {
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
            } };
    }
    catch (error) {
        console.error('Error updating customer billing:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to update customer billing');
    }
});
/**
 * Cancel a subscription
 */
exports.cancelStripeSubscription = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const { subscriptionId, cancelAtPeriodEnd } = data;
        if (!subscriptionId) {
            throw new functions.https.HttpsError('invalid-argument', 'Subscription ID is required');
        }
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: cancelAtPeriodEnd !== false, // Default to true
        });
        return { success: true, subscription: {
                id: subscription.id,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                canceledAt: subscription.canceled_at,
            } };
    }
    catch (error) {
        console.error('Error canceling subscription:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to cancel subscription');
    }
});
/**
 * Reactivate a canceled subscription
 */
exports.reactivateStripeSubscription = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const { subscriptionId } = data;
        if (!subscriptionId) {
            throw new functions.https.HttpsError('invalid-argument', 'Subscription ID is required');
        }
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
        });
        return { success: true, subscription: {
                id: subscription.id,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
            } };
    }
    catch (error) {
        console.error('Error reactivating subscription:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to reactivate subscription');
    }
});
/**
 * Get customer's payment methods from Stripe
 */
exports.getStripePaymentMethods = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    var _a, _b, _c;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        return { paymentMethods: [] };
    }
    try {
        const userId = context.auth.uid;
        // Get Stripe customer ID from user document
        const userDoc = await admin.firestore().collection('customers').doc(userId).get();
        if (!userDoc.exists) {
            return { paymentMethods: [] };
        }
        const userData = userDoc.data();
        let customerId = userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId;
        if (!customerId) {
            const paymentsRef = admin.firestore().collection('customers').doc(userId).collection('payments');
            const paymentsSnapshot = await paymentsRef.limit(1).get();
            if (!paymentsSnapshot.empty) {
                customerId = (_a = paymentsSnapshot.docs[0].data()) === null || _a === void 0 ? void 0 : _a.stripeCustomerId;
            }
        }
        if (!customerId) {
            return { paymentMethods: [] };
        }
        // Get customer to find default payment method
        const customer = await stripe.customers.retrieve(customerId);
        const defaultPaymentMethodId = typeof ((_b = customer.invoice_settings) === null || _b === void 0 ? void 0 : _b.default_payment_method) === 'string'
            ? customer.invoice_settings.default_payment_method
            : (_c = customer.invoice_settings) === null || _c === void 0 ? void 0 : _c.default_payment_method;
        // List payment methods
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });
        const formattedMethods = paymentMethods.data.map((pm) => ({
            id: pm.id,
            type: pm.type,
            card: pm.card ? {
                brand: pm.card.brand,
                last4: pm.card.last4,
                expMonth: pm.card.exp_month,
                expYear: pm.card.exp_year,
            } : undefined,
            billingDetails: pm.billing_details,
            isDefault: pm.id === defaultPaymentMethodId,
        }));
        return { paymentMethods: formattedMethods };
    }
    catch (error) {
        console.error('Error fetching payment methods:', error);
        // Return empty array instead of throwing to allow UI to still work
        return { paymentMethods: [] };
    }
});
/**
 * Delete a payment method
 */
exports.deleteStripePaymentMethod = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const { paymentMethodId } = data;
        if (!paymentMethodId) {
            throw new functions.https.HttpsError('invalid-argument', 'Payment method ID is required');
        }
        await stripe.paymentMethods.detach(paymentMethodId);
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting payment method:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to delete payment method');
    }
});
/**
 * Set default payment method for customer
 */
exports.setDefaultStripePaymentMethod = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const userId = context.auth.uid;
        const { paymentMethodId } = data;
        if (!paymentMethodId) {
            throw new functions.https.HttpsError('invalid-argument', 'Payment method ID is required');
        }
        // Get Stripe customer ID from user document
        const userDoc = await admin.firestore().collection('customers').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        let customerId = userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId;
        if (!customerId) {
            const paymentsRef = admin.firestore().collection('customers').doc(userId).collection('payments');
            const paymentsSnapshot = await paymentsRef.limit(1).get();
            if (!paymentsSnapshot.empty) {
                customerId = (_a = paymentsSnapshot.docs[0].data()) === null || _a === void 0 ? void 0 : _a.stripeCustomerId;
            }
        }
        if (!customerId) {
            throw new functions.https.HttpsError('not-found', 'Stripe customer not found');
        }
        // Update customer's default payment method
        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error setting default payment method:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to set default payment method');
    }
});
/**
 * Sync all existing Firebase customers to Stripe
 * This function should be called manually to sync existing customers
 */
exports.syncAllCustomersToStripe = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    // Only allow admin to run this
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if user is admin
    const userDoc = await admin.firestore().collection('customers').doc(context.auth.uid).get();
    const userData = userDoc.data();
    const isAdmin = (userData === null || userData === void 0 ? void 0 : userData.email) === 'admin@medifocal.com' || (userData === null || userData === void 0 ? void 0 : userData.role) === 'admin';
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can sync customers');
    }
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const customersRef = admin.firestore().collection('customers');
        const customersSnapshot = await customersRef.get();
        let synced = 0;
        let skipped = 0;
        let errors = 0;
        const errorDetails = [];
        console.log(`Starting sync for ${customersSnapshot.size} customers...`);
        for (const customerDoc of customersSnapshot.docs) {
            try {
                const customerData = customerDoc.data();
                const userId = customerDoc.id;
                // Skip if already has Stripe customer ID
                if ((customerData === null || customerData === void 0 ? void 0 : customerData.stripeId) || (customerData === null || customerData === void 0 ? void 0 : customerData.stripeCustomerId)) {
                    skipped++;
                    continue;
                }
                // Skip if no email (can't create Stripe customer without email)
                if (!(customerData === null || customerData === void 0 ? void 0 : customerData.email)) {
                    skipped++;
                    continue;
                }
                // Create Stripe customer
                const customer = await stripe.customers.create({
                    email: customerData.email,
                    name: (customerData === null || customerData === void 0 ? void 0 : customerData.displayName) || (customerData === null || customerData === void 0 ? void 0 : customerData.name) ||
                        `${(customerData === null || customerData === void 0 ? void 0 : customerData.firstName) || ''} ${(customerData === null || customerData === void 0 ? void 0 : customerData.lastName) || ''}`.trim() || undefined,
                    phone: (customerData === null || customerData === void 0 ? void 0 : customerData.phoneNumber) || (customerData === null || customerData === void 0 ? void 0 : customerData.phone),
                    metadata: {
                        firebaseUID: userId,
                        practiceName: (customerData === null || customerData === void 0 ? void 0 : customerData.practiceName) || '',
                    },
                });
                // Update Firestore with Stripe customer ID
                await customerDoc.ref.update({
                    stripeId: customer.id,
                    stripeCustomerId: customer.id,
                });
                synced++;
                console.log(`Synced customer ${userId} -> Stripe ${customer.id}`);
            }
            catch (error) {
                errors++;
                const errorMsg = `Error syncing customer ${customerDoc.id}: ${error.message}`;
                errorDetails.push(errorMsg);
                console.error(errorMsg);
            }
        }
        return {
            success: true,
            total: customersSnapshot.size,
            synced,
            skipped,
            errors,
            errorDetails: errorDetails.slice(0, 10), // Return first 10 errors
        };
    }
    catch (error) {
        console.error('Error syncing customers:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to sync customers');
    }
});
/**
 * Webhook handler for Stripe Customer Portal events
 * This handles events that occur when customers use the customer portal
 * to manage their subscriptions, payment methods, billing, and tax IDs.
 *
 * Configure this webhook endpoint in Stripe Dashboard:
 * https://dashboard.stripe.com/webhooks
 *
 * Required events:
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - payment_method.attached
 * - payment_method.detached
 * - customer.updated
 * - customer.tax_id.created
 * - customer.tax_id.deleted
 * - customer.tax_id.updated
 * - billing_portal.configuration.created
 * - billing_portal.configuration.updated
 * - billing_portal.session.created
 */
exports.handleCustomerPortalWebhook = functions.region('australia-southeast1').https.onRequest(async (req, res) => {
    var _a;
    if (!stripe) {
        console.error('Stripe not configured');
        res.status(500).send('Stripe not configured');
        return;
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.webhook_secret);
    if (!webhookSecret) {
        console.error('Stripe webhook secret not configured');
        res.status(500).send('Webhook secret not configured');
        return;
    }
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        console.error('No Stripe signature found');
        res.status(400).send('No signature');
        return;
    }
    let event;
    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle different event types
    try {
        switch (event.type) {
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                await handleSubscriptionUpdated(subscription);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await handleSubscriptionDeleted(subscription);
                break;
            }
            case 'payment_method.attached': {
                const paymentMethod = event.data.object;
                await handlePaymentMethodAttached(paymentMethod);
                break;
            }
            case 'payment_method.detached': {
                const paymentMethod = event.data.object;
                await handlePaymentMethodDetached(paymentMethod);
                break;
            }
            case 'customer.updated': {
                const customer = event.data.object;
                await handleCustomerUpdated(customer);
                break;
            }
            case 'customer.tax_id.created': {
                const taxId = event.data.object;
                await handleTaxIdCreated(taxId);
                break;
            }
            case 'customer.tax_id.deleted': {
                const taxId = event.data.object;
                await handleTaxIdDeleted(taxId);
                break;
            }
            case 'customer.tax_id.updated': {
                const taxId = event.data.object;
                await handleTaxIdUpdated(taxId);
                break;
            }
            case 'billing_portal.configuration.created':
            case 'billing_portal.configuration.updated': {
                const configuration = event.data.object;
                console.log(`Billing portal configuration ${event.type}:`, configuration.id);
                // Log for monitoring - configurations are managed in Stripe Dashboard
                break;
            }
            case 'billing_portal.session.created': {
                const session = event.data.object;
                console.log('Billing portal session created:', session.id, 'for customer:', session.customer);
                // Log for monitoring - sessions are temporary and don't need to be stored
                break;
            }
            case 'checkout.session.completed': {
                const session = event.data.object;
                await handleCheckoutSessionCompleted(session);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        // Return success to Stripe
        res.json({ received: true });
    }
    catch (error) {
        console.error('Error handling webhook event:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});
/**
 * Handle subscription updates from customer portal
 * Updates Firestore when customers upgrade, downgrade, or change quantities
 */
async function handleSubscriptionUpdated(subscription) {
    try {
        const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;
        // Find Firebase user by Stripe customer ID
        const customersRef = admin.firestore().collection('customers');
        const customerQuery = await customersRef
            .where('stripeId', '==', customerId)
            .limit(1)
            .get();
        if (customerQuery.empty) {
            // Try alternative field name
            const altQuery = await customersRef
                .where('stripeCustomerId', '==', customerId)
                .limit(1)
                .get();
            if (altQuery.empty) {
                console.log('No Firebase user found for Stripe customer:', customerId);
                return;
            }
            const userDoc = altQuery.docs[0];
            await updateUserSubscription(userDoc.ref, subscription);
        }
        else {
            const userDoc = customerQuery.docs[0];
            await updateUserSubscription(userDoc.ref, subscription);
        }
    }
    catch (error) {
        console.error('Error handling subscription update:', error);
        throw error;
    }
}
/**
 * Update user subscription in Firestore
 */
async function updateUserSubscription(userRef, subscription) {
    var _a;
    const subscriptionData = {
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
        currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    // Get subscription items (products/prices)
    if (subscription.items && subscription.items.data.length > 0) {
        const item = subscription.items.data[0];
        subscriptionData.priceId = item.price.id;
        subscriptionData.productId = typeof item.price.product === 'string'
            ? item.price.product
            : (_a = item.price.product) === null || _a === void 0 ? void 0 : _a.id;
        subscriptionData.quantity = item.quantity;
    }
    // Update user document
    await userRef.update({
        subscription: subscriptionData,
        lastSubscriptionUpdate: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Updated subscription for user:', userRef.id, 'Status:', subscription.status);
}
/**
 * Handle subscription deletions from customer portal
 */
async function handleSubscriptionDeleted(subscription) {
    try {
        const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;
        // Find Firebase user by Stripe customer ID
        const customersRef = admin.firestore().collection('customers');
        const customerQuery = await customersRef
            .where('stripeId', '==', customerId)
            .limit(1)
            .get();
        if (customerQuery.empty) {
            const altQuery = await customersRef
                .where('stripeCustomerId', '==', customerId)
                .limit(1)
                .get();
            if (altQuery.empty) {
                console.log('No Firebase user found for Stripe customer:', customerId);
                return;
            }
            const userDoc = altQuery.docs[0];
            await userDoc.ref.update({
                subscription: admin.firestore.FieldValue.delete(),
                subscriptionStatus: 'canceled',
                lastSubscriptionUpdate: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        else {
            const userDoc = customerQuery.docs[0];
            await userDoc.ref.update({
                subscription: admin.firestore.FieldValue.delete(),
                subscriptionStatus: 'canceled',
                lastSubscriptionUpdate: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        console.log('Subscription deleted for customer:', customerId);
    }
    catch (error) {
        console.error('Error handling subscription deletion:', error);
        throw error;
    }
}
/**
 * Handle payment method attached event
 */
async function handlePaymentMethodAttached(paymentMethod) {
    var _a;
    try {
        const customerId = typeof paymentMethod.customer === 'string'
            ? paymentMethod.customer
            : (_a = paymentMethod.customer) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            console.log('No customer ID in payment method');
            return;
        }
        console.log('Payment method attached:', paymentMethod.id, 'for customer:', customerId);
        // Payment methods are managed via the portal, we just log this for monitoring
        // The getStripePaymentMethods function will fetch current payment methods when needed
    }
    catch (error) {
        console.error('Error handling payment method attached:', error);
    }
}
/**
 * Handle payment method detached event
 */
async function handlePaymentMethodDetached(paymentMethod) {
    var _a;
    try {
        const customerId = typeof paymentMethod.customer === 'string'
            ? paymentMethod.customer
            : (_a = paymentMethod.customer) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            console.log('No customer ID in payment method');
            return;
        }
        console.log('Payment method detached:', paymentMethod.id, 'for customer:', customerId);
        // Payment methods are managed via the portal, we just log this for monitoring
    }
    catch (error) {
        console.error('Error handling payment method detached:', error);
    }
}
/**
 * Handle customer updated event
 * Updates customer information in Firestore when changed via portal
 */
async function handleCustomerUpdated(customer) {
    try {
        // Find Firebase user by Stripe customer ID
        const customersRef = admin.firestore().collection('customers');
        const customerQuery = await customersRef
            .where('stripeId', '==', customer.id)
            .limit(1)
            .get();
        if (customerQuery.empty) {
            const altQuery = await customersRef
                .where('stripeCustomerId', '==', customer.id)
                .limit(1)
                .get();
            if (altQuery.empty) {
                console.log('No Firebase user found for Stripe customer:', customer.id);
                return;
            }
            const userDoc = altQuery.docs[0];
            await updateCustomerData(userDoc.ref, customer);
        }
        else {
            const userDoc = customerQuery.docs[0];
            await updateCustomerData(userDoc.ref, customer);
        }
    }
    catch (error) {
        console.error('Error handling customer update:', error);
    }
}
/**
 * Update customer data in Firestore from Stripe customer object
 */
async function updateCustomerData(userRef, customer) {
    var _a, _b;
    const updates = {
        lastBillingUpdate: admin.firestore.FieldValue.serverTimestamp(),
    };
    // Update email if changed (but don't use as login credential per Stripe docs)
    if (customer.email) {
        updates.billingEmail = customer.email;
    }
    // Update default payment method
    if ((_a = customer.invoice_settings) === null || _a === void 0 ? void 0 : _a.default_payment_method) {
        const defaultPmId = typeof customer.invoice_settings.default_payment_method === 'string'
            ? customer.invoice_settings.default_payment_method
            : (_b = customer.invoice_settings.default_payment_method) === null || _b === void 0 ? void 0 : _b.id;
        updates.defaultPaymentMethodId = defaultPmId;
    }
    // Update address if present
    if (customer.address) {
        updates.billingAddress = {
            line1: customer.address.line1,
            line2: customer.address.line2,
            city: customer.address.city,
            state: customer.address.state,
            postal_code: customer.address.postal_code,
            country: customer.address.country,
        };
    }
    await userRef.update(updates);
    console.log('Updated customer data for user:', userRef.id);
}
/**
 * Handle tax ID created event
 */
async function handleTaxIdCreated(taxId) {
    var _a;
    try {
        const customerId = typeof taxId.customer === 'string'
            ? taxId.customer
            : (_a = taxId.customer) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            return;
        }
        // Find Firebase user
        const customersRef = admin.firestore().collection('customers');
        const customerQuery = await customersRef
            .where('stripeId', '==', customerId)
            .limit(1)
            .get();
        if (customerQuery.empty) {
            const altQuery = await customersRef
                .where('stripeCustomerId', '==', customerId)
                .limit(1)
                .get();
            if (altQuery.empty) {
                return;
            }
            const userDoc = altQuery.docs[0];
            await userDoc.ref.update({
                taxIds: admin.firestore.FieldValue.arrayUnion({
                    id: taxId.id,
                    type: taxId.type,
                    value: taxId.value,
                    country: taxId.country,
                    created: admin.firestore.Timestamp.fromDate(new Date(taxId.created * 1000)),
                }),
            });
        }
        else {
            const userDoc = customerQuery.docs[0];
            await userDoc.ref.update({
                taxIds: admin.firestore.FieldValue.arrayUnion({
                    id: taxId.id,
                    type: taxId.type,
                    value: taxId.value,
                    country: taxId.country,
                    created: admin.firestore.Timestamp.fromDate(new Date(taxId.created * 1000)),
                }),
            });
        }
        console.log('Tax ID created:', taxId.id, 'for customer:', customerId);
    }
    catch (error) {
        console.error('Error handling tax ID created:', error);
    }
}
/**
 * Handle tax ID deleted event
 */
async function handleTaxIdDeleted(taxId) {
    var _a;
    try {
        const customerId = typeof taxId.customer === 'string'
            ? taxId.customer
            : (_a = taxId.customer) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            return;
        }
        // Find Firebase user
        const customersRef = admin.firestore().collection('customers');
        const customerQuery = await customersRef
            .where('stripeId', '==', customerId)
            .limit(1)
            .get();
        if (customerQuery.empty) {
            const altQuery = await customersRef
                .where('stripeCustomerId', '==', customerId)
                .limit(1)
                .get();
            if (altQuery.empty) {
                return;
            }
            const userDoc = altQuery.docs[0];
            const userData = userDoc.data();
            const taxIds = (userData === null || userData === void 0 ? void 0 : userData.taxIds) || [];
            const updatedTaxIds = taxIds.filter((tid) => tid.id !== taxId.id);
            await userDoc.ref.update({
                taxIds: updatedTaxIds,
            });
        }
        else {
            const userDoc = customerQuery.docs[0];
            const userData = userDoc.data();
            const taxIds = (userData === null || userData === void 0 ? void 0 : userData.taxIds) || [];
            const updatedTaxIds = taxIds.filter((tid) => tid.id !== taxId.id);
            await userDoc.ref.update({
                taxIds: updatedTaxIds,
            });
        }
        console.log('Tax ID deleted:', taxId.id, 'for customer:', customerId);
    }
    catch (error) {
        console.error('Error handling tax ID deleted:', error);
    }
}
/**
 * Handle tax ID updated event (validation updates)
 */
async function handleTaxIdUpdated(taxId) {
    var _a;
    try {
        const customerId = typeof taxId.customer === 'string'
            ? taxId.customer
            : (_a = taxId.customer) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            return;
        }
        // Find Firebase user
        const customersRef = admin.firestore().collection('customers');
        const customerQuery = await customersRef
            .where('stripeId', '==', customerId)
            .limit(1)
            .get();
        if (customerQuery.empty) {
            const altQuery = await customersRef
                .where('stripeCustomerId', '==', customerId)
                .limit(1)
                .get();
            if (altQuery.empty) {
                return;
            }
            const userDoc = altQuery.docs[0];
            const userData = userDoc.data();
            const taxIds = (userData === null || userData === void 0 ? void 0 : userData.taxIds) || [];
            const updatedTaxIds = taxIds.map((tid) => tid.id === taxId.id
                ? Object.assign(Object.assign({}, tid), { verification: taxId.verification, updated: admin.firestore.Timestamp.fromDate(new Date(taxId.created * 1000)) }) : tid);
            await userDoc.ref.update({
                taxIds: updatedTaxIds,
            });
        }
        else {
            const userDoc = customerQuery.docs[0];
            const userData = userDoc.data();
            const taxIds = (userData === null || userData === void 0 ? void 0 : userData.taxIds) || [];
            const updatedTaxIds = taxIds.map((tid) => tid.id === taxId.id
                ? Object.assign(Object.assign({}, tid), { verification: taxId.verification, updated: admin.firestore.Timestamp.fromDate(new Date(taxId.created * 1000)) }) : tid);
            await userDoc.ref.update({
                taxIds: updatedTaxIds,
            });
        }
        console.log('Tax ID updated:', taxId.id, 'for customer:', customerId);
    }
    catch (error) {
        console.error('Error handling tax ID updated:', error);
    }
}
/**
 * Handle checkout session completed
 * Creates Firebase Auth account when user completes Stripe Checkout
 * For bank transfer, creates invoice instead of processing payment
 */
async function handleCheckoutSessionCompleted(session) {
    var _a;
    try {
        const customerId = typeof session.customer === 'string'
            ? session.customer
            : (_a = session.customer) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            console.error('No customer ID in checkout session');
            return;
        }
        // Get customer details from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.email) {
            console.error('Customer has no email address');
            return;
        }
        // PayTo and other payment methods are handled normally by Stripe
        // No special handling needed - payment is processed automatically
        // Create Firebase Auth account
        // Check if Firebase Auth account already exists for this email
        try {
            const userRecord = await admin.auth().getUserByEmail(customer.email);
            console.log('Firebase Auth account already exists for email:', customer.email);
            // Update Firestore with Stripe customer ID
            await admin.firestore().collection('customers').doc(userRecord.uid).set({
                stripeId: customerId,
                stripeCustomerId: customerId,
                email: customer.email,
                displayName: customer.name || customer.email,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            return;
        }
        catch (error) {
            // User doesn't exist, create new account
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }
        // Create Firebase Auth account
        // Generate a random password - user will need to reset it
        const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';
        const userRecord = await admin.auth().createUser({
            email: customer.email,
            displayName: customer.name || undefined,
            emailVerified: false,
            password: randomPassword, // User will need to reset password
        });
        console.log('Created Firebase Auth account for Stripe customer:', customerId, '-> Firebase UID:', userRecord.uid);
        // Create Firestore customer document
        await admin.firestore().collection('customers').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: customer.email,
            displayName: customer.name || customer.email,
            role: 'customer',
            stripeId: customerId,
            stripeCustomerId: customerId,
            phoneNumber: customer.phone || undefined,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update Stripe customer metadata with Firebase UID
        await stripe.customers.update(customerId, {
            metadata: Object.assign(Object.assign({}, customer.metadata), { firebaseUID: userRecord.uid }),
        });
        // Send password reset email so user can set their password
        try {
            await admin.auth().generatePasswordResetLink(customer.email);
            console.log('Password reset link generated for:', customer.email);
            // TODO: Send email with reset link via email service
        }
        catch (emailError) {
            console.error('Error generating password reset link:', emailError);
        }
    }
    catch (error) {
        console.error('Error handling checkout session completed:', error);
        throw error;
    }
}
/**
 * Scheduled function to build backlinks automatically
 * Runs daily at 2 AM Australia/Sydney time
 */
exports.buildBacklinksScheduled = functions.region('australia-southeast1')
    .pubsub.schedule('0 2 * * *') // 2 AM daily (Australia/Sydney timezone)
    .timeZone('Australia/Sydney')
    .onRun(async (context) => {
    console.log('Starting scheduled backlink building...');
    const db = admin.firestore();
    try {
        // Create job record
        const jobRef = db.collection('backlink_jobs').doc();
        const jobId = jobRef.id;
        await jobRef.set({
            status: 'running',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            strategies: ['all'],
            created: 0,
            errors: [],
            summary: {},
        });
        // Execute backlink building
        const result = await (0, backlinkBuilder_1.executeBacklinkStrategies)(['all']);
        // Update job record with results
        await jobRef.update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            created: result.created,
            errors: result.errors,
            summary: result.summary,
            success: result.success,
        });
        console.log(`Backlink building completed: ${result.created} backlinks created`);
        return null;
    }
    catch (error) {
        console.error('Error in scheduled backlink building:', error);
        // Try to update job status if jobRef exists
        try {
            const jobsRef = db.collection('backlink_jobs');
            const recentJobs = await jobsRef
                .where('status', '==', 'running')
                .orderBy('startedAt', 'desc')
                .limit(1)
                .get();
            if (!recentJobs.empty) {
                await recentJobs.docs[0].ref.update({
                    status: 'failed',
                    completedAt: admin.firestore.FieldValue.serverTimestamp(),
                    error: error.message,
                });
            }
        }
        catch (updateError) {
            console.error('Error updating job status:', updateError);
        }
        throw error;
    }
});
/**
 * Manual trigger for backlink building (callable function)
 * Can be called from admin dashboard
 */
exports.buildBacklinksManual = functions.region('australia-southeast1')
    .https.onCall(async (data, context) => {
    // Check if user is admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if user is admin
    const userDoc = await admin.firestore().collection('customers').doc(context.auth.uid).get();
    const userData = userDoc.data();
    const userRole = (userData === null || userData === void 0 ? void 0 : userData.role) || '';
    const isAdmin = userRole === 'admin' ||
        ['admin', 'technician', 'manager', 'supervisor', 'super_admin'].includes(userRole) ||
        context.auth.token.role === 'admin';
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger backlink building');
    }
    const db = admin.firestore();
    const strategies = (data === null || data === void 0 ? void 0 : data.strategies) || ['all'];
    try {
        // Create job record
        const jobRef = db.collection('backlink_jobs').doc();
        const jobId = jobRef.id;
        await jobRef.set({
            status: 'running',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            triggeredBy: context.auth.uid,
            strategies,
            created: 0,
            errors: [],
            summary: {},
        });
        // Execute backlink building (don't await - run in background)
        (0, backlinkBuilder_1.executeBacklinkStrategies)(strategies)
            .then(async (result) => {
            try {
                await jobRef.update({
                    status: 'completed',
                    completedAt: admin.firestore.FieldValue.serverTimestamp(),
                    created: result.created || 0,
                    errors: result.errors || [],
                    summary: result.summary || {},
                    success: result.success !== false,
                });
                console.log(`Backlink building completed: ${result.created} backlinks created`);
            }
            catch (updateError) {
                console.error('Error updating job status:', updateError);
            }
        })
            .catch(async (error) => {
            console.error('Error in backlink building:', error);
            try {
                await jobRef.update({
                    status: 'failed',
                    completedAt: admin.firestore.FieldValue.serverTimestamp(),
                    error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error',
                });
            }
            catch (updateError) {
                console.error('Error updating failed job status:', updateError);
            }
        });
        // Return job ID immediately
        return {
            success: true,
            jobId,
            message: 'Backlink building started in background',
        };
    }
    catch (error) {
        console.error('Error starting backlink building:', error);
        throw new functions.https.HttpsError('internal', 'Failed to start backlink building', error.message);
    }
});
/**
 * Get backlink job status
 */
exports.getBacklinkJobStatus = functions.region('australia-southeast1')
    .https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        // Allow unauthenticated access for job status (public read)
        const db = admin.firestore();
        const jobId = data === null || data === void 0 ? void 0 : data.jobId;
        if (!jobId) {
            // Get latest job
            const jobsRef = db.collection('backlink_jobs');
            const latestJob = await jobsRef
                .orderBy('startedAt', 'desc')
                .limit(1)
                .get();
            if (latestJob.empty) {
                return { status: 'no_jobs', message: 'No backlink jobs found' };
            }
            const jobData = latestJob.docs[0].data();
            return Object.assign(Object.assign({ jobId: latestJob.docs[0].id }, jobData), { startedAt: ((_c = (_b = (_a = jobData.startedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString()) || null, completedAt: ((_f = (_e = (_d = jobData.completedAt) === null || _d === void 0 ? void 0 : _d.toDate) === null || _e === void 0 ? void 0 : _e.call(_d)) === null || _f === void 0 ? void 0 : _f.toISOString()) || null });
        }
        // Get specific job
        const jobDoc = await db.collection('backlink_jobs').doc(jobId).get();
        if (!jobDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Job not found');
        }
        const jobData = jobDoc.data();
        return Object.assign(Object.assign({ jobId: jobDoc.id }, jobData), { startedAt: ((_j = (_h = (_g = jobData === null || jobData === void 0 ? void 0 : jobData.startedAt) === null || _g === void 0 ? void 0 : _g.toDate) === null || _h === void 0 ? void 0 : _h.call(_g)) === null || _j === void 0 ? void 0 : _j.toISOString()) || null, completedAt: ((_m = (_l = (_k = jobData === null || jobData === void 0 ? void 0 : jobData.completedAt) === null || _k === void 0 ? void 0 : _k.toDate) === null || _l === void 0 ? void 0 : _l.call(_k)) === null || _m === void 0 ? void 0 : _m.toISOString()) || null });
    }
    catch (error) {
        console.error('Error in getBacklinkJobStatus:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get job status', error.message);
    }
});
/**
 * Check user login type (for admin login modal)
 */
exports.checkUserLoginType = functions.region('australia-southeast1')
    .https.onCall(async (data, context) => {
    try {
        const email = data === null || data === void 0 ? void 0 : data.email;
        if (!email || typeof email !== 'string') {
            throw new functions.https.HttpsError('invalid-argument', 'Email is required');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
        }
        // Check if user exists in Firestore customers collection
        const db = admin.firestore();
        const customersSnapshot = await db.collection('customers')
            .where('email', '==', email.toLowerCase().trim())
            .limit(1)
            .get();
        if (customersSnapshot.empty) {
            return { exists: false, loginType: 'standard' };
        }
        const userData = customersSnapshot.docs[0].data();
        const role = (userData === null || userData === void 0 ? void 0 : userData.role) || 'customer';
        // Determine login type
        const isFieldServiceUser = ['admin', 'technician', 'manager', 'supervisor', 'super_admin'].includes(role);
        return {
            exists: true,
            loginType: isFieldServiceUser ? 'field_service' : 'standard',
            role: role,
        };
    }
    catch (error) {
        console.error('Error in checkUserLoginType:', error);
        // Return non-blocking error (don't throw)
        return {
            exists: false,
            loginType: 'standard',
            error: error.message,
        };
    }
});
//# sourceMappingURL=index.js.map