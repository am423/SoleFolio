#!/usr/bin/env node

/**
 * Get Supabase project API keys
 */

const https = require('https');

const config = {
  supabaseToken: process.env.SUPABASE_ACCESS_TOKEN,
  projectId: 'xzemyuansjrvpjtzsydu'
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

async function getProjectKeys() {
  console.log('🔑 Getting Supabase project API keys...');
  
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${config.projectId}/api-keys`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.supabaseToken}`
    }
  };

  try {
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ API Keys:');
      
      const keys = response.data;
      const anonKey = keys.find(k => k.name === 'anon')?.api_key;
      const serviceKey = keys.find(k => k.name === 'service_role')?.api_key;
      
      console.log('');
      console.log('🌐 Project URL: https://xzemyuansjrvpjtzsydu.supabase.co');
      console.log('🔑 Anon Key:', anonKey);
      console.log('🔐 Service Role Key:', serviceKey);
      console.log('');
      console.log('📝 Environment variables for Vercel:');
      console.log('=====================================');
      console.log(`NEXT_PUBLIC_SUPABASE_URL=https://xzemyuansjrvpjtzsydu.supabase.co`);
      console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`);
      console.log(`SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`);
      
    } else {
      console.error('❌ Failed to get API keys:', response.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getProjectKeys();