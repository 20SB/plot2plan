# 🚀 Deployment Guide - Plot2Plan

Complete guide for deploying Plot2Plan to production.

---

## 📋 **Prerequisites**

- ✅ GitHub account with `plot2plan` repository
- ✅ Vercel account (free tier)
- ✅ MongoDB Atlas account (for backend database)
- ✅ Node.js 18+ installed locally

---

## 🎯 **Deployment Strategy**

### Frontend (Vercel)
- **Platform:** Vercel (Free Plan)
- **Framework:** Next.js 14
- **Region:** US East (iad1)
- **Build Time:** ~2-3 minutes
- **Deployment:** Auto-deploy from GitHub

### Backend (Options)
**Option A:** Render.com (Free Plan) - Recommended
**Option B:** Railway.app (Free Plan)
**Option C:** Vercel Serverless Functions (Advanced)

---

## 🔧 **Step 1: Setup Vercel Account**

### 1.1 Create Vercel Account
```
1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Authorize Vercel to access your repositories
```

### 1.2 Get Vercel Credentials
```
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: plot2plan-deployment
4. Scope: Full Access
5. Copy the token (save it securely)
```

### 1.3 Get Vercel Project IDs
After importing the project (Step 2), you'll need:
- **Vercel Org ID:** Settings → General → Organization ID
- **Vercel Project ID:** Settings → General → Project ID

---

## 📦 **Step 2: Deploy Frontend to Vercel**

### Method 1: Vercel Dashboard (Easiest)

1. **Import Repository:**
   ```
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select "Import Git Repository"
   - Choose: 20SB/plot2plan
   - Click "Import"
   ```

2. **Configure Project:**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Environment Variables:**
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://your-backend-url.com/api/v1
   
   (For now, use: http://localhost:3001/api/v1)
   ```

4. **Deploy:**
   ```
   Click "Deploy"
   Wait 2-3 minutes
   Your site will be live at: https://plot2plan.vercel.app
   ```

### Method 2: Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: plot2plan
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## 🔐 **Step 3: Configure GitHub Secrets**

For CI/CD to work, add these secrets to GitHub:

1. **Go to GitHub Repository:**
   ```
   https://github.com/20SB/plot2plan/settings/secrets/actions
   ```

2. **Add Secrets:**
   ```
   Secret 1:
   Name: VERCEL_TOKEN
   Value: <your-vercel-auth-token>

   Secret 2:
   Name: VERCEL_ORG_ID
   Value: <your-vercel-org-id>

   Secret 3:
   Name: VERCEL_PROJECT_ID
   Value: <your-vercel-project-id>
   ```

3. **Verify Secrets Added:**
   - You should see 3 secrets listed
   - Names should match exactly (case-sensitive)

---

## 🔄 **Step 4: Enable CI/CD**

CI/CD is already configured in `.github/workflows/deploy.yml`

### What Happens on Every Push:

```
1. Code pushed to main branch
   ↓
2. GitHub Actions triggered
   ↓
3. Run Tests:
   - Install dependencies
   - Lint code
   - Build project
   - (E2E tests - currently disabled)
   ↓
4. If Tests Pass:
   - Build for Vercel
   - Deploy to Production
   ↓
5. If Tests Fail:
   - Deployment blocked
   - Error notification
```

### First Deployment:
```bash
# Commit the workflow
git add .github/workflows/deploy.yml
git commit -m "feat: Add CI/CD pipeline"
git push origin main

# GitHub Actions will automatically deploy
```

---

## 📊 **Step 5: Monitor Deployment**

### View Deployment Status:
```
1. Go to: https://github.com/20SB/plot2plan/actions
2. Click on latest workflow run
3. See real-time logs
4. Check for errors
```

### View Vercel Deployment:
```
1. Go to: https://vercel.com/dashboard
2. Click on "plot2plan" project
3. See deployment history
4. View live site
```

---

## 🔧 **Environment Variables**

### Frontend (.env.local for local development)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Frontend (Vercel Production)
Add in Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api/v1
```

### Backend (When Deploying)
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/plot2plan
JWT_SECRET=your-super-secure-secret-key-minimum-32-characters
CORS_ORIGINS=https://plot2plan.vercel.app
```

---

## 🗄️ **Step 6: Setup MongoDB Atlas (For Backend)**

### 6.1 Create MongoDB Cluster
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Login
3. Create New Cluster
4. Choose: Free Tier (M0)
5. Region: Closest to your users
6. Cluster Name: plot2plan-cluster
7. Click "Create Cluster" (takes 3-5 minutes)
```

### 6.2 Create Database User
```
1. Security → Database Access
2. Add New Database User
3. Username: plot2plan-user
4. Password: <generate-strong-password>
5. Database User Privileges: Read and write to any database
6. Click "Add User"
```

### 6.3 Whitelist IP Addresses
```
1. Security → Network Access
2. Add IP Address
3. Choose: "Allow Access from Anywhere" (0.0.0.0/0)
4. Or add specific IPs for security
5. Click "Confirm"
```

### 6.4 Get Connection String
```
1. Database → Connect
2. Choose "Connect your application"
3. Driver: Node.js, Version: 4.1 or later
4. Copy connection string:
   mongodb+srv://plot2plan-user:<password>@cluster.mongodb.net/plot2plan?retryWrites=true&w=majority
5. Replace <password> with actual password
6. Add to backend environment variables
```

---

## 🚀 **Step 7: Deploy Backend (Optional - Render.com)**

### 7.1 Create Render Account
```
1. Go to https://render.com/
2. Sign up with GitHub
3. Authorize Render
```

### 7.2 Create Web Service
```
1. Dashboard → New → Web Service
2. Connect Repository: 20SB/plot2plan
3. Name: plot2plan-backend
4. Root Directory: backend
5. Environment: Node
6. Build Command: npm install
7. Start Command: npm run start:prod
8. Instance Type: Free
```

### 7.3 Add Environment Variables
```
NODE_ENV=production
PORT=3001
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-jwt-secret>
CORS_ORIGINS=https://plot2plan.vercel.app
```

### 7.4 Deploy
```
Click "Create Web Service"
Wait 3-5 minutes
Your backend will be live at: https://plot2plan-backend.onrender.com
```

### 7.5 Update Frontend Environment
```
Go to Vercel Dashboard
Settings → Environment Variables
Update NEXT_PUBLIC_API_URL to:
https://plot2plan-backend.onrender.com/api/v1
Redeploy frontend
```

---

## ✅ **Step 8: Verify Deployment**

### Checklist:
- [ ] Frontend deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] Environment variables set
- [ ] GitHub Actions workflow running
- [ ] No build errors
- [ ] Site accessible at URL
- [ ] SEO tags present (view source)
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] Responsive on mobile
- [ ] Backend API accessible (if deployed)

### Test Your Deployment:
```
1. Visit: https://your-app.vercel.app
2. Check homepage loads
3. Try registration (will fail without backend)
4. Check responsive design (mobile view)
5. View page source → verify SEO tags
6. Access: /robots.txt
7. Access: /sitemap.xml
```

---

## 🔍 **Troubleshooting**

### Build Failed on Vercel
```
Error: "Module not found"
Fix: Check package.json dependencies
     Run: npm install locally
     Commit: package-lock.json

Error: "Environment variable missing"
Fix: Add NEXT_PUBLIC_API_URL in Vercel settings
```

### GitHub Actions Failed
```
Error: "VERCEL_TOKEN not found"
Fix: Add secret in GitHub repo settings

Error: "Build failed"
Fix: Check logs in Actions tab
     Fix errors locally first
     Commit and push again
```

### Deployment Slow
```
Issue: Vercel build takes >5 minutes
Fix: Check for large dependencies
     Optimize images
     Remove unused packages
```

### API Calls Failing
```
Issue: CORS errors in console
Fix: Add Vercel URL to backend CORS_ORIGINS
     Update backend environment variables
     Restart backend service
```

---

## 🎨 **Custom Domain (Optional)**

### Add Custom Domain to Vercel:
```
1. Vercel Dashboard → Settings → Domains
2. Enter your domain: plot2plan.com
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)
5. SSL certificate auto-generated
```

---

## 💰 **Cost Breakdown**

### Free Tier Limits:

**Vercel (Frontend):**
- ✅ 100 GB bandwidth/month
- ✅ 100 deployments/day
- ✅ Unlimited team members
- ✅ Automatic HTTPS
- ✅ 6,000 build minutes/month

**MongoDB Atlas (Database):**
- ✅ 512 MB storage
- ✅ Shared CPU
- ✅ Perfect for testing

**Render (Backend - Optional):**
- ✅ 750 hours/month
- ✅ Auto-sleep after 15 min inactivity
- ✅ 100 GB bandwidth/month

**Total Monthly Cost: $0** (Free tier)

---

## 📈 **Performance Optimization**

### Vercel Edge Network:
- ✅ Global CDN enabled by default
- ✅ Automatic image optimization
- ✅ Gzip compression
- ✅ HTTP/2 support

### Next.js Optimizations:
- ✅ Static page generation
- ✅ Incremental static regeneration
- ✅ Automatic code splitting
- ✅ Font optimization

---

## 🔐 **Security Checklist**

- [x] HTTPS enabled (automatic on Vercel)
- [x] Security headers configured (vercel.json)
- [x] Environment variables secured
- [x] MongoDB connection string encrypted
- [ ] Rate limiting (add in backend)
- [ ] Input validation (already implemented)
- [x] CORS configured properly

---

## 📊 **Monitoring & Analytics**

### Vercel Analytics:
```
1. Vercel Dashboard → Analytics
2. View page views, performance
3. Monitor Web Vitals (LCP, FID, CLS)
```

### Add Google Analytics (Optional):
```
1. Create GA4 property
2. Add tracking code to layout.tsx
3. Deploy
```

---

## 🚀 **Going Live Checklist**

Before announcing your app:

- [ ] All environment variables set correctly
- [ ] Backend deployed and accessible
- [ ] Database connected and tested
- [ ] Registration/Login working
- [ ] SEO meta tags verified
- [ ] robots.txt and sitemap.xml accessible
- [ ] Mobile responsive tested
- [ ] Performance optimized (< 3s load)
- [ ] No console errors
- [ ] Custom domain configured (optional)
- [ ] Analytics set up
- [ ] Error monitoring enabled

---

## 🔄 **Continuous Deployment Flow**

```
Developer pushes code to GitHub
         ↓
GitHub Actions triggered
         ↓
Run automated tests
         ↓
    Tests Pass? ────No──→ Deployment blocked
         ↓
        Yes
         ↓
Build production bundle
         ↓
Deploy to Vercel Edge Network
         ↓
Deployment complete
         ↓
Site live at: plot2plan.vercel.app
```

---

## 📞 **Support & Resources**

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **GitHub Actions:** https://docs.github.com/en/actions

---

## 🎉 **You're Ready to Deploy!**

Follow the steps above to get Plot2Plan live on the internet.

**Estimated Time:** 30-45 minutes for full deployment

**Next Steps:**
1. Get Vercel token
2. Import project to Vercel
3. Add GitHub secrets
4. Push to trigger first deployment
5. Share your live URL!

---

_Last Updated: Deployment Infrastructure Setup_
