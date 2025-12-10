# Fix www.medifocal.com - Complete Guide

## The Problem
- www.medifocal.com has SSL certificate issues
- DNS records in Squarespace may be incorrect
- Deleting domain in Firebase and re-adding doesn't show DNS records again

## Solution: Fix DNS Without Deleting Domain

### Step 1: Check Current Status in Firebase Console

1. Go to: https://console.firebase.google.com/project/medifocal/hosting
2. Click on **"Custom domains"** tab
3. Check if `www.medifocal.com` is listed:
   - **If YES:** Click on it to see current status and DNS requirements
   - **If NO:** You'll need to add it (see Step 2)

### Step 2: Add www.medifocal.com to Firebase (If Not Added)

**IMPORTANT:** Do NOT delete existing domain entries. If www.medifocal.com is already there but broken, skip to Step 3.

1. In Firebase Console → Hosting → Custom domains
2. Click **"Add custom domain"**
3. Enter: `www.medifocal.com`
4. Firebase will show you DNS records needed
5. **COPY THESE RECORDS IMMEDIATELY** (before closing dialog)

### Step 3: Configure DNS in Squarespace

**For www subdomain, you need a CNAME record:**

1. Log into Squarespace
2. Go to: **Settings** → **Domains** → Click on `medifocal.com`
3. Click **"DNS Settings"** or **"Advanced DNS"**
4. Find any existing `www` record and **EDIT it**, or **ADD new record** if none exists
5. Configure as follows:

```
Type: CNAME
Host: www
Value: medifocal.web.app
TTL: 3600 (or Automatic)
```

**Important Squarespace Notes:**
- Squarespace may auto-append `.medifocal.com` to the host value - that's OK
- The host should just be `www` (not `www.medifocal.com`)
- The value should be `medifocal.web.app` (your Firebase hosting URL)

### Step 4: Verify DNS Configuration

**Check if DNS is correct:**
1. Use DNS checker: https://www.whatsmydns.net/#CNAME/www.medifocal.com
2. Or use command line:
   ```bash
   dig www.medifocal.com CNAME
   ```
3. Should show: `www.medifocal.com` → `medifocal.web.app`

**Wait for propagation:**
- DNS changes can take 24-48 hours to fully propagate
- Check multiple times over the next day

### Step 5: Verify in Firebase Console

1. Go back to Firebase Console → Hosting → Custom domains
2. Click on `www.medifocal.com`
3. Status should change:
   - **"Pending"** → DNS not yet configured or propagating
   - **"Connected"** → DNS is correct, SSL certificate being issued
   - **"Active"** → Fully configured with SSL

### Step 6: SSL Certificate Issuance

Once DNS is correct:
- Firebase automatically detects correct DNS
- SSL certificate is issued automatically (can take 1-24 hours)
- You'll see status change to "Active" when complete

## Alternative: If You Can't See DNS Records in Firebase

If you deleted the domain and Firebase won't show DNS records:

### Option A: Use Firebase CLI
```bash
npx firebase-tools hosting:sites:get medifocal
```

### Option B: Add Domain Again (If Not Already Added)
1. In Firebase Console, try adding `www.medifocal.com` again
2. If it says "domain already exists", check the domain list more carefully
3. Look for any domain with "Pending" or "Error" status

### Option C: Contact Firebase Support
If domain is stuck, you may need to contact Firebase support to reset it.

## Common DNS Configurations

### Correct Configuration (CNAME - Recommended):
```
www → CNAME → medifocal.web.app
```

### Alternative (A Records - If CNAME not supported):
```
www → A → 199.36.158.100
www → A → 151.101.1.195
www → A → 151.101.65.195
```

**Note:** Firebase's IP addresses may change. CNAME is preferred.

## Troubleshooting

### Issue: "Domain verification failed"
- **Solution:** Check TXT record in Squarespace DNS
- Firebase may require a TXT record for verification
- Add TXT record with value provided by Firebase

### Issue: "SSL certificate pending"
- **Solution:** Wait 24-48 hours after DNS is correct
- Ensure DNS is fully propagated (check with DNS checker)
- Firebase automatically issues SSL once DNS is verified

### Issue: "Can't see DNS records after deleting domain"
- **Solution:** Don't delete domains in Firebase
- If already deleted, try adding domain again
- If it says "already exists", check all domain statuses
- May need Firebase support to reset

### Issue: "www.medifocal.com shows 404 or wrong site"
- **Solution:** DNS may be pointing to wrong location
- Verify CNAME points to `medifocal.web.app`
- Check Squarespace DNS settings are saved correctly

## Quick Fix Script

Once DNS is configured correctly, we can add a redirect rule. But first, DNS must be working.

Run this to check current DNS:
```bash
dig www.medifocal.com CNAME +short
```

Should return: `medifocal.web.app.`

## Next Steps After DNS is Fixed

Once www.medifocal.com is working and has SSL:
1. We can add a redirect from www to non-www (or vice versa) in firebase.json
2. Update sitemap to prefer one version
3. Configure canonical URLs

But first, DNS must be correctly configured in Squarespace.

