#!/usr/bin/env node

/**
 * Update Vercel environment variables
 */

const https = require('https');

const config = {
  vercelToken: process.env.VERCEL_TOKEN,
  projectId: 'prj_pljlyDlFiAlPm9bFQbDfiHTekQFt',
  envVars: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://xzemyuansjrvpjtzsydu.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZW15dWFuc2pydnBqdHpzeWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzM4MTAsImV4cCI6MjA2NTMwOTgxMH0.WrLdQIKBafeqrQ5um10OJwtodyxLhYxG-ipw1sHGxRE',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZW15dWFuc2pydnBqdHpzeWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczMzgxMCwiZXhwIjoyMDY1MzA5ODEwfQ.FGugPR2lLxkIyw53726wOijxLEg1PDQiv5N4fhiOtfA',
    NEXT_PUBLIC_APP_URL: 'https://solefolio.vercel.app'
  }
};

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

async function addEnvironmentVariable(key, value) {
  console.log(`📝 Adding environment variable: ${key}`);
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${config.projectId}/env`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.vercelToken}`,
      'Content-Type': 'application/json'
    }
  };

  const envData = {
    key,
    value,
    type: 'encrypted',
    target: ['production', 'preview', 'development']
  };

  try {
    const response = await makeRequest(options, envData);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log(`✅ ${key} added successfully`);
      return true;
    } else {
      console.error(`❌ Failed to add ${key}:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error adding ${key}:`, error.message);
    return false;
  }
}

async function updateEnvironmentVariables() {
  console.log('🔧 Updating Vercel environment variables...');
  console.log('==========================================');
  
  for (const [key, value] of Object.entries(config.envVars)) {
    await addEnvironmentVariable(key, value);
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('');
  console.log('✅ Environment variables updated!');
  console.log('🔄 Triggering new deployment...');
}

async function triggerDeployment() {
  console.log('🚀 Triggering new deployment...');
  
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
    name: 'solefolio',
    gitRepository: {
      type: 'github',
      repo: 'am423/SoleFolio'
    }
  };

  try {
    const response = await makeRequest(options, deploymentData);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Deployment triggered successfully!');
      console.log(`🚀 Deployment ID: ${response.data.id}`);
      console.log(`🌐 URL: ${response.data.url}`);
      return true;
    } else {
      console.error('❌ Failed to trigger deployment:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error triggering deployment:', error.message);
    return false;
  }
}

async function main() {
  if (!config.vercelToken) {
    console.error('❌ VERCEL_TOKEN environment variable is required');
    process.exit(1);
  }

  await updateEnvironmentVariables();
  await triggerDeployment();
  
  console.log('');
  console.log('🎉 Environment variables updated and deployment triggered!');
  console.log('🌐 Check status at: https://vercel.com/dashboard');
}

if (require.main === module) {
  main();
}