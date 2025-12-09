/**
 * AliExpress OAuth Service
 * Handles OAuth flow and token management for AliExpress API integration
 */

const ALIEXPRESS_API_BASE = 'https://api-sg.aliexpress.com';
const ALIEXPRESS_REST_BASE = 'https://api-sg.aliexpress.com/rest'; // For system-level requests

export interface AliExpressTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  refresh_expires_in: number; // seconds
  expire_time: number; // timestamp in milliseconds
  refresh_token_valid_time: number; // timestamp in milliseconds
  user_id: string;
  account_id: string;
  user_nick: string;
  account: string;
  account_platform: string;
  seller_id?: string;
  locale: string;
  sp: string;
  request_id: string;
  havana_id: string;
}

export interface AliExpressOAuthConfig {
  appKey: string;
  appSecret: string;
  redirectUri: string;
}

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfig(): AliExpressOAuthConfig {
  const appKey = import.meta.env.VITE_ALIEXPRESS_APP_KEY || '';
  const appSecret = import.meta.env.VITE_ALIEXPRESS_APP_SECRET || '';
  
  // Determine redirect URI based on environment
  const hostname = window.location.hostname;
  let redirectUri = '';
  
  if (hostname === 'medifocal.com' || hostname === 'www.medifocal.com') {
    redirectUri = 'https://medifocal.com/aliexpress/oauth/callback';
  } else if (hostname === 'medifocal.web.app' || hostname === 'medifocal.firebaseapp.com') {
    redirectUri = 'https://medifocal.web.app/aliexpress/oauth/callback';
  } else {
    // Development
    redirectUri = `${window.location.origin}/aliexpress/oauth/callback`;
  }
  
  if (!appKey || !appSecret) {
    console.warn('AliExpress OAuth credentials not configured');
  }
  
  return {
    appKey,
    appSecret,
    redirectUri
  };
}

/**
 * Generate authorization URL for AliExpress OAuth
 */
export function getAuthorizationUrl(state?: string): string {
  const config = getOAuthConfig();
  const baseUrl = 'https://auth.aliexpress.com/oauth/authorize';
  
  const params = new URLSearchParams({
    client_id: config.appKey,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'api',
    state: state || Math.random().toString(36).substring(7)
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * Uses POST /auth/token/create endpoint
 */
export async function exchangeCodeForToken(code: string): Promise<AliExpressTokenResponse> {
  const config = getOAuthConfig();
  
  if (!config.appKey || !config.appSecret) {
    throw new Error('AliExpress OAuth credentials not configured');
  }
  
  // AliExpress OAuth token exchange endpoint
  // Use the standard OAuth 2.0 token endpoint
  const url = 'https://oauth.aliexpress.com/token';
  
  // Create request body in form-urlencoded format (OAuth 2.0 standard)
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.appKey,
    client_secret: config.appSecret,
    code: code,
    redirect_uri: config.redirectUri
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Token exchange failed: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error_description || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Handle OAuth 2.0 error response
    if (data.error) {
      throw new Error(data.error_description || data.error || 'OAuth token exchange failed');
    }
    
    // Handle AliExpress-specific response format (if wrapped)
    let responseBody = data;
    if (data.gopResponseBody) {
      responseBody = typeof data.gopResponseBody === 'string' 
        ? JSON.parse(data.gopResponseBody) 
        : data.gopResponseBody;
    }
    
    // Calculate expiry times
    const now = Date.now();
    const expireTime = responseBody.expire_time || (now + (responseBody.expires_in * 1000));
    const refreshTokenValidTime = responseBody.refresh_token_valid_time || (now + (responseBody.refresh_expires_in * 1000));
    
    return {
      access_token: responseBody.access_token,
      refresh_token: responseBody.refresh_token,
      expires_in: responseBody.expires_in || 3600,
      refresh_expires_in: responseBody.refresh_expires_in || 2592000,
      expire_time: expireTime,
      refresh_token_valid_time: refreshTokenValidTime,
      user_id: responseBody.user_id || responseBody.userId || '',
      account_id: responseBody.account_id || responseBody.accountId || '',
      user_nick: responseBody.user_nick || responseBody.userNick || '',
      account: responseBody.account || '',
      account_platform: responseBody.account_platform || responseBody.accountPlatform || '',
      seller_id: responseBody.seller_id || responseBody.sellerId,
      locale: responseBody.locale || 'en_US',
      sp: responseBody.sp || '',
      request_id: data.gopRequestId || responseBody.request_id || responseBody.requestId || '',
      havana_id: responseBody.havana_id || responseBody.havanaId || ''
    };
  } catch (error: any) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * Create HMAC-SHA256 signature for AliExpress API requests
 * This is a simplified version - you may need to adjust based on AliExpress requirements
 */
async function createSignature(
  appKey: string,
  appSecret: string,
  apiName: string,
  params: any,
  timestamp: string
): Promise<string> {
  // Sort parameters and create query string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  // Create string to sign
  const stringToSign = `${apiName}${sortedParams}${timestamp}${appSecret}`;
  
  // Create HMAC-SHA256 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(appSecret);
  const messageData = encoder.encode(stringToSign);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex.toUpperCase();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AliExpressTokenResponse> {
  const config = getOAuthConfig();
  
  if (!config.appKey || !config.appSecret) {
    throw new Error('AliExpress OAuth credentials not configured');
  }
  
  // Implementation similar to exchangeCodeForToken but with refresh_token parameter
  // This would use a different endpoint like /auth/token/refresh
  // Placeholder for now
  throw new Error('Token refresh not yet implemented');
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(tokens: AliExpressTokenResponse): void {
  try {
    localStorage.setItem('aliexpress_tokens', JSON.stringify(tokens));
    localStorage.setItem('aliexpress_tokens_expiry', (Date.now() + (tokens.expires_in * 1000)).toString());
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
}

/**
 * Get stored tokens from localStorage
 */
export function getStoredTokens(): AliExpressTokenResponse | null {
  try {
    const tokensJson = localStorage.getItem('aliexpress_tokens');
    const expiryStr = localStorage.getItem('aliexpress_tokens_expiry');
    
    if (!tokensJson || !expiryStr) {
      return null;
    }
    
    const expiry = parseInt(expiryStr, 10);
    if (Date.now() >= expiry) {
      // Tokens expired
      localStorage.removeItem('aliexpress_tokens');
      localStorage.removeItem('aliexpress_tokens_expiry');
      return null;
    }
    
    return JSON.parse(tokensJson);
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return null;
  }
}

/**
 * Get valid access token (checks expiry and refreshes if needed)
 */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  
  if (!tokens) {
    return null;
  }
  
  // Check if token is about to expire (within 5 minutes)
  const expiryTime = tokens.expire_time || (Date.now() + (tokens.expires_in * 1000));
  const fiveMinutes = 5 * 60 * 1000;
  
  if (Date.now() >= expiryTime - fiveMinutes) {
    // Token expired or about to expire, try to refresh
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      storeTokens(newTokens);
      return newTokens.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear invalid tokens
      localStorage.removeItem('aliexpress_tokens');
      localStorage.removeItem('aliexpress_tokens_expiry');
      return null;
    }
  }
  
  return tokens.access_token;
}
