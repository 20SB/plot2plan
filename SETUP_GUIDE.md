# 🚀 Complete Setup Guide

Step-by-step instructions to get the House Design Platform running on your machine.

---

## ✅ Prerequisites Checklist

Before you start, ensure you have:

- [ ] **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- [ ] **MongoDB** - [Download](https://www.mongodb.com/try/download/community) OR [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)
- [ ] **npm** (comes with Node.js) or **yarn**
- [ ] **Git** (optional, for version control)
- [ ] A code editor (VS Code recommended)

Check versions:
```bash
node --version    # Should be v18+
npm --version     # Should be 8+
mongod --version  # Should be 6+ (if using local MongoDB)
```

---

## 📥 Step 1: Install MongoDB

### Option A: Local MongoDB (Recommended for Development)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
1. Download installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run installer (choose "Complete" setup)
3. Install as Windows Service
4. Done!

**Verify MongoDB is running:**
```bash
mongo --version
# OR
mongosh --version
```

### Option B: MongoDB Atlas (Cloud - Easy Setup)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a free cluster (M0 Sandbox)
4. Wait for cluster to provision (~5 mins)
5. Click "Connect" → "Connect your application"
6. Copy the connection string:
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/house-design-platform
   ```
7. Replace `<password>` with your actual password

---

## 📦 Step 2: Install Project Dependencies

### Navigate to project directory
```bash
cd house-design-platform
```

### Install Backend Dependencies
```bash
cd backend
npm install
```

Wait for installation to complete (~2-3 minutes).

### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

Wait for installation to complete (~2-3 minutes).

---

## ⚙️ Step 3: Configure Environment Variables

### Backend Configuration

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. The `.env` file already exists. Open it:
   ```bash
   code .env
   # OR
   nano .env
   # OR use any text editor
   ```

3. Update the values:

   **For Local MongoDB:**
   ```env
   NODE_ENV=development
   PORT=3001
   API_PREFIX=api/v1
   
   # Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/house-design-platform
   
   # Generate a random secret (or use any long random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRATION=7d
   
   CORS_ORIGINS=http://localhost:3000
   ```

   **For MongoDB Atlas:**
   ```env
   NODE_ENV=development
   PORT=3001
   API_PREFIX=api/v1
   
   # Replace with your Atlas connection string
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/house-design-platform?retryWrites=true&w=majority
   
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRATION=7d
   
   CORS_ORIGINS=http://localhost:3000
   ```

4. Save the file.

### Frontend Configuration

1. Navigate to frontend directory:
   ```bash
   cd ../frontend
   ```

2. The `.env.local` file already exists. Open it:
   ```bash
   code .env.local
   ```

3. Verify it contains:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   ```

4. Save the file (usually no changes needed).

---

## 🚀 Step 4: Start the Application

You'll need **TWO terminal windows/tabs**.

### Terminal 1: Start Backend

```bash
cd house-design-platform/backend
npm run start:dev
```

**Expected Output:**
```
[Nest] 12345  - LOG [NestFactory] Starting Nest application...
[Nest] 12345  - LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - LOG [InstanceLoader] MongooseModule dependencies initialized
...
🚀 Application is running on: http://localhost:3001/api/v1
```

✅ Backend is ready when you see "Application is running"

### Terminal 2: Start Frontend

```bash
cd house-design-platform/frontend
npm run dev
```

**Expected Output:**
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.5s
```

✅ Frontend is ready when you see "Ready"

---

## ✨ Step 5: Test the Application

1. **Open your browser**
   Navigate to: `http://localhost:3000`

2. **Register a new account**
   - Click "Get Started"
   - Fill in:
     - Name: Your Name
     - Email: test@example.com
     - Password: test123 (minimum 6 characters)
     - Phone: (optional)
   - Click "Create Account"

3. **You'll be redirected to the Dashboard**
   You should see:
   - Welcome message with your name
   - Project stats (all zeros)
   - "No projects yet" message

4. **Create your first project**
   - Click "New Project" or "Create Your First Project"
   - Fill in the 4-step form:
     
     **Step 1: Basic Info**
     - Project Name: "My Dream Home"
     - Description: "A beautiful 2BHK house"
     
     **Step 2: Plot Details**
     - Length: 40 feet
     - Width: 60 feet
     - Area: (auto-calculated)
     - Facing: North
     - Shape: Rectangular
     
     **Step 3: Room Requirements**
     - Bedrooms: 2
     - Bathrooms: 2
     - Kitchen: 1
     - Living Room: 1
     - (Set others as needed)
     
     **Step 4: Design Preferences**
     - Floors: 1
     - Vastu Compliant: ✓ (if desired)
     - Budget: 10L - 50L
     - Notes: "Need good ventilation"
   
   - Click "Create Project"

5. **View your project**
   - You'll be redirected to the project detail page
   - You should see all the information you entered
   - Status should be "draft"

6. **Return to dashboard**
   - Click "Back to Dashboard"
   - You should see your project listed
   - Stats should show "1 Total Project"

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Landing page loads at `http://localhost:3000`
- [ ] Can register a new account
- [ ] Can log in with the account
- [ ] Dashboard loads with user info
- [ ] Can create a new project (all 4 steps)
- [ ] Project appears in dashboard
- [ ] Can view project details
- [ ] Can log out and log back in

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "Cannot connect to MongoDB"**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

**Error: "Port 3001 is already in use"**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or change PORT in backend/.env to another port like 3002
```

**Error: "Module not found"**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start

**Error: "Port 3000 is already in use"**
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

**Error: "Module not found"**
```bash
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

### Can't register/login

**Error: "Network Error"**
- Check backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Try accessing `http://localhost:3001/api/v1` in browser

**Error: "CORS Error"**
- Check `CORS_ORIGINS` in `backend/.env` matches frontend URL exactly
- Restart backend after changing .env

### MongoDB errors

**Error: "Authentication failed"**
- Double-check MongoDB connection string
- Verify username and password
- Check database name in connection string

---

## 🎯 Next Steps

Now that everything is working:

1. **Explore the codebase**
   - Read `backend/README.md` for backend details
   - Read `frontend/README.md` for frontend details
   - Review the code structure

2. **Test all features**
   - Create multiple projects
   - Edit project details
   - Delete a project
   - Check API responses in browser DevTools

3. **Make small changes**
   - Change a color in `frontend/tailwind.config.ts`
   - Add a field to the project form
   - Modify a component

4. **Prepare for Phase 2**
   - Understand the current architecture
   - Review the Phase 1 code
   - Read about 2D floor plan generation

---

## 💡 Tips

- **Hot Reload**: Both frontend and backend support hot reload. Just save files and changes appear automatically.
- **DevTools**: Use browser DevTools (F12) to inspect API calls and errors.
- **MongoDB Compass**: Install [MongoDB Compass](https://www.mongodb.com/products/compass) to visually browse your database.
- **Postman**: Use Postman or Insomnia to test API endpoints directly.
- **VS Code Extensions**: Install ESLint, Prettier, and Tailwind CSS IntelliSense for better development experience.

---

## 🎉 Success!

You've successfully set up the House Design Platform!

The foundation is complete. You now have:
- ✅ A working authentication system
- ✅ A project management system
- ✅ A beautiful, responsive UI
- ✅ A clean, scalable architecture

**Ready to build Phase 2?**

When you're ready, say:  
**"Start Phase 2 - 2D Floor Plan Generator"**

---

## 📞 Need Help?

If you encounter issues:
1. Check this troubleshooting section
2. Review the error messages carefully
3. Check backend/frontend terminal logs
4. Verify all environment variables
5. Ensure all prerequisites are installed

**Remember:** Most issues are due to:
- MongoDB not running
- Wrong environment variables
- Port conflicts
- Missing dependencies
