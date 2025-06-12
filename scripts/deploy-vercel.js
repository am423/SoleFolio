#!/usr/bin/env node

/**
 * SoleFolio Vercel Deployment Script
 * 
 * This script automates the deployment of SoleFolio to Vercel using their API.
 * 
 * Prerequisites:
 * 1. Vercel account with API token
 * 2. GitHub repository accessible to Vercel
 * 3. Environment variables ready
 * 
 * Usage:
 * node scripts/deploy-vercel.js
 */

const https = require('https');
const fs = require('fs');

// Configuration
const config = {
  vercelToken: process.env.VERCEL_TOKEN || '', // Set your Vercel token
  githubRepo: 'am423/SoleFolio',
  projectName: 'solefolio',
  framework: 'nextjs',
  buildCommand: 'npm run build',
  outputDirectory: '.next',
  installCommand: 'npm install',
  envVars: {
    // These will be set as environment variables in Vercel
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    NEXT_PUBLIC_APP_URL: 'https://solefolio.vercel.app' // Will be updated after deployment
  }
};

/**
 * Make HTTP request to Vercel API
 */
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

/**
 * Create Vercel project
 */
async function createProject() {
  console.log('🚀 Creating Vercel project...');
  
  const options = {
    hostname: 'api.vercel.com',
    path: '/v10/projects',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.vercelToken}`,
      'Content-Type': 'application/json'
    }
  };

  const projectData = {
    name: config.projectName,
    framework: config.framework,
    buildCommand: config.buildCommand,
    outputDirectory: config.outputDirectory,
    installCommand: config.installCommand,
    publicSource: false,
    environmentVariables: Object.entries(config.envVars).map(([key, value]) => ({
      key,
      value,
      type: 'encrypted',
      target: ['production', 'preview', 'development']
    }))
  };

  try {
    const response = await makeRequest(options, projectData);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Project created successfully!');
      console.log(`📱 Project ID: ${response.data.id}`);
      console.log(`🌐 URL: https://${response.data.name}.vercel.app`);
      return response.data;
    } else {
      console.error('❌ Failed to create project:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    return null;
  }
}

/**
 * Deploy the project
 */
async function deployProject(projectId) {
  console.log('🚀 Triggering deployment...');
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v13/deployments`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.vercelToken}`,
      'Content-Type': 'application/json'
    }
  };

  const deploymentData = {
    name: config.projectName,
    projectSettings: {
      framework: config.framework,
      buildCommand: config.buildCommand,
      outputDirectory: config.outputDirectory,
      installCommand: config.installCommand
    }
  };

  try {
    const response = await makeRequest(options, deploymentData);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Deployment triggered successfully!');
      console.log(`🚀 Deployment ID: ${response.data.id}`);
      console.log(`🌐 URL: ${response.data.url}`);
      return response.data;
    } else {
      console.error('❌ Failed to deploy:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error deploying:', error.message);
    return null;
  }
}

/**
 * Check deployment status
 */
async function checkDeploymentStatus(deploymentId) {
  console.log('📊 Checking deployment status...');
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v13/deployments/${deploymentId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.vercelToken}`
    }
  };

  try {
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      const status = response.data.readyState;
      console.log(`📈 Deployment status: ${status}`);
      
      if (status === 'READY') {
        console.log('🎉 Deployment completed successfully!');
        console.log(`🌐 Live URL: https://${response.data.url}`);
        return true;
      } else if (status === 'ERROR') {
        console.log('❌ Deployment failed!');
        return false;
      } else {
        console.log('⏳ Deployment in progress...');
        // Wait and check again
        await new Promise(resolve => setTimeout(resolve, 10000));
        return checkDeploymentStatus(deploymentId);
      }
    } else {
      console.error('❌ Failed to check status:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
    return false;
  }
}

/**
 * Main deployment function
 */
async function main() {
  console.log('🔥 SoleFolio Vercel Deployment Starting...');
  console.log('=====================================');
  
  // Validate configuration
  if (!config.vercelToken) {
    console.error('❌ VERCEL_TOKEN environment variable is required');
    console.log('💡 Get your token from: https://vercel.com/account/tokens');
    process.exit(1);
  }

  if (!config.envVars.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Supabase environment variables are required');
    console.log('💡 Set up your Supabase project first');
    process.exit(1);
  }

  try {
    // Create project
    const project = await createProject();
    if (!project) {
      console.error('❌ Failed to create project');
      process.exit(1);
    }

    // Deploy project
    const deployment = await deployProject(project.id);
    if (!deployment) {
      console.error('❌ Failed to trigger deployment');
      process.exit(1);
    }

    // Check deployment status
    const success = await checkDeploymentStatus(deployment.id);
    
    if (success) {
      console.log('');
      console.log('🎉 SoleFolio Successfully Deployed!');
      console.log('=====================================');
      console.log(`🌐 Production URL: https://${deployment.url}`);
      console.log('📊 Vercel Dashboard: https://vercel.com/dashboard');
      console.log('');
      console.log('🔥 Your Instagram for sneakerheads is now LIVE! 👟');
    } else {
      console.error('❌ Deployment failed. Check Vercel dashboard for details.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

// Run deployment if script is executed directly
if (require.main === module) {
  main();
}

module.exports = { createProject, deployProject, checkDeploymentStatus };