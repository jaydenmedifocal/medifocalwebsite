# Fix www.medifocal.com - Step-by-Step Solution

## The Problem
The SSL error confirms: `www.medifocal.com` doesn't have a valid SSL certificate because DNS isn't correctly configured in Squarespace.

## Solution (Without Deleting Domain in Firebase)

### Step 1: Check Firebase Console Status

1. Go to: https://console.firebase.google.com/project/medifocal/hosting/main
2. Click **"Custom domains"** tab
3. Look for `www.medifocal.com` in the list

**If it's there:**
- Click on it
- Check the status (Pending/Error/Active)
- Look for DNS records section - it should show what's needed

**If it's NOT there:**
- Click **"Add custom domain"**
- Enter: `www.medifocal.com`
- Firebase will show DNS records needed
- **COPY THEM IMMEDIATELY** before closing

### Step 2: Configure DNS in Squarespace

**The Fix: Add CNAME Record**

1. Log into Squarespace
2. Go to: **Settings** → **Domains**
3. Click on **medifocal.com**
4. Click **"DNS Settings"** (or **"Advanced DNS"**)

5. **Find or Add www record:**
   - Look for existing `www` record
   - If found: Click **Edit**
   - If not found: Click **"Add Record"** or **"+"**

6. **Configure the record:**
   ```
   Type: CNAME
   Host: www
   Value/Points to: medifocal.web.app
   TTL: 3600 (or leave as default)
   ```

7. **Save the record**

### Step 3: Verify DNS is Correct

**Check DNS propagation:**
- Visit: https://www.whatsmydns.net/#CNAME/www.medifocal.com
- Should show: `medifocal.web.app` (may take 15-60 minutes to propagate)

**Or use online tool:**
- https://dnschecker.org/#CNAME/www.medifocal.com
- Should show `medifocal.web.app` globally

### Step 4: Wait for Firebase to Detect

1. Go back to Firebase Console → Hosting → Custom domains
2. Click on `www.medifocal.com`
3. Status will change:
   - **"Pending"** → DNS propagating
   - **"Connected"** → DNS correct, SSL being issued
   - **"Active"** → Fully working with SSL

**Timeline:**
- DNS propagation: 15 minutes to 48 hours (usually 1-2 hours)
- SSL certificate: 1-24 hours after DNS is correct

### Step 5: If Domain is Already in Firebase But Broken

**If www.medifocal.com is in Firebase but shows error:**

1. **DO NOT DELETE IT** - this causes the problem you mentioned
2. Instead:
   - Click on the domain
   - Look for "DNS Configuration" or "Verification" section
   - It should show what DNS records are needed
   - If it doesn't show records, try:
     - Refresh the page
     - Check if there's a "Retry" or "Verify" button
     - Look for any error messages

3. **If you can't see DNS records:**
   - The domain might be in a broken state
   - Try using Firebase CLI:
     ```bash
     npx firebase-tools hosting:sites:get medifocal
     ```
   - Or contact Firebase support to reset the domain

## Common Issues & Solutions

### Issue: "Can't see DNS records after deleting domain"
**Solution:** This is why you shouldn't delete domains. If already deleted:
1. Try adding domain again - Firebase may remember it
2. If it says "already exists", check all domain statuses carefully
3. May need Firebase support to reset

### Issue: "Squarespace won't let me add CNAME for www"
**Solution:** 
- Some Squarespace plans require domain to be fully connected
- Try: Settings → Domains → Advanced Settings
- Or contact Squarespace support to enable CNAME for www

### Issue: "DNS is correct but SSL won't issue"
**Solution:**
1. Verify DNS is fully propagated (check multiple locations)
2. Wait 24-48 hours - SSL can take time
3. Check Firebase Console for any error messages
4. Ensure www.medifocal.com is properly added as custom domain

### Issue: "Firebase shows domain but no DNS records"
**Solution:**
1. Click on the domain in Firebase Console
2. Look for "Verification" or "DNS Configuration" tab
3. Try clicking "Verify" or "Retry" button
4. If still no records, domain may be in broken state - contact Firebase support

## Quick Reference: DNS Record Needed

```
Type: CNAME
Host: www
Value: medifocal.web.app
```

This is the ONLY record needed for www subdomain to work with Firebase Hosting.

## After DNS is Fixed

Once www.medifocal.com is working with SSL:
1. We can add redirect rules (www → non-www or vice versa)
2. Update canonical URLs
3. Ensure consistent domain usage

But first, DNS must be correctly configured in Squarespace.

