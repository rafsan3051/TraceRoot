# ✅ Vercel Deployment Checklist

## Root Cause: Missing Environment Variables

Your app builds successfully locally but shows a blank page on Vercel because **critical environment variables are missing**.

## 🔥 IMMEDIATE FIX

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your TraceRoot project
   - Click "Settings" → "Environment Variables"

2. **Add These 3 REQUIRED Variables**:

   ```
   Variable Name: DATABASE_URL
   Value: mongodb+srv://username:password@cluster.mongodb.net/traceroot?retryWrites=true&w=majority
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   ```
   Variable Name: JWT_SECRET  
   Value: your-secure-random-32-char-string-here
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   ```
   Variable Name: NEXT_PUBLIC_APP_URL
   Value: https://your-app-name.vercel.app
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

3. **Add This Optional Variable**:

   ```
   Variable Name: USE_REAL_BLOCKCHAIN
   Value: false
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   - OR push any commit to trigger auto-deploy

## 🔍 Why This Happens

- Next.js doesn't show detailed errors on production builds by default
- Missing `DATABASE_URL` causes MongoDB connection to fail silently
- Missing `JWT_SECRET` breaks authentication middleware
- App falls back to blank page when critical services fail

## 🧪 Verify Environment Variables Work

After setting env vars and redeploying:

1. Check Vercel deployment logs:
   - Deployments → Click on latest → View Function Logs
   - Look for any MongoDB connection errors

2. Test in browser:
   - Open https://your-app.vercel.app
   - Check browser console (F12 → Console)
   - Should see content, not blank page

3. Test API health:
   - Visit: https://your-app.vercel.app/api/auth/check
   - Should return JSON, not 500 error

## 🐛 Still Blank? Additional Checks

### Check 1: MongoDB Atlas IP Whitelist
- Go to MongoDB Atlas → Network Access
- Add `0.0.0.0/0` (allows all IPs, including Vercel)
- Or add specific Vercel IPs from their docs

### Check 2: Verify Build Logs
- Go to Vercel → Deployments → Latest
- Look for "Build Logs"
- Should show: "✓ Compiled successfully"

### Check 3: Check Function Logs
- Go to Vercel → Deployments → Latest → "Functions" tab
- Watch for runtime errors when you visit the site

### Check 4: Browser DevTools
- Open site in browser
- Press F12 → Console tab
- Look for JavaScript errors
- Press F12 → Network tab
- Look for failed API calls (red)

## 📝 MongoDB Atlas Setup

If you don't have DATABASE_URL yet:

1. Go to https://cloud.mongodb.com
2. Create free cluster (if not done)
3. Create database user:
   - Database Access → Add New User
   - Username: traceroot
   - Password: (generate secure one)
4. Whitelist IPs:
   - Network Access → Add IP
   - Add `0.0.0.0/0` for testing
5. Get connection string:
   - Clusters → Connect
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `traceroot`

Example:
```
mongodb+srv://traceroot:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/traceroot?retryWrites=true&w=majority
```

## 🔐 Generate JWT Secret

Run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or online: https://generate-secret.vercel.app/32

## ✅ All Issues Fixed

Your codebase now has:
- ✅ Fixed CI/CD pipeline (removed Prisma checks)
- ✅ Fixed CSS (removed unsupported PostCSS directives)
- ✅ Fixed hydration (deterministic date formatting)
- ✅ Fixed dependencies (added tailwind-merge)
- ✅ Fixed routing (proper useParams usage)

**The ONLY thing left is setting environment variables in Vercel.**

## 🚀 Final Command

After setting env vars in Vercel, commit and push:

```bash
cd "G:\VSCODE\trace-root"
git add .
git commit -m "chore: deployment fixes for Vercel"
git push origin main
```

Vercel will auto-deploy with the new environment variables.

## 📞 Need Help?

If still blank after all this:
1. Share the Vercel deployment URL
2. Share screenshot of Vercel Function Logs
3. Share screenshot of browser console (F12)
