# 🚀 Quick Deploy Instructions

**Get Plot2Plan live in 15 minutes!**

---

## ✅ **What's Already Done**

- ✅ Vercel configuration (`vercel.json`)
- ✅ GitHub Actions CI/CD (`.github/workflows/deploy.yml`)
- ✅ Production build optimized
- ✅ Security headers configured
- ✅ SEO files ready

---

## 📋 **What I Need From You**

### 1. Vercel Auth Token
```
Go to: https://vercel.com/account/tokens
Create token named: plot2plan-deployment
Copy and share the token
```

### 2. After Deploying (Get These for CI/CD)
```
Vercel Org ID: (from Vercel Settings → General)
Vercel Project ID: (from Vercel Settings → General)
```

---

## 🚀 **Option 1: I Deploy for You (Easiest)**

**Just provide:**
1. Vercel Auth Token

**I will:**
1. Deploy using Vercel CLI
2. Configure everything
3. Give you the live URL

---

## 🚀 **Option 2: You Deploy via Dashboard (15 min)**

### Step 1: Import to Vercel
```
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select: 20SB/plot2plan
4. Click "Import"
```

### Step 2: Configure
```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install

Environment Variables:
Key: NEXT_PUBLIC_API_URL
Value: http://localhost:3001/api/v1
(Update later when backend is deployed)
```

### Step 3: Deploy
```
Click "Deploy"
Wait 2-3 minutes
Done! 🎉
```

### Step 4: Enable CI/CD
```
Go to GitHub:
https://github.com/20SB/plot2plan/settings/secrets/actions

Add 3 secrets:
1. VERCEL_TOKEN = <your-vercel-token>
2. VERCEL_ORG_ID = <from-vercel-settings>
3. VERCEL_PROJECT_ID = <from-vercel-settings>

Now every push to main will auto-deploy!
```

---

## 📊 **What Happens After Deployment**

### Automatic:
- ✅ Site live at: `https://plot2plan.vercel.app`
- ✅ HTTPS enabled automatically
- ✅ Global CDN distribution
- ✅ Auto-deploy on every push to main
- ✅ Preview deployments for PRs

### You Get:
- ✅ Live URL to share
- ✅ Free hosting (100GB bandwidth/month)
- ✅ Automatic builds
- ✅ Zero downtime deployments
- ✅ Performance analytics

---

## 🔄 **CI/CD Flow**

```
Push code to GitHub main branch
         ↓
GitHub Actions runs
         ↓
1. Install dependencies
2. Lint code
3. Build project
4. (Tests - currently disabled)
         ↓
    All steps pass?
         ↓
Deploy to Vercel Production
         ↓
Site updated at plot2plan.vercel.app
```

---

## ⚠️ **Important Notes**

### Backend Not Deployed Yet
- Registration/Login won't work until backend is deployed
- You can still view the entire UI
- All static pages work perfectly

### To Deploy Backend Later:
- Use Render.com (free)
- Or Railway.app (free)
- Or Vercel Serverless Functions
- Takes 10 minutes

---

## 🎯 **What Do You Want to Do?**

**Option A:** Give me Vercel token, I'll deploy everything  
**Option B:** You deploy via Vercel dashboard (I'll guide)  
**Option C:** Deploy backend first, then frontend

**Just tell me which option and provide the Vercel token!**

---

## 📞 **Quick Help**

**Create Vercel Account:**
https://vercel.com/signup (Use GitHub login)

**Get Vercel Token:**
https://vercel.com/account/tokens

**GitHub Repo:**
https://github.com/20SB/plot2plan

---

## ✅ **Ready?**

1. Get your Vercel auth token
2. Share it with me
3. I'll handle the rest!

OR

1. Import project to Vercel
2. Share the Org ID and Project ID
3. I'll set up CI/CD

**Let's get Plot2Plan live!** 🚀
