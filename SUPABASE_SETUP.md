# 🔐 Supabase Authentication Setup for SeekReap

## Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project"
3. Create new project:
   - Name: `seekreap-production`
   - Database Password: (create strong password)
   - Region: Choose closest to your users
   - Pricing: Free tier (500MB database)

## Step 2: Get Your Credentials
After project creation:
1. Go to **Project Settings** → **API**
2. Copy:
   - **URL** (looks like: https://xxxxx.supabase.co)
   - **anon public key** (starts with eyJ...)

## Step 3: Update Configuration
Edit `public/supabase-config.js` and replace:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
