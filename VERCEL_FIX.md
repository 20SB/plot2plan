# 🔧 Fix Vercel Frontend Deployment

## ❌ Problem

Vercel is trying to build from the repository root, but `package.json` is in `frontend/` subdirectory.

**Error:**
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, 
open '/vercel/path0/package.json'
```

---

## ✅ Solution: Configure Root Directory in Vercel

### **Step 1: Go to Vercel Project Settings**

1. Open: https://vercel.com/dashboard
2. Click on your project: **`plot2plan`**
3. Click **"Settings"** tab (top menu)

---

### **Step 2: Update Root Directory**

1. In Settings, scroll down to **"Build & Development Settings"**
2. Find **"Root Directory"** section
3. Click **"Edit"** button
4. Enter: **`frontend`**
5. Click **"Save"**

**Screenshot reference:**
```
┌─────────────────────────────────────┐
│ Root Directory                      │
│ ┌─────────────────────────────────┐ │
│ │ frontend                        │ │ ← Enter this
│ └─────────────────────────────────┘ │
│ [Save]                              │
└─────────────────────────────────────┘
```

---

### **Step 3: Trigger Redeploy**

1. Go to **"Deployments"** tab
2. Click on the latest **failed deployment** (ab01ed4)
3. Click **"⋯"** (three dots menu)
4. Select **"Redeploy"**
5. Check **"Use existing Build Cache"** (optional)
6. Click **"Redeploy"**

**OR** just push any commit to GitHub (auto-redeploy).

---

## 🎯 Alternative: Quick Dummy Commit

If you prefer to trigger redeploy via Git push:

```bash
cd house-design-platform
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

Vercel will auto-deploy after you've set the Root Directory.

---

## ✅ Verify Settings

After saving Root Directory:

1. **Root Directory** should show: `frontend`
2. **Build Command** should be: `npm run build` (Next.js default)
3. **Output Directory** should be: `.next` (Next.js default)
4. **Install Command** should be: `npm install` (default)

**Framework Detection:**
Vercel should auto-detect **Next.js 14** and configure correctly.

---

## 🧪 Expected Result

After redeploy:

```bash
✅ Cloning completed
✅ Running "install" command: npm install...
✅ Installing dependencies from frontend/package.json
✅ Building Next.js application...
✅ Build completed successfully
✅ Deployment ready
```

**Deploy time:** ~3 minutes

---

## 📊 Verification Steps

Once deployed successfully:

1. **Visit:** https://plot2plan.vercel.app
2. **Check console:** Should see no errors
3. **Test registration:** Should work without CORS errors
4. **Check Network tab:** API calls should go to `https://plot2plan-backend.onrender.com`

---

## 🔍 Troubleshooting

### Issue: "Still getting package.json error"

**Fix:** Clear build cache and redeploy:
1. Deployments → Latest deployment → "⋯" menu
2. **"Redeploy"** → Uncheck "Use existing Build Cache"
3. Click "Redeploy"

---

### Issue: "Environment variables not found"

**Fix:** Add `.env.production` variables to Vercel:
1. Settings → **"Environment Variables"**
2. Add variable:
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://plot2plan-backend.onrender.com/api/v1
   Environment: Production
   ```
3. Save and redeploy

---

### Issue: "Wrong directory still being used"

**Fix:** Double-check Root Directory setting:
1. Settings → Build & Development Settings
2. Root Directory should be: **`frontend`** (not `./frontend` or `/frontend`)
3. Save
4. Force redeploy with cleared cache

---

## 🎯 Summary

**What to do:**
1. Go to Vercel → plot2plan → Settings
2. Set Root Directory to: `frontend`
3. Save
4. Redeploy

**Time:** 2 minutes to fix + 3 minutes to deploy = **5 minutes total**

**Status after fix:**
- ✅ Backend: Live on Render
- ✅ Frontend: Will be live on Vercel
- ✅ Full authentication working
- ✅ No CORS errors

---

## 📁 Project Structure Context

```
plot2plan/
├── backend/          ← NestJS API (deployed to Render)
│   ├── src/
│   ├── package.json
│   └── render.yaml
├── frontend/         ← Next.js app (deploy THIS to Vercel)
│   ├── src/
│   ├── package.json
│   └── .env.production
├── docs/
└── README.md
```

**Vercel needs to build from `frontend/` subdirectory, not root.**

---

**Next Steps:** Set Root Directory → Redeploy → Test → 🎉 Full app live!
