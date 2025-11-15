# How to Restart the Development Server

## Quick Instructions

### Stop the Server
1. **Find the terminal window** where the server is running
2. **Press `Ctrl + C`** (on Mac: `Cmd + C`)
3. The server will stop

### Start the Server
1. **Open a terminal** in your project folder
2. **Run:** `npm run dev`
3. **Wait** for it to say "Ready" (usually takes 5-10 seconds)
4. **Open** http://localhost:3000 in your browser

## Detailed Steps

### Step 1: Stop the Current Server

**Option A: Using the Terminal (Easiest)**
1. Look at the terminal window where `npm run dev` is running
2. You should see something like:
   ```
   ▲ Next.js 14.2.18
   - Local:        http://localhost:3000
   - ready started server on 0.0.0.0:3000
   ```
3. Click on that terminal window
4. Press `Ctrl + C` (on Mac: `Cmd + C`)
5. You should see the server stop

**Option B: If Terminal is Not Visible**
1. Open a new terminal
2. Run: `lsof -ti:3000 | xargs kill -9`
3. This will force-stop anything running on port 3000

### Step 2: Start the Server Again

1. **Open a terminal** in your project folder:
   - In VS Code/Cursor: Click "Terminal" → "New Terminal"
   - Or open Terminal app and navigate to your project

2. **Run this command:**
   ```bash
   npm run dev
   ```

3. **Wait for it to start** (you'll see):
   ```
   ▲ Next.js 14.2.18
   - Local:        http://localhost:3000
   - ready started server on 0.0.0.0:3000
   ```

4. **Open your browser** and go to: http://localhost:3000

## Why Restart?

After updating `.env` file, you need to restart the server because:
- The server reads environment variables when it starts
- Changes to `.env` won't be picked up until you restart
- This is normal and expected behavior

## Troubleshooting

### "Port 3000 is already in use"
- The old server is still running
- Run: `lsof -ti:3000 | xargs kill -9`
- Then try `npm run dev` again

### "Cannot find module 'cloudinary'"
- Run: `npm install`
- Then try `npm run dev` again

### Server won't start
- Check that your `.env` file has all three Cloudinary keys
- Make sure there are no extra spaces or quotes in `.env`
- Check the terminal for error messages

## Quick Reference

```bash
# Stop server
Ctrl + C (or Cmd + C on Mac)

# Start server
npm run dev

# Kill process on port 3000 (if stuck)
lsof -ti:3000 | xargs kill -9
```

## After Restarting

1. ✅ Server should be running on http://localhost:3000
2. ✅ Try uploading a file to test Cloudinary
3. ✅ Check the browser console for any errors
4. ✅ Check the terminal for any error messages

That's it! You're all set! 🎉

