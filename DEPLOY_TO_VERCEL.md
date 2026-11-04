# Publish to GitHub & Deploy on Vercel — Complete Guide

This package is pre-configured with `vercel.json`, `/api/index.ts`, and Vite static build settings so you can publish it to a **private GitHub repository** and deploy it directly on **Vercel** using only **OpenRouter**.

---

## Step 1: Download & Extract the Project ZIP

1. Click the **Download ZIP** button in the top navigation bar of the application (downloads `ntb-relationship-360-vercel.zip`).
2. Extract `ntb-relationship-360-vercel.zip` into a new folder on your computer, for example:
   ```text
   C:\Projects\ntb-relationship-360
   ```
3. Confirm the following files are at the root of that folder:
   - `package.json`
   - `vercel.json`
   - `vite.config.ts`
   - `tsconfig.json`
   - `index.html`
   - `server.ts`
   - `.gitignore`
   - `.env.example`
   - `api/index.ts`
   - `src/` (all React components, financial engine, and customer data)
   - `public/` (including the Nations Trust Bank logo at `public/assets/aistudio/image_ca62426b.png`)

*(Important: Upload the extracted **contents** of the folder to GitHub, not the `.zip` file itself.)*

---

## Step 2: Publish to a Private GitHub Repository

### Option A: Using Git in PowerShell / Terminal (Recommended)

1. Go to [https://github.com/new](https://github.com/new) and create a **Private** repository named `ntb-relationship-360` (leave "Add a README file" unchecked).
2. Open PowerShell or Terminal inside your extracted project folder and run:

```powershell
git init
git branch -M main
git add .
git commit -m "Initial commit: NTB Relationship 360 Executive Portal"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ntb-relationship-360.git
git push -u origin main
```

### Option B: Using GitHub Web Upload

1. Create a new **Private** repository on GitHub.
2. Click **uploading an existing file**, drag and drop all extracted files/folders (`api`, `public`, `src`, `package.json`, `vercel.json`, `server.ts`, `index.html`, `vite.config.ts`, `tsconfig.json`, `.gitignore`, `.env.example`) into the browser, and click **Commit changes**.
3. Never upload your private `.env` file to GitHub.

---

## Step 3: Deploy on Vercel

1. Sign in to [https://vercel.com](https://vercel.com) and click **Add New... → Project**.
2. Click **Import** next to your `ntb-relationship-360` GitHub repository.
3. Verify the **Build and Output Settings** (Vercel automatically reads these from `vercel.json`):
   - **Framework Preset**: `Vite` (or `Other`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Open the **Environment Variables** section and add your **OpenRouter** settings (no Gemini API key is needed):

| Variable Name | Value | Notes |
| :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Your OpenRouter API key |
| `OPENROUTER_MODEL` | `openai/gpt-4.1-mini` | Model used for Next Best Product suggestions |
| `OPENROUTER_OVERVIEW_MODEL` | `google/gemini-2.5-flash` | Model routed via OpenRouter for public company research |
| `OPENROUTER_REQUIRE_ZDR` | `false` | Set to `true` if using Zero Data Retention endpoints |
| `BANK_NAME` | `Nations Trust Bank` | Displayed across dashboard & printable brief |
| `SOURCE_CURRENCY` | `LKR` | Reporting currency (LKR Millions) |

*(Optional)* If you want to require a username/password popup on `/api/*` and `/brief/*` endpoints:
```text
REQUIRE_ACCESS_AUTH=true
APP_ACCESS_USERNAME=bank-officer
APP_ACCESS_PASSWORD=your_strong_password
```

5. Click **Deploy** and wait ~45 seconds for Vercel to finish building.

---

## Step 4: Verify Your Live Deployment

1. Open `https://YOUR-PROJECT.vercel.app/health` — it should return:
   ```json
   {"status":"ok"}
   ```
2. Open `https://YOUR-PROJECT.vercel.app` on both your **laptop** and **mobile phone**:
   - Confirm the **Nations Trust Bank** logo and blue/magenta theme load cleanly.
   - Confirm all **17 primary corporate customers** appear in the dropdown without CIF numbers displayed on the profile cards.
   - Check **Central Finance Company PLC**, **Haycarb PLC**, and **L. G. Farm (Pvt) Ltd**.
   - Test **Assets / Liabilities / Revenue** chart modes, **Next Best Product Suggestions**, **Connected Director Relationships** at the bottom of the page, **Executive Desk**, and **Visit Brief** (`/brief/51012681`).
