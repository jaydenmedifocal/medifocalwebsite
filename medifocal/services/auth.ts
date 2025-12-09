import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  multiFactor,
  PhoneMultiFactorGenerator,
  MultiFactorError
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../firebase/config';
import { trackLogin, trackSignUp } from './analytics';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'customer' | 'user' | 'super_admin' | 'technician' | 'manager' | 'supervisor';
  practiceName?: string;
  phoneNumber?: string;
  phone?: string;
  acceptsMarketing?: boolean;
  createdAt?: any;
  updatedAt?: any;
  photoURL?: string | null;
  emailVerified?: boolean;
  multiFactorEnabled?: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  userFriendlyMessage?: string;
}

/**
 * Get user-friendly error message
 */
export const getAuthErrorMessage = (error: any): AuthError => {
  const code = error.code || 'unknown';
  let message = error.message || 'An unknown error occurred';
  let userFriendlyMessage = 'An error occurred. Please try again.';

  switch (code) {
    case 'auth/user-not-found':
      userFriendlyMessage = 'No account found with this email address.';
      break;
    case 'auth/wrong-password':
      userFriendlyMessage = 'Incorrect password. Please try again.';
      break;
    case 'auth/invalid-credential':
      // Firebase's newer error code for invalid email/password combination
      userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
      break;
    case 'auth/invalid-email':
      userFriendlyMessage = 'Invalid email address. Please check and try again.';
      break;
    case 'auth/user-disabled':
      userFriendlyMessage = 'This account has been disabled. Please contact support.';
      break;
    case 'auth/email-already-in-use':
      userFriendlyMessage = 'An account with this email already exists.';
      break;
    case 'auth/weak-password':
      userFriendlyMessage = 'Password is too weak. Please use a stronger password.';
      break;
    case 'auth/too-many-requests':
      userFriendlyMessage = 'Too many failed attempts. Please try again later.';
      break;
    case 'auth/network-request-failed':
      userFriendlyMessage = 'Network error. Please check your connection and try again.';
      break;
    case 'auth/popup-closed-by-user':
      userFriendlyMessage = 'Sign-in popup was closed. Please try again.';
      break;
    case 'auth/cancelled-popup-request':
      userFriendlyMessage = 'Only one popup request is allowed at a time.';
      break;
    case 'auth/invalid-phone-number':
      userFriendlyMessage = 'Invalid phone number format.';
      break;
    case 'auth/invalid-verification-code':
      userFriendlyMessage = 'Invalid verification code. Please try again.';
      break;
    case 'auth/session-expired':
      userFriendlyMessage = 'Verification session expired. Please try again.';
      break;
    case 'auth/multi-factor-auth-required':
      userFriendlyMessage = 'Multi-factor authentication required.';
      break;
    default:
      userFriendlyMessage = message;
  }

  return { code, message, userFriendlyMessage };
};

/**
 * Sign in with email and password
 * Customer data is stored in Stripe, not Firestore
 */
export const signIn = async (email: string, password: string): Promise<UserData> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if MFA is required
    if (user.multiFactor && user.multiFactor.enrolledFactors.length > 0) {
      // MFA is enabled, but email/password sign-in should still work
      // The MFA challenge will be handled separately if needed
    }
    
    // Get user data (checks Firestore for admin/technician, otherwise gets from Stripe)
    const userData = await getUserData(user.uid);
    
    // Track login event
    trackLogin('email');
    
    return userData;
  } catch (error: any) {
    console.error('Error signing in:', error);
    
    // Handle MFA required error
    if (error.code === 'auth/multi-factor-auth-required') {
      const mfaError = error as MultiFactorError;
      throw {
        ...getAuthErrorMessage(error),
        mfaHint: mfaError.resolver.hints[0],
        mfaResolver: mfaError.resolver
      };
    }
    
    throw getAuthErrorMessage(error);
  }
};

/**
 * Sign up with email and password
 * Creates Stripe customer directly (not Firestore)
 */
export const signUp = async (
  email: string,
  password: string,
  displayName?: string,
  practiceName?: string,
  firstName?: string,
  lastName?: string,
  phoneNumber?: string,
  acceptsMarketing: boolean = false
): Promise<UserData> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Split displayName into firstName and lastName if not provided
    let finalFirstName = firstName;
    let finalLastName = lastName;
    if (!firstName && !lastName && displayName) {
      const nameParts = displayName.trim().split(' ');
      finalFirstName = nameParts[0] || '';
      finalLastName = nameParts.slice(1).join(' ') || '';
    }

    // Create Stripe customer directly (not Firestore)
    const getOrCreateStripeCustomer = httpsCallable(functions, 'getOrCreateStripeCustomer');
    const fullName = displayName || `${finalFirstName} ${finalLastName}`.trim();
    
    await getOrCreateStripeCustomer({
      email: user.email,
      name: fullName || undefined,
      phone: phoneNumber || undefined,
      metadata: {
        practiceName: practiceName || '',
        acceptsMarketing: acceptsMarketing.toString(),
      },
    });

    // Return user data (customer data is in Stripe, not Firestore)
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || '',
      firstName: finalFirstName,
      lastName: finalLastName,
      role: 'customer', // Default role - check Firestore for admin/technician
      practiceName: practiceName || '',
      phoneNumber: phoneNumber || '',
      phone: phoneNumber || '',
      acceptsMarketing: acceptsMarketing,
      emailVerified: user.emailVerified,
    };

    // Track sign up
    trackSignUp('email');

    return userData;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw getAuthErrorMessage(error);
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Check if Stripe customer exists by email
 */
const checkStripeCustomerExists = async (email: string): Promise<{ exists: boolean; customerId?: string }> => {
  try {
    const getOrCreateStripeCustomer = httpsCallable(functions, 'getOrCreateStripeCustomer');
    const result = await getOrCreateStripeCustomer({ email, checkOnly: true });
    const data = result.data as any;
    return {
      exists: !!data?.customerId,
      customerId: data?.customerId
    };
  } catch (error) {
    console.error('Error checking Stripe customer:', error);
    return { exists: false };
  }
};

/**
 * Sign in with Google
 * Checks for existing Stripe customer first
 * If Stripe customer exists but no Firebase Auth, prompts to login with email/password
 */
export const signInWithGoogle = async (useRedirect: boolean = false): Promise<UserData> => {
  try {
    const provider = new GoogleAuthProvider();
    
    // Add scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    let result;
    if (useRedirect) {
      // Use redirect for mobile/embedded contexts
      await signInWithRedirect(auth, provider);
      // Note: getRedirectResult should be called on page load to handle the redirect
      return null as any; // Will be handled by getRedirectResult
    } else {
      // Try popup - if it fails, we'll handle it
      result = await signInWithPopup(auth, provider);
    }

    const user = result.user;
    
    if (!user.email) {
      throw new Error('Google account does not have an email address');
    }
    
    // Check if Stripe customer already exists for this email
    const stripeCheck = await checkStripeCustomerExists(user.email);
    
    // Get or create Stripe customer
    // This will find existing customer or create new one
    try {
      const getOrCreateStripeCustomer = httpsCallable(functions, 'getOrCreateStripeCustomer');
      
      const stripeResult = await getOrCreateStripeCustomer({
        email: user.email,
        name: user.displayName || undefined,
        metadata: {
          photoURL: user.photoURL || '',
          firebaseUID: user.uid,
        },
      });
      
      const stripeData = stripeResult.data as any;
      
      // If customer existed before, log it
      if (stripeCheck.exists && stripeData?.customerId === stripeCheck.customerId) {
        console.log('Linked existing Stripe customer to Firebase Auth account');
      }
    } catch (stripeError: any) {
      // Log but don't fail - user is signed in, Stripe can be fixed later
      console.error('Error creating/linking Stripe customer during Google sign-in:', stripeError);
    }
    
    // Get user data (checks Firestore for admin/technician, otherwise gets from Stripe)
    const userData = await getUserData(user.uid);
    
    // Track login event
    trackLogin('google');
    
    return userData;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw {
        ...getAuthErrorMessage(error),
        userFriendlyMessage: 'Sign-in popup was closed. Please click "Sign in with Google" again and complete the sign-in in the popup window.'
      };
    }
    
    if (error.code === 'auth/cancelled-popup-request') {
      throw {
        ...getAuthErrorMessage(error),
        userFriendlyMessage: 'Another sign-in request is already in progress. Please wait a moment and try again.'
      };
    }
    
    if (error.code === 'auth/popup-blocked') {
      throw {
        ...getAuthErrorMessage(error),
        userFriendlyMessage: 'Popup was blocked by your browser. Please allow popups for this site and try again, or use email/password sign-in.'
      };
    }
    
    if (error.code === 'auth/unauthorized-domain') {
      throw {
        ...getAuthErrorMessage(error),
        userFriendlyMessage: 'This domain is not authorized for Google sign-in. Please use email/password sign-in or contact support.'
      };
    }
    
    if (error.code === 'auth/operation-not-allowed') {
      throw {
        ...getAuthErrorMessage(error),
        userFriendlyMessage: 'Google sign-in is not enabled. Please use email/password sign-in or contact support.'
      };
    }
    
    // For any other errors, use the standard error message
    throw getAuthErrorMessage(error);
  }
};

/**
 * Handle Google redirect result (call on page load)
 * Creates Stripe customer directly (not Firestore)
 */
export const handleGoogleRedirect = async (): Promise<UserData | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      
      // Create Stripe customer if new user
      const getOrCreateStripeCustomer = httpsCallable(functions, 'getOrCreateStripeCustomer');
      await getOrCreateStripeCustomer({
        email: user.email,
        name: user.displayName || undefined,
        metadata: {
          photoURL: user.photoURL || '',
        },
      });
      
      // Get user data (checks Firestore for admin/technician, otherwise gets from Stripe)
      return await getUserData(user.uid);
    }
    return null;
  } catch (error: any) {
    console.error('Error handling Google redirect:', error);
    throw getAuthErrorMessage(error);
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error sending password reset:', error);
    throw getAuthErrorMessage(error);
  }
};

/**
 * Initialize reCAPTCHA verifier for phone authentication
 */
export const initializeRecaptcha = (elementId: string = 'recaptcha-container'): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, elementId, {
    size: 'normal',
    callback: (response: any) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired, ask user to solve reCAPTCHA again
      console.log('reCAPTCHA expired');
    }
  });
};

/**
 * Send SMS verification code to phone number
 */
export const sendPhoneVerificationCode = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<string> => {
  try {
    // Format phone number (ensure it starts with +)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    
    // Return the verification ID (stored in confirmationResult.verificationId)
    return confirmationResult.verificationId;
  } catch (error: any) {
    console.error('Error sending phone verification:', error);
    throw getAuthErrorMessage(error);
  }
};

/**
 * Verify phone SMS code and sign in
 */
export const verifyPhoneCode = async (
  verificationId: string,
  verificationCode: string
): Promise<UserData> => {
  try {
    const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const userCredential = await signInWithCredential(auth, phoneCredential);
    const user = userCredential.user;

    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'customers', user.uid));
    if (!userDoc.exists()) {
      // Create user document for new phone sign-in
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber || '',
        phone: user.phoneNumber || '',
        role: 'customer',
        emailVerified: user.emailVerified,
        acceptsMarketing: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'customers', user.uid), userData);
      // Track sign up for new phone users
      trackSignUp('phone');
      return userData;
    }

    // Update phone number if changed
    if (user.phoneNumber) {
      await updateDoc(doc(db, 'customers', user.uid), {
        phoneNumber: user.phoneNumber,
        phone: user.phoneNumber,
        updatedAt: serverTimestamp()
      });
    }

    const userData = await getUserData(user.uid);
    // Track login for existing phone users
    trackLogin('phone');
    return userData;
  } catch (error: any) {
    console.error('Error verifying phone code:', error);
    throw getAuthErrorMessage(error);
  }
};

/**
 * Enroll phone number for MFA (Multi-Factor Authentication)
 * Returns verification ID that needs to be verified with completePhoneMFAEnrollment
 */
export const enrollPhoneMFA = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be signed in to enroll MFA');
    }

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const multiFactorSession = await multiFactor(user).getSession();
    
    // Get phone auth credential
    const phoneInfoOptions = {
      phoneNumber: formattedPhone,
      session: multiFactorSession
    };

    // Send verification code for MFA enrollment
    const phoneAuthCredential = PhoneAuthProvider.credential(
      await new Promise<string>((resolve, reject) => {
        signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
          .then((confirmationResult) => {
            resolve(confirmationResult.verificationId);
          })
          .catch(reject);
      }),
      '' // Will be filled after verification
    );

    // Return verification ID
    return phoneAuthCredential.verificationId || '';
  } catch (error: any) {
    console.error('Error enrolling phone MFA:', error);
    throw getAuthErrorMessage(error);
  }
};

/**
 * Complete MFA enrollment with verification code
 */
export const completePhoneMFAEnrollment = async (
  verificationId: string,
  verificationCode: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be signed in to complete MFA enrollment');
    }

    const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneCredential);
    
    await multiFactor(user).enroll(multiFactorAssertion, user.displayName || 'Phone');
    
    // Update user data
    await updateDoc(doc(db, 'customers', user.uid), {
      multiFactorEnabled: true,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Error completing MFA enrollment:', error);
    throw getAuthErrorMessage(error);
  }
};

/**
 * Verify MFA code during sign-in
 */
export const verifyMFA = async (
  mfaResolver: any,
  verificationId: string,
  verificationCode: string
): Promise<UserData> => {
  try {
    const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneCredential);
    const userCredential = await mfaResolver.resolveSignIn(multiFactorAssertion);
    const user = userCredential.user;

    return await getUserData(user.uid);
  } catch (error: any) {
    console.error('Error verifying MFA:', error);
    throw getAuthErrorMessage(error);
  }
};

/**
 * Get user data
 * Checks Firestore for admin/technician roles, otherwise gets customer data from Stripe
 */
export const getUserData = async (uid: string): Promise<UserData> => {
  try {
    const firebaseUser = auth.currentUser;
    
    // First, check Firestore for admin/technician roles
    const userDoc = await getDoc(doc(db, 'customers', uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const role = data.role || 'customer';
      
      // If user is admin or technician, return Firestore data
      if (['admin', 'technician', 'manager', 'supervisor', 'super_admin'].includes(role)) {
        return {
          uid,
          email: data.email || firebaseUser?.email || null,
          displayName: data.displayName || data.name || firebaseUser?.displayName || null,
          firstName: data.firstName,
          lastName: data.lastName,
          role: role as any,
          practiceName: data.practiceName || data.practice || null,
          phoneNumber: data.phoneNumber || data.phone || firebaseUser?.phoneNumber || null,
          phone: data.phone || data.phoneNumber || firebaseUser?.phoneNumber || null,
          acceptsMarketing: data.acceptsMarketing || false,
          photoURL: data.photoURL || firebaseUser?.photoURL || null,
          emailVerified: data.emailVerified !== undefined ? data.emailVerified : (firebaseUser?.emailVerified || false),
          multiFactorEnabled: data.multiFactorEnabled || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          ...data
        } as UserData;
      }
    }
    
    // For regular customers, get data from Stripe
    // Customer data is stored in Stripe, not Firestore
    const getOrCreateStripeCustomer = httpsCallable(functions, 'getOrCreateStripeCustomer');
    try {
      const stripeResult = await getOrCreateStripeCustomer({});
      const stripeData = (stripeResult.data as any)?.customer;
      
      // Extract name parts from Stripe customer name
      const nameParts = stripeData?.name ? stripeData.name.split(' ') : [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        uid,
        email: stripeData?.email || firebaseUser?.email || null,
        displayName: stripeData?.name || firebaseUser?.displayName || null,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role: 'customer',
        phoneNumber: stripeData?.phone || firebaseUser?.phoneNumber || null,
        phone: stripeData?.phone || firebaseUser?.phoneNumber || null,
        photoURL: stripeData?.metadata?.photoURL || firebaseUser?.photoURL || null,
        practiceName: stripeData?.metadata?.practiceName || null,
        emailVerified: firebaseUser?.emailVerified || false,
      };
    } catch (stripeError) {
      console.error('Error getting Stripe customer:', stripeError);
      // Fallback to basic Firebase Auth data
      return {
        uid,
        email: firebaseUser?.email || null,
        displayName: firebaseUser?.displayName || null,
        role: 'customer',
        emailVerified: firebaseUser?.emailVerified || false,
        phoneNumber: firebaseUser?.phoneNumber || null,
      };
    }
  } catch (error: any) {
    console.error('Error getting user data:', error);
    // Return basic user data if lookup fails
    const firebaseUser = auth.currentUser;
    return {
      uid,
      email: firebaseUser?.email || null,
      displayName: firebaseUser?.displayName || null,
      role: 'customer',
      emailVerified: firebaseUser?.emailVerified || false,
      phoneNumber: firebaseUser?.phoneNumber || null
    };
  }
};

/**
 * Update user data in Firestore
 */
export const updateUserData = async (uid: string, data: Partial<UserData>): Promise<void> => {
  try {
    const userRef = doc(db, 'customers', uid);
    const updateData: any = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    await updateDoc(userRef, updateData);
    
    // Also update Firebase Auth profile if displayName or photoURL changed
    const user = auth.currentUser;
    if (user && (data.displayName !== undefined || data.photoURL !== undefined)) {
      await updateProfile(user, {
        displayName: data.displayName || user.displayName || undefined,
        photoURL: data.photoURL || user.photoURL || undefined
      });
    }
  } catch (error: any) {
    console.error('Error updating user data:', error);
    throw getAuthErrorMessage(error);
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: UserData | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const userData = await getUserData(firebaseUser.uid);
        callback(userData);
      } catch (error) {
        console.error('Error getting user data on auth state change:', error);
        // Fallback to basic user data
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: 'customer'
        });
      }
    } else {
      callback(null);
    }
  });
};

