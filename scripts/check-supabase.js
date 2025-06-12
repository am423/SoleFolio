#!/usr/bin/env node

/**
 * Check current Supabase projects
 */

const https = require('https');

const config = {
  supabaseToken: process.env.SUPABASE_ACCESS_TOKEN,
  organizationId: process.env.SUPABASE_ORG_ID
};

function makeRequest(options) {
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
    req.end();
  });
}

async function checkProjects() {
  console.log('🔍 Checking current Supabase projects...');
  
  const options = {
    hostname: 'api.supabase.com',
    path: '/v1/projects',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.supabaseToken}`
    }
  };

  try {
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Projects found:');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      console.error('❌ Failed to get projects:', response.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProjects();