# 🚀 SoleFolio API Deployment Guide

## Overview

SoleFolio now includes complete API-based deployment automation for both Vercel and Supabase. This eliminates manual setup and ensures consistent, reproducible deployments.

## Available Scripts

```bash
# Deploy only to Vercel
npm run deploy:vercel

# Setup only Supabase production database
npm run deploy:supabase

# Complete deployment (Supabase + Vercel)
npm run deploy:full
```

## Prerequisites

### 1. Vercel API Token
1. Go to https://vercel.com/account/tokens
2. Create a new token named "SoleFolio Deployment"
3. Set environment variable: `export VERCEL_TOKEN=your_token_here`

### 2. Supabase API Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Create a new access token
3. Set environment variable: `export SUPABASE_ACCESS_TOKEN=your_token_here`

### 3. Supabase Organization ID
1. Go to your Supabase dashboard
2. Copy the organization ID from the URL (after `/org/`)
3. Set environment variable: `export SUPABASE_ORG_ID=your_org_id_here`

### 4. Database Password (Optional)
```bash
export SUPABASE_DB_PASSWORD=your_secure_password
# If not set, a random password will be generated
```

## Quick Start

### Complete Deployment (Recommended)
```bash
# Set all required environment variables
export VERCEL_TOKEN=your_vercel_token
export SUPABASE_ACCESS_TOKEN=your_supabase_token
export SUPABASE_ORG_ID=your_org_id

# Deploy everything
npm run deploy:full
```

This will:
1. ✅ Create production Supabase project
2. ✅ Run all database migrations
3. ✅ Setup Row Level Security policies
4. ✅ Create Vercel project with correct environment variables
5. ✅ Deploy the application
6. ✅ Wait for deployment to complete
7. ✅ Provide all URLs and credentials

### Individual Services

#### Supabase Only
```bash
export SUPABASE_ACCESS_TOKEN=your_token
export SUPABASE_ORG_ID=your_org_id
npm run deploy:supabase
```

#### Vercel Only
```bash
export VERCEL_TOKEN=your_token
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
export SUPABASE_SERVICE_ROLE_KEY=your_service_key
npm run deploy:vercel
```

## What Gets Automated

### 🗄️ Supabase Setup (`scripts/setup-supabase.js`)
- Creates production Supabase project
- Waits for database to be ready
- Runs all migrations from `supabase/migrations/`
- Sets up Row Level Security policies
- Generates environment variables

### 🌐 Vercel Deployment (`scripts/deploy-vercel.js`)
- Creates Vercel project linked to GitHub
- Configures Next.js build settings
- Sets environment variables
- Triggers deployment
- Monitors deployment status

### 🚀 Full Orchestration (`scripts/deploy-full.js`)
- Combines both services
- Ensures correct environment variable flow
- Provides complete deployment verification

## Generated Files

After running the scripts, you'll find:

- `.env.production` - Production environment variables
- Console output with all URLs and keys

## Features

### ✅ Complete Automation
- Zero manual dashboard clicks
- Reproducible deployments
- Error handling and retry logic

### ✅ Environment Management
- Automatic environment variable configuration
- Production-ready security settings
- Database password generation

### ✅ Database Setup
- All migrations applied automatically
- RLS policies configured
- Production-ready schema

### ✅ Monitoring
- Real-time deployment status
- Build log monitoring
- Health checks

## Troubleshooting

### Common Issues

1. **Invalid API Token**
   ```
   ❌ VERCEL_TOKEN environment variable is required
   ```
   Solution: Ensure your tokens are valid and properly exported

2. **Organization Not Found**
   ```
   ❌ SUPABASE_ORG_ID environment variable is required
   ```
   Solution: Check your organization ID in the Supabase dashboard URL

3. **Migration Failures**
   ```
   ❌ Migration xxx.sql failed
   ```
   Solution: Check the migration file syntax and database state

4. **Build Failures**
   ```
   ❌ Deployment failed. Check Vercel dashboard for details.
   ```
   Solution: Check build logs in Vercel dashboard

### Debug Mode

Add debug logging by setting:
```bash
export DEBUG=true
```

## Security

### API Tokens
- Store tokens securely (use environment variables)
- Never commit tokens to git
- Rotate tokens regularly

### Database Security
- All tables have Row Level Security enabled
- Service role key is properly scoped
- Production passwords are auto-generated

### Environment Variables
- Production variables are encrypted in Vercel
- No sensitive data in client-side code
- Proper environment separation

## Production URLs

After successful deployment:

- **Frontend**: `https://solefolio.vercel.app`
- **Supabase**: `https://your-project.supabase.co`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/your-id`

## Next Steps

1. **Custom Domain**: Configure `solefolio.com` in Vercel
2. **Monitoring**: Set up error tracking and analytics
3. **Performance**: Monitor Core Web Vitals
4. **Scaling**: Monitor usage and upgrade plans as needed

---

## 🔥 Ready to Launch!

With API-based deployment, SoleFolio can be deployed to production in under 10 minutes with a single command. The entire infrastructure is code-defined and reproducible.

**Time to revolutionize sneaker culture! 👟🚀**