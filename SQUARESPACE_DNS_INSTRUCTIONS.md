# Squarespace DNS Configuration for www.medifocal.com

## Exact Steps for Squarespace

### Step 1: Access DNS Settings
1. Log into Squarespace
2. Go to: **Settings** → **Domains**
3. Find and click on **medifocal.com**
4. Click **"DNS Settings"** (or **"Advanced DNS"** if available)

### Step 2: Check Existing www Record
1. Look for any record with **Host** = `www`
2. If found, click **Edit**
3. If not found, click **"Add Record"** or **"+"**

### Step 3: Configure CNAME Record

**If editing existing record:**
- **Type:** CNAME
- **Host:** `www` (Squarespace may show this as `www.medifocal.com` - that's OK)
- **Data/Value/Points to:** `medifocal.web.app`
- **TTL:** 3600 or Automatic

**If adding new record:**
- Click **"Add Record"**
- Select **"CNAME"** from Type dropdown
- **Host:** Enter `www`
- **Data/Value:** Enter `medifocal.web.app`
- **TTL:** Leave as default or set to 3600
- Click **"Save"** or **"Add"**

### Step 4: Verify in Squarespace
After saving, you should see:
```
Type: CNAME
Host: www
Value: medifocal.web.app
```

### Step 5: Wait and Check
1. Wait 15-30 minutes for DNS to start propagating
2. Check DNS propagation: https://www.whatsmydns.net/#CNAME/www.medifocal.com
3. Check Firebase Console for domain status update

## Important Notes

### Squarespace Auto-Appending
- Squarespace may automatically append `.medifocal.com` to host values
- This is normal - just enter `www` as the host
- The system will handle the full domain name

### If CNAME Not Available
Some Squarespace plans may not support CNAME for www. In that case:
1. Contact Squarespace support to enable CNAME for www
2. Or use A records (less ideal, but works):
   ```
   Type: A
   Host: www
   Value: 199.36.158.100
   ```

### Firebase Verification
After DNS is configured:
1. Firebase will automatically detect the correct DNS
2. SSL certificate will be issued (takes 1-24 hours)
3. Check Firebase Console → Hosting → Custom domains for status

## Troubleshooting Squarespace

### Can't Find DNS Settings
- Some Squarespace plans require domain to be fully connected
- Make sure domain is properly connected to Squarespace
- Try: Settings → Domains → Advanced Settings

### Record Won't Save
- Check for typos in the value field
- Ensure CNAME is selected (not A record)
- Try removing and re-adding the record

### Still Not Working After 48 Hours
1. Double-check DNS record is saved correctly
2. Verify DNS propagation with multiple tools
3. Check Firebase Console for any error messages
4. Contact Squarespace support if DNS record isn't working

