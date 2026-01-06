# Database Keep-Alive Setup

This prevents your Supabase database from pausing due to inactivity.

## 🎯 How It Works

The keep-alive system runs a lightweight database query every 72-96 hours (randomized) to keep your database active.

## ✅ Option 1: Vercel Cron Jobs (Recommended - Easiest)

Vercel has built-in cron job support. This is the simplest option.

### Setup Steps:

1. **Add CRON_SECRET to Vercel:**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add: `CRON_SECRET` = (generate a random string, e.g., `openssl rand -hex 32`)
   - Add to Production, Preview, and Development environments

2. **Deploy:**
   - The `vercel.json` file is already configured
   - Just push your code and Vercel will set up the cron job automatically

3. **Verify:**
   - Go to Vercel → Your Project → Settings → Cron Jobs
   - You should see the keep-alive job scheduled

**Schedule:** Runs every 72 hours (3 days)

## 🎲 Option 2: External Service with Randomization (More Flexible)

Use an external cron service like cron-job.org for true randomization.

### Setup Steps:

1. **Generate a Secret:**
   ```bash
   openssl rand -hex 32
   ```
   Copy this value.

2. **Add CRON_SECRET to Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Add: `CRON_SECRET` = (paste the secret you generated)

3. **Set up cron-job.org:**
   - Go to https://cron-job.org (free account)
   - Create a new cron job
   - **URL:** `https://project4-cast.vercel.app/api/cron/keep-alive`
   - **Schedule:** Every 72 hours (or use the random script)
   - **Method:** GET
   - **Headers:** 
     - Name: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`
   - Save the job

4. **For True Randomization:**
   - Use the `scripts/keep-alive-random.js` script
   - Set up a cron job that runs every 72 hours
   - The script will randomize the actual timing between 72-96 hours

## 🔧 Option 3: GitHub Actions (Free, Reliable)

GitHub Actions can run scheduled workflows for free.

### Setup Steps:

1. **Create `.github/workflows/keep-alive.yml`:**
   ```yaml
   name: Database Keep-Alive
   on:
     schedule:
       # Run every 3 days at random times
       - cron: '0 */72 * * *'
     workflow_dispatch: # Allow manual trigger
   
   jobs:
     keep-alive:
       runs-on: ubuntu-latest
       steps:
         - name: Keep Database Alive
           run: |
             curl -X GET \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
               https://project4-cast.vercel.app/api/cron/keep-alive
   ```

2. **Add Secret to GitHub:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add: `CRON_SECRET` = (your secret value)

3. **Add CRON_SECRET to Vercel:**
   - Same as above

## 🧪 Testing

Test the endpoint manually:

```bash
# Replace YOUR_SECRET with your actual secret
curl -X GET \
  -H "Authorization: Bearer YOUR_SECRET" \
  https://project4-cast.vercel.app/api/cron/keep-alive
```

You should get a response like:
```json
{
  "success": true,
  "message": "Database keep-alive successful",
  "userCount": 5,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 📊 Monitoring

Check Vercel logs to see if keep-alive is working:
- Go to Vercel → Your Project → Logs
- Filter for `/api/cron/keep-alive`
- You should see successful requests every 72-96 hours

## ⚙️ Customization

### Change the Schedule:
Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 */72 * * *"  // Every 72 hours
    }
  ]
}
```

### Change Randomization Range:
Edit `scripts/keep-alive-random.js`:
```javascript
const MIN_HOURS = 72;  // Minimum hours
const MAX_HOURS = 96;  // Maximum hours
```

## 🎯 Recommendation

**Use Option 1 (Vercel Cron Jobs)** - It's the simplest and most reliable:
- ✅ Built into Vercel (no external services)
- ✅ Free
- ✅ Automatic setup
- ✅ Easy to monitor

The randomization isn't critical - running every 72 hours is sufficient to prevent pausing.

## 🔒 Security

The `CRON_SECRET` prevents unauthorized access to your keep-alive endpoint. Make sure to:
- Use a strong, random secret
- Never commit it to git
- Only share it with trusted cron services

