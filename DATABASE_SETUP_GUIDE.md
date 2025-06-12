# 🗄️ SoleFolio Database Setup Guide

## Step 1: Create Production Supabase Project

1. **Go to** https://supabase.com
2. **Click "New Project"**
3. **Choose your organization** (create one if needed)
4. **Project Settings:**
   - **Name:** SoleFolio
   - **Database Password:** Generate a strong password (save this!)
   - **Region:** Choose closest to your users
5. **Click "Create new project"**

⏰ **Wait 2-3 minutes** for project initialization

## Step 2: Get Your Project Credentials

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values:**
   ```
   Project URL: https://your-project-ref.supabase.co
   Project API Keys:
   - anon/public: eyJhbGc... (starts with eyJ)
   - service_role: eyJhbGc... (starts with eyJ, different from anon)
   ```

## Step 3: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to SQL Editor** in your Supabase dashboard
2. **Create new query**
3. **Copy and paste the contents of each migration file in order:**

#### Migration 1: Initial Schema
```sql
-- Copy the entire contents of: supabase/migrations/001_initial_schema.sql
-- Paste into SQL Editor and click "Run"
```

#### Migration 2: Security Policies  
```sql
-- Copy the entire contents of: supabase/migrations/002_rls_policies.sql
-- Paste into SQL Editor and click "Run"
```

#### Migration 3: Functions & Triggers
```sql
-- Copy the entire contents of: supabase/migrations/003_functions_triggers.sql
-- Paste into SQL Editor and click "Run"
```

### Option B: Using Supabase CLI (Advanced)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Push migrations:**
   ```bash
   supabase db push
   ```

## Step 4: Verify Database Setup

1. **Go to Table Editor** in Supabase dashboard
2. **Check that these tables exist:**
   - ✅ users
   - ✅ sneakers 
   - ✅ user_sneakers
   - ✅ offers
   - ✅ follows
   - ✅ activity_feed
   - ✅ watchlists
   - ✅ price_history

3. **Test RLS policies:** Try inserting a test record to verify security

## Step 5: Seed Initial Data (Optional)

### Add Sample Sneakers
Run this in SQL Editor to add popular sneakers:

```sql
INSERT INTO public.sneakers (brand, model, colorway, style_code, retail_price, image_url) VALUES
('Nike', 'Air Jordan 1 Retro High OG', 'Bred Toe', '555088-610', 160.00, 'https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Bred-Toe.jpg'),
('Nike', 'Air Jordan 4 Retro', 'White Cement', '840606-192', 200.00, 'https://images.stockx.com/images/Air-Jordan-4-Retro-White-Cement-2016.jpg'),
('Adidas', 'Yeezy Boost 350 V2', 'Zebra', 'CP9654', 220.00, 'https://images.stockx.com/images/Adidas-Yeezy-Boost-350-V2-Zebra.jpg'),
('Nike', 'Air Force 1 Low', 'White', '315122-111', 90.00, 'https://images.stockx.com/images/Nike-Air-Force-1-Low-White-07.jpg'),
('Nike', 'Dunk Low', 'Panda', 'DD1391-100', 100.00, 'https://images.stockx.com/images/Nike-Dunk-Low-White-Black-2021.jpg');
```

## Step 6: Update Environment Variables

Update your `.env.local` file:

```env
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 7: Test Database Connection

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Try to sign up** for a new account
3. **Check Users table** in Supabase dashboard - should see new user
4. **Try adding a sneaker** to test full functionality

## 🔒 Security Features Enabled

✅ **Row Level Security (RLS)** - Users can only access their own data  
✅ **API Key Authentication** - Secure API access  
✅ **Real-time Subscriptions** - Live updates  
✅ **Automatic User Creation** - Seamless auth integration  

## 🚀 Database Features

✅ **8 Core Tables** - Complete social marketplace schema  
✅ **Custom Types** - Enums for conditions, statuses, activity types  
✅ **Automated Triggers** - Count updates, activity feeds, timestamps  
✅ **Advanced Functions** - User feeds, search, recommendations  
✅ **Performance Indexes** - Optimized for scale  

## Troubleshooting

**❌ Migration fails?**
- Check SQL syntax in each file
- Run migrations one at a time
- Verify Supabase project is fully initialized

**❌ RLS blocks access?**
- Verify user is authenticated
- Check policy conditions match your use case
- Test with service role key temporarily

**❌ Functions not working?**
- Ensure all migrations ran successfully
- Check function syntax in SQL Editor
- Verify function permissions

---

## ✅ Ready for Production!

Once migrations complete successfully, your database is production-ready with:
- **Full social features** (follows, activity feeds)
- **Marketplace functionality** (offers, pricing)
- **Security policies** (data protection)
- **Performance optimization** (indexes, triggers)

**Next:** Update environment variables and deploy to Vercel! 🚀