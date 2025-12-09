/**
 * Setup Admin Account
 * This function sets up admin@medifocal.com with admin role
 * Run this once to initialize the admin account
 */

import * as admin from 'firebase-admin';

export const setupAdminAccount = async () => {
  try {
    const adminEmail = 'admin@medifocal.com';
    
    // Check if Firebase Auth user exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log('Firebase Auth user already exists:', userRecord.uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create Firebase Auth user
        const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';
        userRecord = await admin.auth().createUser({
          email: adminEmail,
          displayName: 'Admin',
          emailVerified: false,
          password: randomPassword,
        });
        console.log('Created Firebase Auth user for admin:', userRecord.uid);
        
        // Send password reset email
        const resetLink = await admin.auth().generatePasswordResetLink(adminEmail);
        console.log('Password reset link generated for admin. Send this link to admin@medifocal.com');
        console.log('Reset link:', resetLink);
      } else {
        throw error;
      }
    }
    
    // Create/update Firestore customer document with admin role
    const customerRef = admin.firestore().collection('customers').doc(userRecord.uid);
    await customerRef.set({
      uid: userRecord.uid,
      email: adminEmail,
      displayName: 'Admin',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log('✅ Admin account setup complete!');
    console.log('Email:', adminEmail);
    console.log('UID:', userRecord.uid);
    console.log('Role: admin');
    
    return {
      success: true,
      uid: userRecord.uid,
      email: adminEmail,
      message: 'Admin account setup complete. Password reset email should be sent.',
    };
  } catch (error: any) {
    console.error('Error setting up admin account:', error);
    throw error;
  }
};



