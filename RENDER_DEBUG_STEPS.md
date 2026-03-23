# 🔧 Render Backend Debug Steps

## ✅ Fixes Applied (Commit: c940436)

### 1. **Fixed Duplicate Index Warning**
- **File:** `backend/src/users/schemas/user.schema.ts`
- **Issue:** Email field had both `unique: true` (auto-index) and manual `schema.index()`
- **Fix:** Removed manual index definition

### 2. **Added Better Error Handling**
- **Files:** `backend/src/main.ts`, `backend/src/app.module.ts`, `backend/src/auth/auth.module.ts`
- **Added:**
  - Explicit env var validation for MONGODB_URI
  - Explicit env var validation for JWT_SECRET
  - Better console logging
  - Bind to `0.0.0.0` instead of localhost

### 3. **Enhanced Diagnostics**
- Added port binding logs
- Added startup success/failure logs
- Added configuration validation

---

## 🔍 What to Check After Deploy (5 min)

### Step 1: Check Render Logs (Most Important!)

Go to: https://dashboard.render.com → `plot2plan-backend` → **"Logs"** tab

**Look for these messages:**

#### ✅ **Good Signs:**
```
📝 MongoDB URI: Set
📝 JWT Secret: Set
📝 Port: 10000
✅ MongoDB URI configured, attempting connection...
✅ JWT configured successfully
🔐 CORS enabled for ALL origins with credentials
[RoutesResolver] AppController {/api/v1}
[RoutesResolver] AuthController {/api/v1/auth}        ← CRITICAL!
[RoutesResolver] UsersController {/api/v1/users}
[RoutesResolver] ProjectsController {/api/v1/projects}
🎯 Attempting to listen on port: 10000
🚀 Application is running on: http://0.0.0.0:10000/api/v1
```

#### ❌ **Bad Signs:**
```
📝 MongoDB URI: MISSING
📝 JWT Secret: MISSING
❌ MONGODB_URI is not configured!
❌ JWT_SECRET is not configured!
Error: MONGODB_URI environment variable is required
Error: JWT_SECRET environment variable is required
```

---

### Step 2: Verify Environment Variables in Render

Go to: https://dashboard.render.com → `plot2plan-backend` → **"Environment"** tab

**Must have these 3 variables:**

| Variable | Value | Status |
|----------|-------|--------|
| `MONGODB_URI` | `mongodb+srv://sbdbu:bvhk3kJSgnTnelyy@sb.calnbgq.mongodb.net/plot2plan` | ⚠️ **Check this!** |
| `JWT_SECRET` | Auto-generated (any random string) | Should auto-generate |
| `PORT` | `10000` | Auto (from render.yaml) |

**If MONGODB_URI or JWT_SECRET are missing:**
1. Click **"Add Environment Variable"**
2. Add missing variable(s)
3. Click **"Save Changes"**
4. Redeploy

---

### Step 3: Test Endpoints

After deployment completes (3-5 min):

#### **Test 1: Health Check**
```bash
curl https://plot2plan-backend.onrender.com/
```

**Expected:**
```json
{
  "status": "ok",
  "message": "Plot2Plan API is running",
  "mongodbConfigured": true,    ← Must be true
  "jwtConfigured": true,         ← Must be true
  "environment": "production",
  "port": 10000
}
```

**If you get "Not Found":** App isn't starting correctly. Check logs (Step 1).

---

#### **Test 2: Auth Registration**
```bash
curl -X POST https://plot2plan-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@plot2plan.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

**Expected:** JSON with user object and JWT token

**If you get 404:** Auth routes didn't load. Check logs for `[RoutesResolver] AuthController`

---

#### **Test 3: From Frontend**
1. Go to: https://plot2plan.vercel.app/register
2. Fill form and submit

**Expected:**
- ✅ No CORS errors
- ✅ No 404 errors
- ✅ Redirect to dashboard

---

## 🐛 Common Issues & Fixes

### Issue 1: "MONGODB_URI is not configured"

**Fix:**
1. Render → Environment → Add variable
2. Key: `MONGODB_URI`
3. Value: `mongodb+srv://sbdbu:bvhk3kJSgnTnelyy@sb.calnbgq.mongodb.net/plot2plan`
4. Save → Redeploy

---

### Issue 2: "JWT_SECRET is not configured"

**Fix:**
1. Render → Environment → Add variable
2. Key: `JWT_SECRET`
3. Value: Any random string (e.g., `supersecretkey123456789`)
4. Save → Redeploy

**Or:** Update `render.yaml` to auto-generate (already configured):
```yaml
- key: JWT_SECRET
  generateValue: true
```

---

### Issue 3: MongoDB Connection Timeout

**Fix:** Allow Render IPs in MongoDB Atlas:
1. Go to: https://cloud.mongodb.com
2. Network Access → Add IP Address
3. Enter: `0.0.0.0/0` (allow all)
4. Confirm

---

### Issue 4: Port Binding Error

**Fix:** Render automatically sets `PORT=10000`. Don't override it.

Verify in code:
```typescript
const port = configService.get<number>('PORT', 3001); // Uses env PORT
await app.listen(port, '0.0.0.0'); // Binds to all interfaces
```

---

### Issue 5: Routes Still Not Loading

**Possible causes:**
1. MongoDB connection failed (check logs)
2. JWT module failed to initialize (check logs)
3. Circular dependency in modules (rare)

**Debug:**
- Check full logs from start to finish
- Look for error stack traces
- Verify all environment variables are set

---

## 📊 Expected Timeline

```
Now         → Code pushed (commit c940436)
+2 min      → Render starts building
+5 min      → Build completes
+6 min      → App starts
+7 min      → Routes registered
+8 min      → Health check responds ✅
+9 min      → Test registration ✅
+10 min     → Frontend works ✅
```

---

## 🆘 If Still Not Working

**Send me:**

1. **Full Render logs** (from start of deployment)
   - Look for red error messages
   - Look for missing environment variables
   - Look for MongoDB connection errors

2. **Health endpoint response:**
   ```bash
   curl https://plot2plan-backend.onrender.com/
   ```

3. **Environment variables screenshot** (blur sensitive values)

4. **Test registration response:**
   ```bash
   curl -X POST https://plot2plan-backend.onrender.com/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"Test123","name":"Test"}'
   ```

---

## 📁 What Changed

**Commit:** c940436

**Files Modified:**
- `backend/src/main.ts` - Better error handling, bind to 0.0.0.0
- `backend/src/app.module.ts` - Validate MONGODB_URI
- `backend/src/auth/auth.module.ts` - Validate JWT_SECRET
- `backend/src/users/schemas/user.schema.ts` - Remove duplicate index

**Purpose:** Fix startup issues and improve debugging

---

## ✅ Quick Checklist

Wait for deployment (~5 min), then:

- [ ] Check Render logs for error messages
- [ ] Verify MONGODB_URI is set in Environment tab
- [ ] Verify JWT_SECRET is set in Environment tab
- [ ] Test health endpoint: `curl https://plot2plan-backend.onrender.com/`
- [ ] Verify `mongodbConfigured: true` in response
- [ ] Verify `jwtConfigured: true` in response
- [ ] Test auth endpoint: `curl -X POST .../auth/register`
- [ ] Test from frontend: https://plot2plan.vercel.app/register

---

**Current Status:** 🟡 Waiting for Render deployment (ETA: 5 min)

**Most Likely Issue:** Missing MONGODB_URI or JWT_SECRET in Render environment variables
