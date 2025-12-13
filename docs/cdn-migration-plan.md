# CDN Migration Plan: Cloudflare R2 Integration

## Overview

This document outlines the plan to migrate asset hosting from Git/Vercel to Cloudflare R2, integrate custom domains, and optimize the deployment workflow.

## Goals

1. **Remove assets from Git** - Stop committing `/cdn` folder to repository
2. **Host assets on Cloudflare R2** - Serve via `cdn.13daystories.com`
3. **Domain routing** - Split deployments:
   - `13daystories.com` → Static download page (advertisement)
   - `app.meowtin.com` → Full web app (for testing)
   - `cdn.13daystories.com` → Assets (images & JSON)
4. **Single repo, multiple Vercel projects** - One GitHub repo, auto-detection based on domain
5. **Optimized caching** - 260 days for images, 1 day for JSON

## Current Architecture

### Asset Structure

- **Local dev**: `/cdn/trecena-{name}/{day}/{image}.webp` (symlinked to `public/cdn/`)
- **Production**: Currently served from `app.meowtin.com/assets/api/...`
- **Generate script**: Creates assets in `/assets/api/` (to be changed to `/cdn/`)

### URL Structure Decision

**Recommended**: Use root-level paths (no prefix)

- `cdn.13daystories.com/trecena-{name}/{day}/{image}.webp`
- `cdn.13daystories.com/trecena-{name}/data.json`

**Alternative** (if you prefer a prefix):

- `cdn.13daystories.com/t/trecena-{name}/{day}/{image}.webp`

We'll use the root-level approach for simplicity. The domain itself (`cdn.`) already indicates it's a CDN.

## Domain Routing Strategy

### Vercel Projects Setup

**Option 1: Two Separate Vercel Projects (Recommended)**

- **Project 1**: `13daystories.com`
  - Domain: `13daystories.com`
  - Build: Always serves download page (`vercel/index.html`)
  - Environment variable: `VERCEL_DOMAIN=13daystories.com`
- **Project 2**: `app.meowtin.com`
  - Domain: `app.meowtin.com`
  - Build: Full app build
  - Environment variable: `VERCEL_DOMAIN=app.meowtin.com`

**Option 2: Single Project with Conditional Logic**

- One Vercel project
- Build script detects domain from `VERCEL_URL` environment variable
- Conditionally serves download page or full app

**We'll use Option 1** for cleaner separation and easier management.

### Build Detection

The build script (`scripts/vercel-build.js`) will:

1. Check `VERCEL_URL` or `VERCEL_DOMAIN` environment variable
2. If domain is `13daystories.com` → Copy download page, skip app build
3. If domain is `app.meowtin.com` → Build full app
4. Never include `/cdn` folder in Vercel builds (it's gitignored)

## Caching Strategy

### Image Caching

- **Cache duration**: 260 days (22,464,000 seconds)
- **Rationale**: Images repeat every 260 days in the Mayan calendar cycle
- **Cache-Control header**: `public, max-age=22464000`
- **File types**: `.webp`, `.jpg`

### JSON Caching

- **Cache duration**: 1 day (86,400 seconds)
- **Rationale**: JSON data may change frequently, but you want some caching
- **Cache-Control header**: `public, max-age=86400`
- **File type**: `data.json`

### Cache Invalidation

- **Manual purge**: Use Cloudflare dashboard or API to purge cache
- **No versioning needed**: Since you'll eventually bundle JSON in the app, we don't need URL versioning
- **Immediate updates**: Purge specific files or entire cache when needed

## File Structure Changes

### Before

```
/assets/api/trecena-{name}/
  ├── data.json
  └── {day}/
      ├── {image}.webp
      └── {image}.jpg
```

### After

```
/cdn/trecena-{name}/          # Gitignored, local only
  ├── data.json
  └── {day}/
      ├── {image}.webp
      └── {image}.jpg
```

## Code Changes Required

### 1. Folder Rename

- Move `/assets/api/` → `/cdn/`
- Update all references in code

### 2. `utils/apiConfig.js`

- Remove `/assets/api` path prefix
- Use `cdn.13daystories.com` as CDN domain
- URLs: `cdn.13daystories.com/trecena-{name}/{day}/{image}.webp`

### 3. `scripts/generate-data.js`

- Change `API_DIR` from `assets/api` to `cdn`
- Update all path references

### 4. `package.json`

- Update `dev` script symlink: `public/cdn` → `../../cdn`

### 5. `metro.config.js`

- Update middleware to serve from `/cdn/` instead of `/assets/api/`

### 6. `scripts/vercel-build.js`

- Remove logic that copies `assets/api` to dist
- Add domain detection for conditional builds
- Never include `/cdn` in builds

### 7. `.gitignore`

- Add `/cdn/` to ignore list

### 8. `vercel.json`

- Remove `/assets/api/` headers/rewrites (no longer needed)

## Cloudflare R2 Setup Steps

### 1. Create R2 Bucket

1. Log in to Cloudflare dashboard
2. Navigate to **R2** in sidebar
3. Click **Create bucket**
4. Name: `13daystories-assets`
5. Choose location (recommend closest to users)
6. Click **Create bucket**

### 2. Configure Custom Domain

1. In bucket settings, go to **Settings** tab
2. Scroll to **Custom Domains** section
3. Click **Connect Domain**
4. Enter: `cdn.13daystories.com`
5. Cloudflare will provide DNS instructions

### 3. DNS Configuration

1. Go to your domain registrar (where `13daystories.com` is registered)
2. Add CNAME record:
   - **Name**: `cdn`
   - **Value**: (provided by Cloudflare, typically something like `r2.dev` or custom domain endpoint)
   - **TTL**: 3600 (or auto)

**Note**: If your domain is already on Cloudflare DNS, the CNAME will be added automatically.

### 4. Enable Public Access

1. In R2 bucket, go to **Settings**
2. Under **Public Access**, enable **Allow Access**
3. This makes the bucket publicly readable

### 5. Configure Cache Rules (Optional)

1. In Cloudflare dashboard, go to **Rules** → **Cache Rules**
2. Create rule for `cdn.13daystories.com/*.webp` and `*.jpg`:
   - Cache duration: 260 days
3. Create rule for `cdn.13daystories.com/*.json`:
   - Cache duration: 1 day

### 6. Upload Assets

1. Use Cloudflare dashboard upload, or
2. Use R2 API/SDK, or
3. Use `r2` CLI tool (if available)

**Folder structure in R2**:

```
trecena-aj/
  ├── data.json
  └── 1/
      ├── horoscope.webp
      ├── horoscope.jpg
      └── ...
trecena-ajmaq/
  ...
```

## Migration Steps

### Phase 1: Code Changes (Local)

1. ✅ Rename `/assets/api/` → `/cdn/`
2. ✅ Update all code references
3. ✅ Update `.gitignore`
4. ✅ Test local dev mode

### Phase 2: Cloudflare Setup

1. ✅ Create R2 bucket
2. ✅ Configure custom domain
3. ✅ Set up DNS
4. ✅ Upload all assets to R2
5. ✅ Test CDN access

### Phase 3: Vercel Configuration

1. ✅ Create/configure `13daystories.com` project
2. ✅ Create/configure `app.meowtin.com` project
3. ✅ Update build scripts
4. ✅ Test both deployments

### Phase 4: Testing

1. ✅ Test `13daystories.com` → download page
2. ✅ Test `app.meowtin.com` → full app with CDN assets
3. ✅ Test local dev → local assets
4. ✅ Verify caching headers
5. ✅ Test cache purging

### Phase 5: Cleanup

1. ✅ Remove `/cdn/` from Git (if it was committed)
2. ✅ Update documentation
3. ✅ Monitor CDN usage/performance

## Testing Checklist

- [ ] Local dev mode works with symlinked `/cdn`
- [ ] CDN serves images correctly
- [ ] CDN serves JSON correctly
- [ ] App loads assets from CDN in production
- [ ] `13daystories.com` shows download page
- [ ] `app.meowtin.com` shows full app
- [ ] Cache headers are correct (260 days for images, 1 day for JSON)
- [ ] Cache purging works when needed
- [ ] No 404 errors for assets

## Maintenance

### Uploading New Assets

1. Run `npm run generate:data` locally (creates files in `/cdn/`)
2. Upload to R2 bucket (maintain folder structure)
3. Purge cache if needed (Cloudflare dashboard)

### Updating JSON Files

1. Update database
2. Run `npm run generate:data`
3. Upload new `data.json` files to R2
4. Purge JSON cache (1 day cache will expire naturally, or purge manually)

### Cache Purging

1. **Via Dashboard**: Cloudflare → Caching → Purge Cache
2. **Via API**: Use Cloudflare API to purge specific URLs
3. **Selective purge**: Purge only changed files, not entire cache

## Cost Considerations

### Cloudflare R2

- **Storage**: $0.015 per GB/month
- **Class A operations** (writes): $4.50 per million
- **Class B operations** (reads): $0.36 per million
- **Egress**: FREE (unlike S3)

### Estimated Costs

- Storage: ~1-2 GB of images → $0.015-0.03/month
- Operations: Minimal for static assets
- **Total**: Likely under $1/month

## Security Considerations

1. **Public bucket**: Assets are intentionally public
2. **CORS**: Already configured in code (`Access-Control-Allow-Origin: *`)
3. **No authentication needed**: Assets are meant to be publicly accessible
4. **Rate limiting**: Cloudflare automatically provides DDoS protection

## Rollback Plan

If issues arise:

1. Assets remain in Git history (if not yet removed)
2. Can temporarily revert `apiConfig.js` to use `app.meowtin.com/assets/api`
3. Vercel still has old deployments available
4. R2 bucket can be made private if needed

## Timeline Estimate

- **Code changes**: 1-2 hours
- **Cloudflare setup**: 1-2 hours
- **Testing**: 1-2 hours
- **Total**: 3-6 hours

## Next Steps

1. Review and approve this plan
2. Implement code changes
3. Set up Cloudflare R2
4. Test thoroughly
5. Deploy to production
