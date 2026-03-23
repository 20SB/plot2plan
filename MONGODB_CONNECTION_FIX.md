# 🔧 MongoDB Connection Issue - Fix Render Environment Variables

## ❌ Problem Identified

**Error:** Backend returns `404 Not Found` for `/api/v1/auth/register`

**Root Cause:** Auth routes don't exist because MongoDB connection failed during startup. Modules that depend on MongoDB won't initialize if the database connection fails.

**Evidence:**
1. Backend logs show: `🔐 CORS enabled for ALL origins` ✅
2. Backend logs show: `AppController {/api/v1}` ✅  
3. Backend logs DON'T show: `AuthController {/api/v1/auth}` ❌
4. Direct POST to `/api/v1/auth/register` returns: `404 Not Found` ❌

---

## ✅ Solution: Verify Render Environment Variables

### **Step 1: Check Render Environment Variables** (2 min)

1. Go to: https://dashboard.render.com
2. Click on your service: **`plot2plan-backend`**
3. Click **"Environment"** tab (left sidebar)
4. Verify these variables exist:

| Variable | Should Be | Status |
|----------|-----------|--------|
| `NODE_ENV` | `production` | Auto (from render.yaml) |
| `PORT` | `10000` | Auto (from render.yaml) |
| `MONGODB_URI` | `mongodb+srv://sbdbu:...` | ⚠️ **CHECK THIS** |
| `JWT_SECRET` | Auto-generated | Auto (from render.yaml) |
| `CORS_ORIGINS` | (not needed now) | Can remove |

---

### **Step 2: Fix MONGODB_URI** (1 min)

**MONGODB_URI should be:**
```
mongodb+srv://sbdbu:bvhk3kJSgnTnelyy@sb.calnbgq.mongodb.net/plot2plan
```

**If it's missing or wrong:**

1. In Render Environment tab, find `MONGODB_URI`
2. If missing: Click **"Add Environment Variable"**
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://sbdbu:bvhk3kJSgnTnelyy@sb.calnbgq.mongodb.net/plot2plan`
3. If wrong: Click **"Edit"** (pencil icon)
   - Update value to correct URI above
4. Click **"Save Changes"**

---

### **Step 3: Trigger Manual Deploy** (1 min)

After updating environment variables:

1. Render will ask: **"Deploy with new environment variables?"**
2. Click **"Manual Deploy"**
3. Wait 3-5 minutes for deployment

---

## 🧪 Diagnostic: Check Health Endpoint

After the new deployment (commit: 37915e7), you can check if MongoDB is configured:

```bash
curl https://plot2plan-backend.onrender.com/ | jq
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Plot2Plan API is running",
  "timestamp": "2026-03-23T...",
  "version": "1.0.0",
  "environment": "production",
  "mongodbConfigured": true,   ← Should be TRUE
  "jwtConfigured": true,        ← Should be TRUE
  "port": 10000
}
```

**If `mongodbConfigured: false`:**
- ❌ MONGODB_URI is NOT set in Render
- ✅ Follow Step 2 above to add it

---

## 🔍 Check Render Logs (Detailed)

After deployment, check logs for:

### **✅ Good Signs:**
```
📝 MongoDB URI: Set
📝 JWT Secret: Set
📝 Port: 10000
🔐 CORS enabled for ALL origins with credentials
[RoutesResolver] AppController {/api/v1}
[RoutesResolver] AuthController {/api/v1/auth}      ← THIS SHOULD APPEAR
[RoutesResolver] UsersController {/api/v1/users}
[RoutesResolver] ProjectsController {/api/v1/projects}
🚀 Application is running on: http://localhost:10000/api/v1
🔑 Auth endpoint: http://localhost:10000/api/v1/auth/register
```

### **❌ Bad Signs:**
```
📝 MongoDB URI: MISSING                              ← Problem!
[RoutesResolver] AppController {/api/v1}            ← Only this, nothing else
❌ Failed to start application: MongooseError...    ← Connection failed
```

---

## 📊 MongoDB Atlas: Allow Render IPs

If `MONGODB_URI` is set correctly but connection still fails:

### **Option 1: Allow All IPs (Quick)**

1. Go to: https://cloud.mongodb.com
2. Click your cluster: **`sb`**
3. Click **"Network Access"** (left sidebar)
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"**
6. Confirm: `0.0.0.0/0` (allows all)
7. Click **"Confirm"**

### **Option 2: Add Render's Static IPs (Secure)**

Render's outbound IPs (check their docs for latest):
```
44.225.XXX.XXX
44.242.XXX.XXX
```

1. Get Render's IPs from: https://render.com/docs/static-outbound-ip-addresses
2. Add each IP in MongoDB Atlas → Network Access

---

## 🔄 Full Restart Checklist

If still not working after environment variable fix:

1. ✅ MONGODB_URI set in Render
2. ✅ MongoDB Atlas allows `0.0.0.0/0` (or Render IPs)
3. ✅ Render service redeployed (green "Live" status)
4. ✅ Health endpoint shows `mongodbConfigured: true`
5. ✅ Logs show: `[RoutesResolver] AuthController {/api/v1/auth}`
6. ✅ Test auth endpoint: `curl -X POST https://plot2plan-backend.onrender.com/api/v1/auth/register`

---

## 🧪 Test After Fix

### **1. Health Check:**
```bash
curl https://plot2plan-backend.onrender.com/
```

Should show: `"mongodbConfigured": true`

---

### **2. Auth Endpoint:**
```bash
curl -X POST https://plot2plan-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@plot2plan.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

**Expected:** JSON response with user data and JWT token

**NOT:** `404 Not Found`

---

### **3. From Frontend:**

1. Go to: https://plot2plan.vercel.app/register
2. Fill in form
3. Submit

**Expected:**
- ✅ No CORS errors
- ✅ No 404 errors
- ✅ Redirect to dashboard
- ✅ User logged in

---

## 📝 Common Issues

### **Issue 1: Wrong MongoDB URI Format**

❌ Wrong:
```
mongodb://sbdbu:password@sb.calnbgq.mongodb.net/plot2plan
```

✅ Correct:
```
mongodb+srv://sbdbu:bvhk3kJSgnTnelyy@sb.calnbgq.mongodb.net/plot2plan
```

**Note:** Use `mongodb+srv://` (with SRV), not `mongodb://`

---

### **Issue 2: Password Special Characters**

If password has special characters, URL-encode them:
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`

Your password: `bvhk3kJSgnTnelyy` (no special chars, OK as-is)

---

### **Issue 3: Wrong Database Name**

Ensure URI ends with: `/plot2plan` (database name)

Full URI structure:
```
mongodb+srv://username:password@cluster.mongodb.net/database
             └──────┬──────┘ └────┬────┘ └───┬──┘ └───┬──┘ └───┬──┘
                  user       password   cluster      TLD    DB name
```

---

## ⏱️ Timeline

```
Now         → Check Render environment variables
+1 min      → Add/fix MONGODB_URI
+1 min      → Trigger manual deploy
+5 min      → Backend deployed ✅
+6 min      → Test health endpoint
+7 min      → Test auth endpoint
+8 min      → Test from frontend
+10 min     → FULL APP WORKING 🎉
```

---

## 🆘 If Still Not Working

Send me:

1. **Screenshot of Render Environment tab** (hide sensitive values)
2. **Render logs** (full output from latest deployment)
3. **Health check response:**
   ```bash
   curl https://plot2plan-backend.onrender.com/ | jq
   ```
4. **Auth endpoint response:**
   ```bash
   curl -X POST https://plot2plan-backend.onrender.com/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"Test123","name":"Test"}'
   ```

---

## 📁 Files Changed (Commit: 37915e7)

- `backend/src/main.ts` - Added diagnostic logging
- `backend/src/app.controller.ts` - Added environment check in health endpoint

**Purpose:** Debug why MongoDB isn't connecting

---

**Current Status:** 🟡 Waiting for Render redeploy (ETA: 5 min)

**Next Action:** Check Render environment variables in dashboard
