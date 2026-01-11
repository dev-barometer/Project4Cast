# 🚀 Quick Reference - Which Environment Am I On?

## At a Glance

| Environment | URL | Banner Color | Branch | Safe to Break? |
|------------|-----|--------------|--------|----------------|
| **🟢 PRODUCTION** | `project4-cast.vercel.app` | None (clean) | `main` | ❌ NO! |
| **🟡 STAGING** | `project4cast-staging.vercel.app` | Yellow | `staging` | ✅ YES! |
| **🔵 LOCAL** | `localhost:3000` | Blue | Any | ✅ YES! |

---

## Visual Indicators

### Production
- ✅ **No banner** (clean interface)
- URL: `project4-cast.vercel.app`
- **DON'T BREAK THIS!**

### Staging  
- 🟡 **Yellow banner**: "⚠️ STAGING ENVIRONMENT - Testing Only"
- URL: `project4cast-staging.vercel.app`
- **Safe to experiment!**

### Local
- 🔵 **Blue banner**: "🔧 LOCAL DEVELOPMENT"
- URL: `localhost:3000`
- **Your computer, safe to break!**

---

## Quick Commands

### Check Current Branch
```bash
git branch
# Shows: * staging  or  * main
```

### Switch to Staging
```bash
git checkout staging
```

### Switch to Production
```bash
git checkout main
```

### Deploy to Staging
```bash
git checkout staging
# ... make changes ...
git push origin staging
# Auto-deploys to staging
```

### Deploy to Production
```bash
git checkout main
git merge staging  # After testing on staging!
git push origin main
# Auto-deploys to production
```

---

## Workflow

1. **Work on STAGING** → Make changes → Test
2. **Test on STAGING URL** → Make sure it works
3. **Merge to MAIN** → Deploy to production
4. **Verify PRODUCTION** → Check it works

**Never skip step 2!** Always test on staging first.

---

## Emergency: I'm Not Sure Which One I'm On!

1. **Look at the URL** in your browser
2. **Look for the banner** at the top
3. **Check Vercel** → Which project is deploying?
4. **Check Git** → `git branch` shows current branch

---

## Remember

- 🟢 **Production** = Real users, real data → Be careful!
- 🟡 **Staging** = Testing → Break things here!
- 🔵 **Local** = Your computer → Break things here!

**When in doubt, use STAGING!** 🟡





