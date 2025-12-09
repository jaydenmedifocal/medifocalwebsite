import React, { useEffect, useState } from 'react';
import { exchangeCodeForToken, storeTokens, getAuthorizationUrl } from '../services/aliexpressOAuth';
import { View } from '../App';

interface AliExpressOAuthCallbackProps {
  setCurrentView?: (view: View) => void;
}

const AliExpressOAuthCallback: React.FC<AliExpressOAuthCallbackProps> = ({ setCurrentView }) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Processing authorization...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('=== OAuth Callback Handler ===');
      console.log('Full URL:', window.location.href);
      console.log('Pathname:', window.location.pathname);
      console.log('Search params:', window.location.search);
      console.log('Hash:', window.location.hash);

      // Parse URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      // Check for error in URL
      if (errorParam) {
        console.error('OAuth error:', errorParam, errorDescription);
        setStatus('error');
        setError(errorDescription || errorParam);
        setMessage('Authorization failed');
        return;
      }

      // Check for authorization code
      if (!code) {
        console.warn('WARNING: Callback URL reached but no parameters received');
        console.warn('This might be due to:');
        console.warn('1. AliExpress system upgrade (until Dec 5, 2025) - try logging into Seller Center first');
        console.warn('2. Redirect URI mismatch - ensure callback URL matches AliExpress App Console');
        console.warn('3. User cancelled authorization');
        
        setStatus('error');
        setError('Missing authorization code. Please try again.');
        setMessage('Authorization incomplete');
        return;
      }

      console.log('Authorization code received:', code.substring(0, 10) + '...');
      console.log('State:', state);

      try {
        setMessage('Exchanging authorization code for access token...');
        
        // Exchange code for access token
        const tokens = await exchangeCodeForToken(code);
        
        console.log('Token exchange successful:', {
          access_token: tokens.access_token.substring(0, 20) + '...',
          expires_in: tokens.expires_in,
          user_nick: tokens.user_nick,
          account_platform: tokens.account_platform
        });

        // Store tokens
        storeTokens(tokens);
        
        setStatus('success');
        setMessage('Successfully connected to AliExpress!');
        
        // Redirect to admin AliExpress page after a short delay
        setTimeout(() => {
          if (setCurrentView) {
            setCurrentView({ page: 'admin', section: 'aliexpress' });
          } else {
            window.location.href = '/admin/aliexpress';
          }
        }, 2000);
        
      } catch (err: any) {
        console.error('Error exchanging code for token:', err);
        setStatus('error');
        setError(err.message || 'Failed to complete authorization');
        setMessage('Authorization failed');
      }
    };

    handleCallback();
  }, [setCurrentView]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Authorization</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to admin dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authorization Failed</h1>
            <p className="text-gray-600 mb-4">{error || message}</p>
            
            {error?.includes('Missing authorization code') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left text-sm">
                <p className="font-semibold text-yellow-800 mb-2">Troubleshooting:</p>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  <li>AliExpress system upgrade until Dec 5, 2025 - try logging into Seller Center first</li>
                  <li>Ensure callback URL matches your AliExpress App Console settings</li>
                  <li>Check that both medifocal.com and medifocal.web.app are added to allowed redirect URIs</li>
                </ul>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  const authUrl = getAuthorizationUrl();
                  window.location.href = authUrl;
                }}
                className="bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-brand-blue-dark"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  if (setCurrentView) {
                    setCurrentView({ page: 'admin', section: 'aliexpress' });
                  } else {
                    window.location.href = '/admin/aliexpress';
                  }
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Back to Admin
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AliExpressOAuthCallback;
