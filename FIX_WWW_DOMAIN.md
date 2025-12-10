# Fix www.medifocal.com Domain Issues

## Problem
- www.medifocal.com has SSL certificate issues
- DNS records in Squarespace may not be correct
- Deleting and re-adding domain in Firebase doesn't provide DNS records again

## Solution: Configure www Subdomain Without Deleting

### Step 1: Check Current Domain Status in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/medifocal/hosting)
2. Navigate to **Hosting** → **Custom domains**
3. Check if `www.medifocal.com` is already listed

### Step 2: Add www.medifocal.com (If Not Already Added)

**Option A: If domain is NOT in Firebase Console:**
1. Click **"Add custom domain"**
2. Enter: `www.medifocal.com`
3. Firebase will provide DNS records (A record or CNAME)
4. **IMPORTANT:** Copy these records BEFORE closing the dialog

**Option B: If domain IS already in Firebase Console but has issues:**
1. Click on `www.medifocal.com` in the domain list
2. Look for **"DNS Configuration"** or **"Verification"** section
3. You should see the DNS records needed

### Step 3: Configure DNS in Squarespace

**For www subdomain, you typically need ONE of these:**

#### Option 1: CNAME Record (Recommended)
```
Type: CNAME
Host: www
Value: medifocal.web.app
TTL: 3600 (or Automatic)
```

#### Option 2: A Record (If CNAME not supported)
```
Type: A
Host: www
Value: [IP addresses from Firebase - usually 151.101.1.195, 151.101.65.195]
TTL: 3600
```

**Steps in Squarespace:**
1. Go to Squarespace → Settings → Domains
2. Click on `medifocal.com`
3. Go to **DNS Settings** or **Advanced DNS**
4. Find existing `www` record (if any) and **edit it**
5. If no `www` record exists, **add new record**
6. Set according to Firebase's requirements (usually CNAME to `medifocal.web.app`)
7. Save changes

### Step 4: Wait for DNS Propagation

- DNS changes can take 24-48 hours to propagate
- Check propagation: https://www.whatsmydns.net/#CNAME/www.medifocal.com
- Firebase will automatically detect when DNS is correct and issue SSL certificate

### Step 5: Verify in Firebase Console

1. Go back to Firebase Console → Hosting → Custom domains
2. Check status of `www.medifocal.com`
3. Status should change from "Pending" to "Connected" once DNS is correct
4. SSL certificate will be issued automatically (can take a few hours after DNS is correct)

## Alternative: Use Firebase Hosting Redirect (If DNS Can't Be Fixed)

If you can't configure DNS properly, we can add a redirect rule in `firebase.json`:

```json
"redirects": [
  {
    "source": "https://www.medifocal.com/**",
    "destination": "https://medifocal.com/:splat",
    "type": 301
  }
]
```

**However**, this only works if www.medifocal.com is already pointing to Firebase hosting. If DNS isn't configured, the redirect won't work.

## Troubleshooting

### If Firebase doesn't show DNS records:
1. **Don't delete the domain** - this causes the issue you mentioned
2. Instead, try:
   - Refresh the Firebase Console page
   - Check if domain is in "Pending" state
   - Click on the domain to see if DNS records appear
   - Try using Firebase CLI: `firebase hosting:sites:get medifocal`

### If DNS records are missing:
1. Check Squarespace DNS settings
2. Ensure no conflicting records exist
3. Remove any old/incorrect www records
4. Add the correct CNAME record pointing to `medifocal.web.app`

### If SSL certificate won't issue:
1. Verify DNS is correctly configured (use DNS checker tools)
2. Ensure www.medifocal.com resolves to Firebase hosting
3. Wait 24-48 hours for certificate issuance
4. Check Firebase Console for any error messages

## Quick Fix: Use Firebase CLI to Get DNS Info

Run this command to see current domain configuration:
```bash
npx firebase-tools hosting:sites:get medifocal
```

This will show you the current domain setup and any DNS records needed.

