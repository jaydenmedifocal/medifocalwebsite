/**
 * Browser Console Script to Setup Admin
 * 
 * Copy and paste this into your browser console after signing in as admin@medifocal.com
 * 
 * This will set your user role to 'admin' in Firestore
 */

// Import Firebase functions (adjust path if needed)
// This script should be run in the browser console after the app is loaded

async function setupAdmin() {
  try {
    // Get current user
    const { getAuth } = await import('firebase/auth');
    const { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../firebase/config');
    const auth = getAuth();
    
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No user signed in. Please sign in first.');
      return;
    }
    
    if (user.email !== 'admin@medifocal.com') {
      console.warn(`⚠️ Current user is ${user.email}, not admin@medifocal.com`);
      console.log('Setting current user as admin anyway...');
    }
    
    console.log(`Setting up admin for: ${user.email}`);
    
    // Update user document
    const userRef = doc(db, 'customers', user.uid);
    const { updateDoc: updateDocFn } = await import('firebase/firestore');
    
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Successfully set as admin!');
    console.log('Please refresh the page to see the admin dashboard link.');
    
    // Reload page after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error: any) {
    console.error('❌ Error setting up admin:', error);
  }
}

// Run the function
setupAdmin();

