#!/usr/bin/env node

/**
 * Fix Vercel environment variables by getting and updating existing ones
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

async function getEnvironmentVariables() {
  console.log('🔍 Getting current environment variables...');
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${config.projectId}/env`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.vercelToken}`
    }
  };

  try {
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Retrieved environment variables');
      return response.data.envs || [];
    } else {
      console.error('❌ Failed to get environment variables:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting environment variables:', error.message);
    return [];
  }
}

async function updateEnvironmentVariable(envId, key, value) {
  console.log(`📝 Updating environment variable: ${key}`);
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${config.projectId}/env/${envId}`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${config.vercelToken}`,
      'Content-Type': 'application/json'
    }
  };

  const updateData = {
    value,
    type: 'encrypted',
    target: ['production', 'preview', 'development']
  };

  try {
    const response = await makeRequest(options, updateData);
    
    if (response.statusCode === 200) {
      console.log(`✅ ${key} updated successfully`);
      return true;
    } else {
      console.error(`❌ Failed to update ${key}:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${key}:`, error.message);
    return false;
  }
}

async function fixEnvironmentVariables() {
  console.log('🔧 Fixing Vercel environment variables...');
  console.log('========================================');
  
  // Get existing environment variables
  const existingEnvs = await getEnvironmentVariables();
  
  // Update each required environment variable
  for (const [key, value] of Object.entries(config.envVars)) {
    const existingEnv = existingEnvs.find(env => env.key === key);
    
    if (existingEnv) {
      await updateEnvironmentVariable(existingEnv.id, key, value);
    } else {
      console.log(`⚠️  ${key} not found - would need to be created`);
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('');
  console.log('✅ Environment variables fixed!');
  console.log('🔄 Go to Vercel dashboard to trigger new deployment');
  console.log('🌐 https://vercel.com/dashboard');
}

async function main() {
  if (!config.vercelToken) {
    console.error('❌ VERCEL_TOKEN environment variable is required');
    process.exit(1);
  }

  await fixEnvironmentVariables();
}

if (require.main === module) {
  main();
}