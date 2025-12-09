import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'not_found' | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const { user } = useAuth();

  // Check user login type when email changes (non-blocking, optional)
  useEffect(() => {
    const checkUserLoginType = async (emailToCheck: string) => {
      if (!emailToCheck || !emailToCheck.includes('@')) {
        setLoginType(null);
        return;
      }

      setCheckingUser(true);
      try {
        const checkUserType = httpsCallable(functions, 'checkUserLoginType');
        const result = await checkUserType({ email: emailToCheck });
        const data = result.data as any;
        setLoginType(data.loginType || 'not_found');
      } catch (err: any) {
        // Silently handle CORS and other errors - don't block login
        // User can still attempt login even if check fails
        console.warn('Could not check user login type (non-blocking):', err.message || err);
        // Don't set loginType to 'not_found' on error - allow login attempt
      } finally {
        setCheckingUser(false);
      }
    };

    const timer = setTimeout(() => {
      if (email) {
        checkUserLoginType(email);
      } else {
        setLoginType(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      
      // User will be set automatically via AuthContext onAuthStateChange
      // Small delay to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to admin dashboard
      onSuccess();
    } catch (err: any) {
      console.error('Admin login error:', err);
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none"
              placeholder="admin@medifocal.com"
              required
              disabled={loading}
            />
            {checkingUser && (
              <p className="text-xs text-gray-500 mt-1">Checking account type...</p>
            )}
            {loginType === 'not_found' && email && (
              <p className="text-xs text-red-600 mt-1">Account not found or not an admin account.</p>
            )}
            {loginType === 'admin' && (
              <p className="text-xs text-green-600 mt-1">✓ Admin account detected</p>
            )}
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !email || !password}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
