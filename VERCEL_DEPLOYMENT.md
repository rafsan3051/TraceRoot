# Vercel Deployment Guide for TraceRoot

## Required Environment Variables

Set these in your Vercel Project Settings → Environment Variables:

### Essential (Required)
```bash
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret_at_least_32_chars
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Blockchain (Set to false if not using)
```bash
USE_REAL_BLOCKCHAIN=false
BLOCKCHAIN_NETWORK=hyperledger
```

### Optional (Only if using these features)
```bash
# Hyperledger Fabric (if USE_REAL_BLOCKCHAIN=true)
HYPERLEDGER_CHANNEL_NAME=tracerootchannel
HYPERLEDGER_CHAINCODE_NAME=traceroot

# IPFS (if using)
IPFS_API_KEY=your_key
IPFS_API_SECRET=your_secret

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-app-password
```

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables listed above
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**
   - Vercel will auto-deploy on push to main branch
   - Or manually trigger from Vercel dashboard

## Troubleshooting Blank Page

If you see a blank page:

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Check CSS generation**:
   - Ensure `app/globals.css` exists
   - Ensure `tailwind.config.js` is present
   - Ensure `postcss.config.js` is present

4. **Check browser console** for errors (F12 → Console tab)

5. **Verify MongoDB connection**:
   - Test DATABASE_URL connection string
   - Ensure IP whitelist includes Vercel IPs (0.0.0.0/0 for testing)

## Quick Fix Commands

If deployment fails, try:

```bash
# Clean and rebuild locally first
rm -rf .next node_modules
npm install
npm run build
npm start

# If successful locally, commit and push
git add .
git commit -m "Clean build"
git push origin main
```

## Common Issues

### Issue: "Module not found: Can't resolve 'tailwind-merge'"
**Fix**: Already fixed - `tailwind-merge` added to package.json

### Issue: "Prisma errors in CI/CD"
**Fix**: Already fixed - removed Prisma from CI/CD pipeline

### Issue: CSS not loading
**Fix**: Already fixed - removed unsupported PostCSS directives

### Issue: 500 errors on API routes
**Fix**: Verify DATABASE_URL and JWT_SECRET environment variables

## Support

For deployment issues:
- Check Vercel logs: https://vercel.com/dashboard
- Check GitHub Actions: https://github.com/your-repo/actions
