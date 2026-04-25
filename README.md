# SpendSmart ₹

**Track. Budget. Share.** A personal finance tracker built for India.

## 📱 Quick Start

### Option 1: Open directly
Double-click `index.html` to open in your browser.

### Option 2: Run with local server (recommended for PWA features)
```bash
# If you have Python:
python -m http.server 8080

# If you have Node.js:
npx serve .
```
Then visit `http://localhost:8080`

---

## 📲 Install as APK (Android)

### Method A: WebIntoApp (Easiest)
1. Go to [webintoapp.com](https://webintoapp.com)
2. Upload the entire `SpendSmart/` folder as a ZIP
3. Configure: App name = "SpendSmart", Icon = `icons/icon-512.png`
4. Download the generated APK
5. Share via WhatsApp / Google Drive

### Method B: PWABuilder (Requires hosting)
1. Host on GitHub Pages (free) — see below
2. Go to [pwabuilder.com](https://pwabuilder.com)
3. Enter your GitHub Pages URL
4. Download Android APK + AAB bundle

### Method C: Sideload via Chrome
1. Open the hosted URL on Android Chrome
2. Tap menu → "Add to Home Screen" or "Install App"
3. App installs as a standalone PWA

---

## 🌐 Deploy to GitHub Pages (Free Hosting)

```bash
# 1. Create a GitHub repo
git init
git add .
git commit -m "SpendSmart v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/SpendSmart.git
git push -u origin main

# 2. Enable GitHub Pages
# Go to repo Settings → Pages → Source: main branch → Save
# Your app will be live at: https://YOUR_USERNAME.github.io/SpendSmart/
```

---

## 📁 Project Structure

```
SpendSmart/
├── index.html          ← Main app (PWA-ready)
├── style.css           ← Extracted styles
├── app.js              ← React code (JSX)
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline caching)
├── icons/
│   ├── icon-192.png    ← App icon (192×192)
│   └── icon-512.png    ← App icon (512×512)
└── lib/
    ├── react.production.min.js
    ├── react-dom.production.min.js
    └── babel.min.js
```

## ✨ Features
- 📊 Dashboard with balance, charts, category breakdown
- ➕ Quick expense/income entry with smart category suggestions
- 📋 Full transaction history with search, filter, edit, delete
- 🎯 Per-category monthly budgets with progress tracking
- 🔁 Recurring transactions (auto-add monthly)
- 📤 Share summary via WhatsApp or clipboard
- 📥 Export all data as CSV
- 🌙/☀️ Dark & Light modes
- 📱 Works fully offline after first load (Service Worker)
- 🏷️ Custom categories with emoji + color picker

## 🗺️ Roadmap
- **Phase 1** ✅ Local PWA + APK
- **Phase 2** 🔜 AWS backend (Cognito + DynamoDB + Lambda + API Gateway)
- **Phase 3** 🔮 Social features (Splitwise-like groups)
