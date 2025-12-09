/**
 * Setup Admin Script
 * 
 * This script sets up admin@medifocal.com with admin role in Firestore
 * 
 * Usage:
 * 1. Import this in your app or run in browser console
 * 2. Call setupAdminUser('admin@medifocal.com')
 */

import { collection, query, where, getDocs, updateDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Set user as admin by email
 */
export const setupAdminUser = async (email: string): Promise<void> => {
  try {
    console.log(`Setting up admin user: ${email}`);
    
    // Find user by email in customers collection
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error(`No user found with email: ${email}`);
      console.log('Please ensure the user has signed up first, or create the user document manually.');
      throw new Error(`User with email ${email} not found. Please sign up first.`);
    }
    
    // Update the first matching user
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'customers', userDoc.id);
    
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Successfully set ${email} as admin!`);
    console.log(`User ID: ${userDoc.id}`);
    console.log('Please refresh the page to see the admin dashboard link.');
  } catch (error: any) {
    console.error('Error setting up admin user:', error);
    throw error;
  }
};

/**
 * Create admin user if doesn't exist (for initial setup)
 * Note: This requires the user to be authenticated in Firebase Auth first
 */
export const createAdminUser = async (
  uid: string,
  email: string,
  displayName: string = 'Admin User'
): Promise<void> => {
  try {
    console.log(`Creating admin user: ${email}`);
    
    const userRef = doc(db, 'customers', uid);
    
    await setDoc(userRef, {
      uid,
      email,
      displayName,
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log(`✅ Successfully created admin user: ${email}`);
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

