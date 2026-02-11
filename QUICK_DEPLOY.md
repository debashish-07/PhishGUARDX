# 🚀 Quick Deployment Guide

This guide will help you deploy your Quantum Phishing Detector to the web in **under 10 minutes**.

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

- [ ] `npm run build` works locally without errors
- [ ] Application runs correctly with `npm start`
- [ ] All features tested (analyze, PDF download, visualizations)
- [ ] No console errors in production build
- [ ] Git repository is initialized and pushed to GitHub

---

## 🎯 Option 1: Deploy to Vercel (Recommended - Easiest)

**Why Vercel?**
- ✅ Free for personal projects
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration for Next.js
- ✅ Automatic deployments on git push

### Steps:

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/phishing-detector.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" (use GitHub account)
   - Click "New Project"
   - Import your `phishing-detector` repository
   - Vercel auto-detects Next.js settings
   - Click "Deploy"

3. **Done!** Your app will be live at:
   ```
   https://phishing-detector-YOUR_USERNAME.vercel.app
   ```

### Custom Domain (Optional):
- Go to Project Settings → Domains
- Add your custom domain (e.g., `phishing-detector.com`)
- Follow DNS configuration instructions

---

## 🎯 Option 2: Deploy to Netlify

**Why Netlify?**
- ✅ Free tier with generous limits
- ✅ Easy drag-and-drop deployment
- ✅ Form handling and serverless functions
- ✅ Split testing capabilities

### Steps:

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login
   netlify login

   # Deploy
   netlify deploy --prod

   # When prompted:
   # - Publish directory: out
   ```

3. **Or Deploy via Web UI**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository
   - Build command: `npm run build`
   - Publish directory: `out`
   - Click "Deploy site"

4. **Done!** Your app will be live at:
   ```
   https://YOUR_SITE_NAME.netlify.app
   ```

---

## 🎯 Option 3: Deploy to GitHub Pages

**Why GitHub Pages?**
- ✅ Completely free
- ✅ Integrated with GitHub
- ✅ Good for portfolios

### Steps:

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d out"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Go to your GitHub repository
   - Settings → Pages
   - Source: `gh-pages` branch
   - Click "Save"

5. **Done!** Your app will be live at:
   ```
   https://YOUR_USERNAME.github.io/phishing-detector
   ```

**Note**: If using GitHub Pages, update `next.config.mjs`:
```javascript
const nextConfig = {
  output: 'export',
  basePath: '/phishing-detector', // Add this line
  // ... rest of config
};
```

---

## 🎯 Option 4: Deploy to Cloudflare Pages

**Why Cloudflare Pages?**
- ✅ Extremely fast (Cloudflare's global network)
- ✅ Unlimited bandwidth
- ✅ Free SSL

### Steps:

1. **Push to GitHub** (if not done)

2. **Deploy via Cloudflare**:
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Click "Create a project"
   - Connect to GitHub
   - Select your repository
   - Build command: `npm run build`
   - Build output directory: `out`
   - Click "Save and Deploy"

3. **Done!** Your app will be live at:
   ```
   https://phishing-detector.pages.dev
   ```

---

## 🧪 Testing Your Deployment

After deployment, test these features:

### 1. Basic Functionality
- [ ] Page loads without errors
- [ ] Background animation works
- [ ] Input field accepts text
- [ ] Analyze button works

### 2. Detection Pipeline
- [ ] Benign URL (google.com) scores low
- [ ] Phishing URL scores high
- [ ] Heatmaps display correctly
- [ ] Visualizations render

### 3. Advanced Features
- [ ] PDF download works
- [ ] IndexedDB saves history
- [ ] Cache works (2nd analysis faster)
- [ ] No console errors

### 4. Performance
- [ ] Page loads in <3 seconds
- [ ] Analysis completes in <1 second
- [ ] No memory leaks
- [ ] Works on mobile

---

## 🐛 Common Deployment Issues

### Issue 1: Build Fails

**Error**: `Module not found` or `Cannot find module`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Issue 2: Workers Don't Load

**Error**: `Failed to construct 'Worker'`

**Solution**: Ensure workers use correct syntax:
```typescript
new Worker(new URL('../workers/quantum_hash.worker.ts', import.meta.url))
```

### Issue 3: Images Don't Load

**Error**: Images show broken

**Solution**: In `next.config.mjs`, ensure:
```javascript
images: {
  unoptimized: true, // Required for static export
}
```

### Issue 4: 404 on Refresh

**Error**: Page not found when refreshing

**Solution**: This is normal for static exports. The platform should handle it:
- **Vercel**: Automatic
- **Netlify**: Add `netlify.toml` (already included)
- **GitHub Pages**: Use hash routing or SPA fallback

### Issue 5: Environment Variables

**Error**: API keys or config not working

**Solution**: 
- Vercel: Add in Project Settings → Environment Variables
- Netlify: Add in Site Settings → Build & Deploy → Environment
- Prefix with `NEXT_PUBLIC_` for client-side access

---

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Check Lighthouse score (aim for >90)
- [ ] Verify HTTPS is enabled
- [ ] Test all features end-to-end
- [ ] Share URL with friends for feedback
- [ ] Add deployment URL to README
- [ ] Update project documentation

---

## 🎓 For Your Project Submission

### Add Deployment URL to README

Update your `README.md`:

```markdown
## 🌐 Live Demo

**Try it now**: [https://phishing-detector.vercel.app](https://phishing-detector.vercel.app)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/phishing-detector)
```

### Include in Presentation

Add a slide with:
- **Live Demo URL**: https://your-app.vercel.app
- **QR Code**: Generate at [qr-code-generator.com](https://www.qr-code-generator.com/)
- **Screenshot**: Show the deployed app

---

## 🚀 Continuous Deployment

Once deployed, every time you push to GitHub:

1. **Vercel/Netlify** automatically:
   - Pulls latest code
   - Runs `npm run build`
   - Deploys to production
   - Sends you a notification

2. **You get**:
   - Instant preview URLs for PRs
   - Rollback capability
   - Deployment history
   - Analytics (optional)

---

## 📈 Optional: Add Analytics

### Vercel Analytics (Free)

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Google Analytics

Add to `app/layout.tsx`:

```typescript
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

---

## ✅ Final Deployment Checklist

Before presenting:

- [ ] App is deployed and accessible
- [ ] URL is short and memorable
- [ ] HTTPS is enabled (automatic on all platforms)
- [ ] All features work on deployed version
- [ ] No console errors
- [ ] Mobile-responsive
- [ ] Fast loading (<3s)
- [ ] QR code generated for easy access
- [ ] URL added to README and presentation

---

## 🎉 Success!

Your Quantum Phishing Detector is now live and accessible worldwide!

**Share your deployment URL**:
- With your project guide
- In your presentation
- On your resume/portfolio
- With potential employers

**Example URLs**:
- Vercel: `https://phishing-detector.vercel.app`
- Netlify: `https://phishing-detector.netlify.app`
- GitHub Pages: `https://username.github.io/phishing-detector`
- Cloudflare: `https://phishing-detector.pages.dev`

---

**Need help?** Check:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

**Your project is ready to impress!** 🚀
