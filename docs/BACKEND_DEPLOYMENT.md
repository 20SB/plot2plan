# 🔧 Backend Deployment Guide - Plot2Plan

Complete guide for deploying the NestJS backend API.

---

## ⚠️ **Important: Why Not Vercel for Backend?**

### **Vercel Limitations for NestJS:**

❌ **Serverless Functions Only**
- Vercel converts your app to serverless functions
- Each request spawns a new instance
- Cold starts = slow first requests (2-5 seconds)

❌ **Database Connection Issues**
- MongoDB connections don't persist
- Each request creates new connection
- Connection pool doesn't work
- Can hit MongoDB connection limits

❌ **Timeout Limits**
- Free tier: 10 second timeout
- Complex operations may fail
- File generation will timeout

❌ **Not NestJS Native**
- NestJS is designed for long-running processes
- Dependency injection works best with persistent instances
- Background jobs won't work

### **What Works Better:**

✅ **Render.com** (Recommended)
- Free tier with persistent instance
- Perfect for NestJS
- MongoDB connections work properly
- No cold starts after first request
- 750 hours/month free

✅ **Railway.app**
- $5 free credit/month
- Great for NestJS
- Persistent connections

✅ **Fly.io**
- Generous free tier
- Global deployment

---

## 🚀 **RECOMMENDED: Deploy to Render.com**

**Time:** 10 minutes  
**Cost:** $0 (Free tier)  
**Difficulty:** Easy

### **Step 1: Create Render Account**

```
1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render to access repositories
```

### **Step 2: Create Web Service**

```
1. Dashboard → "New +"
2. Select "Web Service"
3. Connect Repository: 20SB/plot2plan
4. Click "Connect"
```

### **Step 3: Configure Service**

```
Name: plot2plan-backend

Region: Oregon (US West) or closest to you

Branch: main

Root Directory: backend

Runtime: Node

Build Command: npm install && npm run build

Start Command: npm run start:prod

Instance Type: Free
```

### **Step 4: Add Environment Variables**

Click "Advanced" → "Add Environment Variable"

```
Variable 1:
Key: NODE_ENV
Value: production

Variable 2:
Key: PORT
Value: 3001

Variable 3:
Key: MONGODB_URI
Value: mongodb+srv://sbdbu:bvhk3kJSgnTnelyy@sb.calnbgq.mongodb.net/plot2plan

Variable 4:
Key: JWT_SECRET
Value: plot2plan-super-secure-jwt-secret-key-change-in-production-32chars

Variable 5:
Key: JWT_EXPIRATION
Value: 7d

Variable 6:
Key: CORS_ORIGINS
Value: https://plot2plan.vercel.app

Variable 7:
Key: API_PREFIX
Value: api/v1
```

### **Step 5: Deploy**

```
1. Click "Create Web Service"
2. Wait 3-5 minutes for build
3. Service will be live!
```

### **Step 6: Get Your Backend URL**

```
Your backend will be available at:
https://plot2plan-backend.onrender.com

API endpoint:
https://plot2plan-backend.onrender.com/api/v1
```

### **Step 7: Update Frontend**

```
1. Go to Vercel Dashboard
2. Select plot2plan project
3. Settings → Environment Variables
4. Edit NEXT_PUBLIC_API_URL
5. Change to: https://plot2plan-backend.onrender.com/api/v1
6. Save
7. Deployments → Redeploy (click ... → Redeploy)
```

### **Step 8: Test Your API**

```
Visit: https://plot2plan-backend.onrender.com/api/v1
You should see API response

Test registration:
1. Go to: https://plot2plan.vercel.app/register
2. Fill form and submit
3. Should create account and redirect to dashboard!
```

---

## 🔄 **Auto-Deploy from GitHub**

Render automatically deploys when you push to GitHub:

```
Push code → Render detects change → Auto builds → Auto deploys
```

**No configuration needed!**

---

## ⚡ **Render Free Tier Details**

### **What You Get:**
- ✅ 750 hours/month (31 days = 744 hours)
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Auto-deploy from GitHub
- ✅ Build minutes included

### **Limitations:**
- ⏸️ **Auto-sleep** after 15 minutes of inactivity
- 🐌 **First request** after sleep takes 30-60 seconds (cold start)
- 💾 **512 MB RAM** (enough for this app)

### **How Sleep Works:**
```
No requests for 15 min → Service sleeps
First request after sleep → Wakes up (30-60s delay)
Subsequent requests → Fast (no delay)
```

**Solutions for sleep:**
1. Use a free uptime monitor (UptimeRobot) to ping every 5 minutes
2. Upgrade to paid plan ($7/month) for always-on
3. Accept the cold start (fine for MVP/testing)

---

## 🆚 **Comparison: Render vs Vercel for Backend**

| Feature | Render | Vercel Serverless |
|---------|--------|-------------------|
| **NestJS Support** | ✅ Native | ⚠️ Requires adaptation |
| **MongoDB Connections** | ✅ Persistent | ❌ New each request |
| **Cold Starts** | ⏸️ After 15 min sleep | ❌ Every request (free tier) |
| **Timeout** | ✅ No limit | ❌ 10s (free tier) |
| **Background Jobs** | ✅ Works | ❌ Not supported |
| **WebSockets** | ✅ Supported | ❌ Not on free tier |
| **Cost** | 🆓 Free tier | 🆓 Free tier |
| **Setup Difficulty** | ✅ Easy | ⚠️ Complex |
| **Recommendation** | ✅ **Use This** | ❌ Not ideal |

---

## 🎯 **Alternative: Railway.app**

If Render doesn't work for any reason:

### **Deploy to Railway:**

```
1. Go to: https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select: 20SB/plot2plan
5. Select backend folder
6. Add environment variables (same as Render)
7. Deploy
8. Get URL
9. Update frontend env var
```

**Railway gives $5 credit/month** (enough for testing)

---

## 🛠️ **If You Still Want Vercel (Advanced)**

If you absolutely need Vercel:

### **Requirements:**
1. Convert to serverless functions
2. Refactor database connections
3. Use connection pooling
4. Optimize cold starts
5. Handle timeouts

**This is complex and not recommended.**

**Estimated time:** 2-3 hours of refactoring

---

## 🔍 **Troubleshooting Render Deployment**

### **Build Failed:**

**Error:** "Module not found"
```
Fix: Check package.json dependencies
     Run: npm install locally first
     Commit package-lock.json
```

**Error:** "Build command failed"
```
Fix: Verify build command: npm install && npm run build
     Check if TypeScript compiles locally
```

### **Service Fails to Start:**

**Error:** "Application failed to respond"
```
Fix: Check start command: npm run start:prod
     Verify PORT environment variable
     Check logs in Render dashboard
```

**Error:** "Cannot connect to MongoDB"
```
Fix: Verify MONGODB_URI is correct
     Check MongoDB Atlas IP whitelist (0.0.0.0/0)
     Verify database user credentials
```

### **CORS Errors:**

**Error:** "Access-Control-Allow-Origin"
```
Fix: Update CORS_ORIGINS environment variable
     Add: https://plot2plan.vercel.app
     Redeploy backend
```

---

## 📊 **Deployment Checklist**

### **Pre-Deployment:**
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] JWT_SECRET generated (32+ chars)

### **During Deployment:**
- [ ] Render account created
- [ ] Repository connected
- [ ] Build/start commands correct
- [ ] All environment variables added
- [ ] Service created and deploying

### **Post-Deployment:**
- [ ] Service shows "Live" status
- [ ] API responds at /api/v1
- [ ] Frontend env var updated
- [ ] Frontend redeployed
- [ ] Registration tested
- [ ] Login tested
- [ ] Dashboard accessible

---

## 🎯 **Quick Command Summary**

### **For Render Deployment:**

```bash
# No commands needed!
# Everything is done through the dashboard

# After deployment, test:
curl https://plot2plan-backend.onrender.com/api/v1

# Should return API info
```

### **Update Frontend Environment:**

```bash
# Vercel CLI (alternative to dashboard)
cd frontend
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://plot2plan-backend.onrender.com/api/v1

# Redeploy
vercel --prod
```

---

## 💡 **Best Practices**

### **Environment Variables:**
- ✅ Never commit .env files
- ✅ Use strong JWT secrets (32+ characters)
- ✅ Rotate secrets periodically
- ✅ Different secrets for dev/prod

### **MongoDB:**
- ✅ Use MongoDB Atlas (managed service)
- ✅ Enable authentication
- ✅ Whitelist only necessary IPs (or 0.0.0.0/0 for start)
- ✅ Regular backups

### **Monitoring:**
- ✅ Check Render logs regularly
- ✅ Set up uptime monitoring (UptimeRobot)
- ✅ Monitor MongoDB usage
- ✅ Track API response times

---

## 🚀 **Let's Deploy!**

### **Ready to deploy backend to Render?**

**I can guide you through each step, or:**

**Option 1:** You follow the guide above (10 minutes)

**Option 2:** Share screen and I'll walk you through it

**Option 3:** Give me Render API token and I'll deploy it

---

## 📞 **Need Help?**

If you encounter any issues:

1. **Check Render Logs:**
   - Dashboard → Your Service → Logs
   - Look for error messages

2. **Verify Environment Variables:**
   - Dashboard → Environment
   - Check all variables are set

3. **Test MongoDB Connection:**
   ```
   Use MongoDB Compass to verify connection string
   ```

4. **Ask me!** I'll help debug.

---

## ✅ **What You'll Have After This**

- ✅ Backend API live at: `https://plot2plan-backend.onrender.com`
- ✅ Full authentication working
- ✅ MongoDB connected
- ✅ Auto-deploy from GitHub
- ✅ Complete Plot2Plan stack running!

---

**Recommendation:** Deploy to Render.com  
**Time:** 10 minutes  
**Difficulty:** Easy  
**Cost:** $0

**Ready to deploy? Let me know if you need help with any step!**
