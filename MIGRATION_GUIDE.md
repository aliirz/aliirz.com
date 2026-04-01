# Migrating from Digital Ocean to GitHub Pages

## Overview
This guide helps you migrate your Jekyll site from Digital Ocean to GitHub Pages with automated deployments via GitHub Actions.

## What's Changed

### 1. GitHub Actions Workflow (`.github/workflows/jekyll-gh-pages.yml`)
- Automatically builds and deploys your site on every push to `main` or `master`
- No more manual deployment scripts needed

### 2. CNAME File
- Added `CNAME` file with your custom domain `aliirz.com`
- GitHub Pages will use this to configure the custom domain

### 3. Updated Gemfile
- Ensured compatibility with latest Jekyll and GitHub Pages

## Setup Instructions

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main  # or master
```

### Step 2: Configure GitHub Repository Settings

1. Go to your repository on GitHub: `https://github.com/aliirz/aliirz.com`
2. Navigate to **Settings** → **Pages** (in the left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Under "Custom domain":
   - Enter: `aliirz.com`
   - Click "Save"
   - ✓ Check "Enforce HTTPS" (recommended)

### Step 3: Update DNS Records (Digital Ocean → GitHub Pages)

You need to point your domain from Digital Ocean to GitHub Pages. Update your DNS records at your domain registrar:

#### For Apex Domain (aliirz.com):
Create the following **A records**:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

#### For WWW Subdomain (www.aliirz.com):
Create a **CNAME record**:
```
aliirz.github.io
```

Or use an **ALIAS/ANAME** record if your DNS provider supports it:
```
aliirz.github.io
```

### Step 4: Verify SSL Certificate

After DNS propagation (can take up to 24 hours):
1. GitHub will automatically provision an SSL certificate
2. Check the "Pages" settings for certificate status
3. Once active, your site will be available at `https://aliirz.com`

### Step 5: Cleanup (After Migration is Verified)

Once your site is working on GitHub Pages:

1. **Cancel Digital Ocean hosting** to stop billing
2. **Remove the old deployment script**:
   ```bash
   rm push_ghpages.sh
   rm -rf _site_ghpages
   ```
3. **Update this migration guide** or remove it

## Troubleshooting

### DNS Not Propagating
- Use `dig aliirz.com` or `nslookup aliirz.com` to check DNS records
- DNS changes can take 24-48 hours to propagate globally

### Build Failures
- Check the **Actions** tab in your GitHub repository for build logs
- Common issues:
  - Plugin compatibility
  - Syntax errors in markdown files

### Custom Domain Issues
- Ensure the `CNAME` file exists in the repository root
- Verify the domain is entered correctly in GitHub Pages settings
- Check that DNS records point to the correct GitHub Pages IPs

### Mixed Content Warnings
- Update `_config.yml` to use `https://` URLs
- Check that all assets use relative paths or HTTPS

## Benefits of GitHub Pages

✅ **Free hosting** - No more server costs  
✅ **Automatic HTTPS** - SSL certificates included  
✅ **CI/CD built-in** - Deploy on every push  
✅ **Global CDN** - Fast loading worldwide  
✅ **Version controlled** - Your site is backed by Git  
✅ **Zero maintenance** - No server updates needed  

## Rollback Plan

If something goes wrong:
1. Revert the DNS changes back to Digital Ocean IPs
2. Your old server should still work if you haven't deleted it yet
3. Make changes and try again

---

**Questions?** Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
