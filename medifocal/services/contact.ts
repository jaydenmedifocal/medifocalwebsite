import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactEmail = async (data: ContactFormData) => {
  try {
    // Ensure all required fields are present and properly formatted
    const emailData = {
      name: (data.name || '').trim(),
      email: (data.email || '').trim(),
      subject: (data.subject || '').trim(),
      message: (data.message || '').trim()
    };

    // Validate required fields
    if (!emailData.name || !emailData.email || !emailData.subject || !emailData.message) {
      throw new Error('All fields are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.email)) {
      throw new Error('Please enter a valid email address');
    }

    console.log('Calling sendContactEmail function with data:', emailData);
    
    // Create the callable function - ensure it's using the correct region
    const sendEmail = httpsCallable<ContactFormData, { success: boolean; message: string }>(functions, 'sendContactEmail');
    
    // Call the function with the properly formatted data
    console.log('Invoking Firebase function...');
    const result = await sendEmail(emailData);
    console.log('Function call successful:', result.data);
    
    // Verify the response
    if (result.data && result.data.success) {
      return { success: true, data: result.data };
    } else {
      throw new Error(result.data?.message || 'Email sending failed');
    }
  } catch (error: any) {
    console.error('Error sending contact email:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    
    // Extract user-friendly error message
    let errorMessage = 'Failed to send email. Please try again later.';
    
    if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Invalid form data. Please check all fields are filled correctly.';
    } else if (error.code === 'functions/not-found') {
      errorMessage = 'Contact service is temporarily unavailable. Please try again later.';
    } else if (error.code === 'functions/permission-denied') {
      errorMessage = 'Permission denied. Please check your authentication.';
    } else if (error.code === 'functions/unavailable') {
      errorMessage = 'Service is temporarily unavailable. Please try again in a moment.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

