#!/bin/bash

# SoleFolio Deployment Script
# Loads environment variables from .env.deployment and runs deployment

echo "🚀 SoleFolio Deployment Starting..."
echo "===================================="

# Check if .env.deployment file exists
if [ ! -f ".env.deployment" ]; then
    echo "❌ .env.deployment file not found!"
    echo "📝 Please create .env.deployment file with your API tokens:"
    echo "   cp .env.deployment.example .env.deployment"
    echo "   # Edit .env.deployment with your actual tokens"
    exit 1
fi

# Load environment variables from .env.deployment
echo "📄 Loading environment variables from .env.deployment..."
export $(grep -v '^#' .env.deployment | xargs)

# Check if environment variables are set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN not set in .env.deployment"
    exit 1
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ SUPABASE_ACCESS_TOKEN not set in .env.deployment"
    exit 1
fi

if [ -z "$SUPABASE_ORG_ID" ]; then
    echo "❌ SUPABASE_ORG_ID not set in .env.deployment"
    exit 1
fi

echo "✅ All environment variables loaded successfully"
echo "🚀 Starting deployment..."

# Run the deployment
npm run deploy:full