# Cloudflare R2 Setup Guide

This guide walks you through setting up Cloudflare R2 to host your app assets via `cdn.13daystories.com`.

## Prerequisites

- Cloudflare account (free tier is sufficient)
- Domain `13daystories.com` registered
- Access to your domain's DNS settings

## Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://www.cloudflare.com)
2. Sign up for a free account (or log in if you already have one)
3. Complete email verification

## Step 2: Add Your Domain to Cloudflare (If Not Already Added)

If `13daystories.com` is not already on Cloudflare:

1. In Cloudflare dashboard, click **Add a Site**
2. Enter `13daystories.com`
3. Select a plan (Free plan is fine)
4. Cloudflare will scan your existing DNS records
5. Follow the prompts to update your nameservers at your domain registrar
6. Wait for DNS propagation (can take a few minutes to 24 hours)

**Note**: If your domain is already on Cloudflare, skip to Step 3.

## Step 3: Create R2 Bucket

1. In Cloudflare dashboard, click **R2** in the left sidebar
2. If you see a prompt to enable R2, click **Enable R2** (it's free to enable)
3. Click **Create bucket** button
4. Enter bucket name: `13daystories-assets`
5. Choose a location (select closest to your users, or default is fine)
6. Click **Create bucket**

## Step 4: Configure Custom Domain

1. In your R2 bucket (`13daystories-assets`), click on the **Settings** tab
2. Scroll down to **Custom Domains** section
3. Click **Connect Domain** button
4. Enter: `cdn.13daystories.com`
5. Click **Continue**

Cloudflare will now configure the domain for you. This may take a few minutes.

## Step 5: Verify DNS Configuration

1. Go to **DNS** in the Cloudflare dashboard
2. You should see a CNAME record automatically created:
   - **Type**: CNAME
   - **Name**: `cdn`
   - **Target**: (something like `r2.dev` or a custom endpoint)
   - **Proxy status**: Proxied (orange cloud icon)

If the record doesn't appear automatically:
1. Click **Add record**
2. Select **CNAME**
3. Name: `cdn`
4. Target: (check your R2 bucket settings for the exact value)
5. Proxy status: **Proxied** (orange cloud)
6. Click **Save**

## Step 6: Enable Public Access

1. Go back to your R2 bucket
2. Click **Settings** tab
3. Scroll to **Public Access** section
4. Toggle **Allow Access** to **ON**
5. This makes your bucket publicly readable (which is what we want for CDN)

## Step 7: Configure Cache Rules (Recommended)

To set proper cache headers (260 days for images, 1 day for JSON):

### Option A: Via Cache Rules (Easier)

1. Go to **Rules** → **Cache Rules** in Cloudflare dashboard
2. Click **Create rule**
3. **Rule name**: `CDN Images - 260 days`
4. **When incoming requests match**:
   - Field: `URI Path`
   - Operator: `ends with`
   - Value: `.webp`
5. **Then the settings are**:
   - Cache status: `Cache`
   - Edge TTL: `259 days` (or `22464000` seconds)
6. Click **Deploy**

Repeat for `.jpg` files:
1. Create another rule: `CDN Images JPG - 260 days`
2. Match: URI Path ends with `.jpg`
3. Edge TTL: `259 days`

For JSON files:
1. Create rule: `CDN JSON - 1 day`
2. Match: URI Path ends with `.json`
3. Edge TTL: `1 day` (or `86400` seconds)

### Option B: Via Transform Rules (More Control)

If you want to set Cache-Control headers directly:

1. Go to **Rules** → **Transform Rules** → **Response Header Modification**
2. Create rules to add `Cache-Control` headers based on file extension

**Note**: Cache Rules (Option A) is simpler and recommended for most cases.

## Step 8: Upload Assets

You have several options to upload your assets:

### Option A: Cloudflare Dashboard (Easiest for First Upload)

1. Go to your R2 bucket
2. Click **Upload** button
3. Drag and drop your entire `/cdn` folder structure
4. Maintain the folder structure:
   ```
   trecena-aj/
     ├── data.json
     └── 1/
         ├── horoscope.webp
         ├── horoscope.jpg
         └── ...
   ```

**Note**: Dashboard upload may be slow for many files. For large uploads, use Option B or C.

### Option B: Using Wrangler CLI (Recommended for Large Uploads)

1. Install Wrangler (Cloudflare's CLI):
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Upload files:
   ```bash
   # From your project root
   cd cdn
   wrangler r2 object put 13daystories-assets/trecena-aj/data.json --file=trecena-aj/data.json
   ```

   Or upload entire directory (you may need a script for this):
   ```bash
   # Example script to upload all files
   find . -type f -exec wrangler r2 object put 13daystories-assets/{} --file={} \;
   ```

### Option C: Using R2 API with Script

You can create a Node.js script using the AWS S3 SDK (R2 is S3-compatible):

```javascript
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  endpoint: 'https://<account-id>.r2.cloudflarestorage.com',
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key',
  region: 'auto',
  signatureVersion: 'v4',
});

// Upload function
async function uploadFile(bucket, key, filePath) {
  const fileContent = fs.readFileSync(filePath);
  return s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ContentType: getContentType(filePath),
    CacheControl: getCacheControl(filePath),
  }).promise();
}
```

**To get R2 API credentials:**
1. Go to R2 dashboard
2. Click **Manage R2 API Tokens**
3. Click **Create API Token**
4. Give it a name and permissions (read/write)
5. Save the Access Key ID and Secret Access Key securely

## Step 9: Test CDN Access

After uploading, test that your CDN is working:

1. Open a browser
2. Navigate to: `https://cdn.13daystories.com/trecena-aj/data.json`
3. You should see the JSON content
4. Test an image: `https://cdn.13daystories.com/trecena-aj/1/horoscope.webp`
5. Check browser DevTools → Network tab to verify cache headers

## Step 10: Verify Cache Headers

1. Open browser DevTools (F12)
2. Go to Network tab
3. Load a CDN URL
4. Check the Response Headers:
   - Images should have: `Cache-Control: public, max-age=22464000` (or similar)
   - JSON should have: `Cache-Control: public, max-age=86400` (or similar)

## Troubleshooting

### Domain Not Resolving

- Wait a few minutes for DNS propagation
- Check DNS records in Cloudflare dashboard
- Verify CNAME record is correct
- Try `dig cdn.13daystories.com` or `nslookup cdn.13daystories.com`

### 404 Errors

- Verify files are uploaded to R2 bucket
- Check file paths match exactly (case-sensitive)
- Ensure public access is enabled on bucket

### Cache Not Working

- Verify Cache Rules are created and deployed
- Check that files are being served through Cloudflare (not direct R2)
- Clear browser cache and test again

### CORS Issues

- R2 should handle CORS automatically when using custom domain
- If issues persist, check bucket CORS settings

## Cache Purging

When you need to update assets immediately:

### Via Dashboard

1. Go to **Caching** → **Configuration** in Cloudflare dashboard
2. Click **Purge Cache**
3. Select **Purge Everything** or **Custom Purge**
4. For custom purge, enter specific URLs:
   - `https://cdn.13daystories.com/trecena-aj/data.json`
   - Or use wildcards: `https://cdn.13daystories.com/trecena-aj/*`

### Via API

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://cdn.13daystories.com/trecena-aj/data.json"]}'
```

Get your Zone ID from Cloudflare dashboard → Overview → Zone ID

## Cost Estimate

With Cloudflare R2 free tier and typical usage:
- **Storage**: First 10 GB free, then $0.015/GB/month
- **Class A operations** (writes): First 1M free/month, then $4.50/M
- **Class B operations** (reads): First 10M free/month, then $0.36/M
- **Egress**: FREE (unlike AWS S3)

For your use case (static assets, mostly reads):
- **Estimated cost**: $0-1/month (likely free)

## Security Notes

- Your bucket is intentionally public (for CDN)
- Assets are meant to be publicly accessible
- Cloudflare provides DDoS protection automatically
- No authentication needed for read access

## Next Steps

After R2 is set up:
1. Upload all assets from `/cdn` folder
2. Test CDN URLs in your app
3. Update your app code to use CDN (already done in code changes)
4. Deploy and test

## Support Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Custom Domains Guide](https://developers.cloudflare.com/r2/buckets/custom-domains/)
- [Cloudflare Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/)

