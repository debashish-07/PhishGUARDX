# Deployment Guide: Phishing Detector

This guide covers deploying your phishing detector for **production use**, **demo presentations**, and **GitHub portfolio**.

---

## Table of Contents

1. [Local Development](#local-development)
2. [Production Build](#production-build)
3. [Deployment Options](#deployment-options)
4. [GitHub Setup](#github-setup)
5. [Demo Preparation](#demo-preparation)
6. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- Modern browser (Chrome, Firefox, Edge)

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/yourusername/phishing-detector.git
cd phishing-detector

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

### Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

---

## Production Build

### Step 1: Optimize Build

```bash
# Create optimized production build
npm run build

# Output will be in .next/ directory
```

### Step 2: Test Production Build Locally

```bash
# Start production server
npm start

# Open http://localhost:3000
# Test all features thoroughly
```

### Step 3: Performance Optimization

**Enable Compression** (next.config.js):
```javascript
module.exports = {
  compress: true,
  images: {
    domains: ['cdn.jsdelivr.net'],
  },
  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  }
};
```

**Enable Service Worker** (for offline support):
```bash
npm install next-pwa
```

---

## Deployment Options

### Option 1: Vercel (Recommended - Free)

**Why Vercel?**
- ✅ Free for personal projects
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration for Next.js

**Steps**:

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel

# Follow prompts:
# - Project name: phishing-detector
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
```

4. **Production Deployment**:
```bash
vercel --prod
```

**Your app will be live at**: `https://phishing-detector.vercel.app`

### Option 2: Netlify (Alternative - Free)

**Steps**:

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build**:
```bash
npm run build
```

3. **Deploy**:
```bash
netlify deploy --prod

# Specify publish directory: .next
```

### Option 3: GitHub Pages (Static Export)

**Note**: GitHub Pages only supports static sites. You'll need to export Next.js as static HTML.

**Steps**:

1. **Update next.config.js**:
```javascript
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/phishing-detector',
};
```

2. **Build static export**:
```bash
npm run build
```

3. **Deploy to GitHub Pages**:
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d out"

# Deploy
npm run deploy
```

**Your app will be live at**: `https://yourusername.github.io/phishing-detector`

### Option 4: Docker (Self-Hosted)

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and Run**:
```bash
# Build image
docker build -t phishing-detector .

# Run container
docker run -p 3000:3000 phishing-detector
```

---

## GitHub Setup

### Step 1: Create Repository

```bash
# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/yourusername/phishing-detector.git
```

### Step 2: Create .gitignore

```
# .gitignore
node_modules/
.next/
out/
.env.local
.DS_Store
*.log
.vercel
```

### Step 3: Commit and Push

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: PhishGuardX Hybrid Phishing Detection System"

# Push to GitHub
git push -u origin main
```

### Step 4: Add README Badges

Add these to your README.md:

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/phishing-detector)
```

### Step 5: Create GitHub Release

```bash
# Tag version
git tag -a v1.0.0 -m "Release v1.0.0: Final Year Project Submission"

# Push tag
git push origin v1.0.0
```

On GitHub:
1. Go to **Releases** → **Create a new release**
2. Choose tag `v1.0.0`
3. Title: "v1.0.0 - Final Year Project Submission"
4. Description: Include key features and screenshots
5. Attach compiled report PDF

---

## Demo Preparation

### For Live Presentations

#### 1. Pre-Demo Checklist

```bash
# ✅ Test on presentation laptop
npm run dev

# ✅ Test with sample URLs
# Benign: https://www.google.com
# Phishing: http://secure-paypal-verify.suspicious-domain.com

# ✅ Clear browser cache
# ✅ Close unnecessary tabs
# ✅ Disable browser extensions
# ✅ Test PDF download
```

#### 2. Backup Plan

**If live demo fails**:
- Have screenshots ready in a PowerPoint slide
- Record a video demo beforehand
- Use localhost instead of deployed version

**Backup Video Recording**:
```bash
# Use OBS Studio or QuickTime to record:
# 1. Full demo flow (2-3 minutes)
# 2. Benign URL analysis
# 3. Phishing URL analysis
# 4. PDF report generation
```

#### 3. Demo Script

```
1. "Let me show you the system in action"
2. Enter benign URL (google.com)
   - "Notice the low risk score and green indicators"
3. Enter phishing URL
   - "Now let's try a suspicious URL"
   - "See how it highlights risky keywords in red"
   - "The risk score is 71.8% - high risk"
4. Click "Download PDF Report"
   - "You can generate a detailed PDF report"
5. Show explainability
   - "The heatmap shows exactly why this URL is risky"
```

### For Offline Demos

**Enable Offline Mode**:

1. **Install Service Worker**:
```bash
npm install next-pwa
```

2. **Configure** (next.config.js):
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // ... your config
});
```

3. **Test Offline**:
- Open app in browser
- Open DevTools → Application → Service Workers
- Check "Offline"
- Refresh page - should still work!

---

## Environment Variables

### Production Environment

Create `.env.production`:

```bash
# API URLs (if using backend)
NEXT_PUBLIC_API_URL=https://api.yourbackend.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_BACKEND=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Development Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_BACKEND=true
```

---

## Performance Optimization

### 1. Code Splitting

Already handled by Next.js, but ensure dynamic imports:

```typescript
// Good: Dynamic import
const PDFGenerator = dynamic(() => import('@/lib/reportGenerator'));

// Avoid: Static import for large libraries
import jsPDF from 'jspdf'; // ❌
```

### 2. Image Optimization

```typescript
import Image from 'next/image';

// Use Next.js Image component
<Image 
  src="/logo.png" 
  width={200} 
  height={50} 
  alt="Logo"
  priority // For above-the-fold images
/>
```

### 3. Bundle Analysis

```bash
# Install analyzer
npm install @next/bundle-analyzer

# Analyze bundle
ANALYZE=true npm run build
```

### 4. Lighthouse Score

**Target Scores**:
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >90

**Run Lighthouse**:
1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Click **Generate report**
4. Fix any issues

---

## Monitoring & Analytics

### Option 1: Vercel Analytics (Free)

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

### Option 2: Google Analytics

```typescript
// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};
```

---

## Troubleshooting

### Common Issues

#### 1. Build Fails

**Error**: `Module not found: Can't resolve '@/lib/...'`

**Solution**:
```bash
# Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*", "./app/*"]
    }
  }
}
```

#### 2. Workers Not Loading

**Error**: `Failed to construct 'Worker'`

**Solution**:
```typescript
// Use dynamic import
const worker = new Worker(
  new URL('../workers/my-worker.ts', import.meta.url)
);
```

#### 3. IndexedDB Errors

**Error**: `Failed to open database`

**Solution**:
```typescript
// Add error handling
try {
  await storage.init();
} catch (error) {
  console.error('IndexedDB not available, using memory storage');
  // Fallback to in-memory storage
}
```

#### 4. PDF Generation Fails

**Error**: `Cannot find module 'jspdf'`

**Solution**:
```bash
npm install jspdf
```

#### 5. Slow Performance

**Solution**:
- Enable production mode: `npm run build && npm start`
- Clear browser cache
- Disable React DevTools
- Use Chrome instead of Firefox for demo

---

## Security Checklist

Before deploying:

- ✅ Remove console.logs in production
- ✅ Enable HTTPS (automatic on Vercel/Netlify)
- ✅ Add Content Security Policy headers
- ✅ Sanitize user inputs
- ✅ Remove API keys from code
- ✅ Enable CORS properly
- ✅ Add rate limiting (if using backend)

---

## Final Checklist

### Before Submission:

- ✅ Code is clean and well-commented
- ✅ README.md is complete
- ✅ All dependencies are in package.json
- ✅ Project builds without errors
- ✅ All features work in production
- ✅ Demo is tested and recorded
- ✅ Report is finalized
- ✅ Presentation is ready
- ✅ GitHub repository is public
- ✅ Live demo URL is working

### Before Presentation:

- ✅ Test on presentation laptop
- ✅ Have backup screenshots
- ✅ Have backup video
- ✅ Clear browser cache
- ✅ Close unnecessary apps
- ✅ Test internet connection
- ✅ Have offline version ready

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Transformers.js](https://huggingface.co/docs/transformers.js)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

### Contact
If you encounter issues, reach out to:
- Email: your.email@university.edu
- GitHub Issues: https://github.com/yourusername/phishing-detector/issues

---

**Good luck with your project submission and presentation! 🚀**
