#!/usr/bin/env node

/**
 * SoleFolio Complete Deployment Script
 * 
 * This script orchestrates the complete deployment of SoleFolio:
 * 1. Sets up production Supabase project
 * 2. Deploys to Vercel with correct environment variables
 * 3. Verifies the deployment
 * 
 * Usage:
 * node scripts/deploy-full.js
 */

const { createProject: createSupabaseProject, waitForProject, runMigrations, setupRowLevelSecurity } = require('./setup-supabase');
const { createProject: createVercelProject, deployProject, checkDeploymentStatus } = require('./deploy-vercel');

/**
 * Complete deployment orchestration
 */
async function deployFull() {
  console.log('🚀 SoleFolio Complete Deployment Starting...');
  console.log('==========================================');
  console.log('');

  try {
    // Step 1: Setup Supabase
    console.log('📋 Step 1/3: Setting up production Supabase...');
    console.log('');
    
    const supabaseProject = await createSupabaseProject();
    if (!supabaseProject) {
      throw new Error('Failed to create Supabase project');
    }

    const readyProject = await waitForProject(supabaseProject.id);
    
    const migrationsSuccess = await runMigrations(readyProject);
    if (!migrationsSuccess) {
      throw new Error('Failed to run database migrations');
    }

    const rlsSuccess = await setupRowLevelSecurity(readyProject);
    if (!rlsSuccess) {
      throw new Error('Failed to setup Row Level Security');
    }

    console.log('✅ Supabase setup complete!');
    console.log('');

    // Step 2: Update Vercel config with Supabase credentials
    console.log('📋 Step 2/3: Deploying to Vercel...');
    console.log('');

    // Override environment variables with production Supabase credentials
    process.env.NEXT_PUBLIC_SUPABASE_URL = readyProject.endpoint;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = readyProject.anon_key;
    process.env.SUPABASE_SERVICE_ROLE_KEY = readyProject.service_role_key;

    const vercelProject = await createVercelProject();
    if (!vercelProject) {
      throw new Error('Failed to create Vercel project');
    }

    const deployment = await deployProject(vercelProject.id);
    if (!deployment) {
      throw new Error('Failed to trigger Vercel deployment');
    }

    const deploymentSuccess = await checkDeploymentStatus(deployment.id);
    if (!deploymentSuccess) {
      throw new Error('Vercel deployment failed');
    }

    console.log('✅ Vercel deployment complete!');
    console.log('');

    // Step 3: Verification
    console.log('📋 Step 3/3: Verifying deployment...');
    console.log('');

    console.log('🎉 SoleFolio Successfully Deployed!');
    console.log('==========================================');
    console.log('');
    console.log('🌐 Production URLs:');
    console.log(`   Frontend: https://${deployment.url}`);
    console.log(`   Database: ${readyProject.endpoint}`);
    console.log('');
    console.log('📊 Management Dashboards:');
    console.log(`   Vercel: https://vercel.com/dashboard`);
    console.log(`   Supabase: https://supabase.com/dashboard/project/${readyProject.id}`);
    console.log('');
    console.log('🔑 Environment Variables (for reference):');
    console.log(`   NEXT_PUBLIC_SUPABASE_URL=${readyProject.endpoint}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=${readyProject.anon_key}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY=${readyProject.service_role_key}`);
    console.log('');
    console.log('🔥 SoleFolio is now LIVE! Time to revolutionize sneaker culture! 👟🚀');

  } catch (error) {
    console.error('');
    console.error('❌ Deployment failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting tips:');
    console.error('1. Check your API tokens are valid');
    console.error('2. Verify your environment variables');
    console.error('3. Check the individual service dashboards');
    console.error('4. Review the error message above for specific details');
    process.exit(1);
  }
}

// Run full deployment if script is executed directly
if (require.main === module) {
  deployFull();
}

module.exports = { deployFull };