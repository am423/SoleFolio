#!/usr/bin/env node

/**
 * Run Supabase migrations via API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const config = {
  supabaseToken: process.env.SUPABASE_ACCESS_TOKEN,
  projectId: 'xzemyuansjrvpjtzsydu'
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

async function runSQLQuery(sql, description) {
  console.log(`📤 Running: ${description}`);
  
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${config.projectId}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.supabaseToken}`,
      'Content-Type': 'application/json'
    }
  };

  const queryData = {
    query: sql
  };

  try {
    const response = await makeRequest(options, queryData);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log(`✅ ${description} completed successfully`);
      return true;
    } else {
      console.error(`❌ ${description} failed:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error running ${description}:`, error.message);
    return false;
  }
}

async function runMigrations() {
  console.log('🗃️  Running Supabase migrations via API...');
  console.log('==========================================');
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('❌ No migrations directory found');
    return false;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('❌ No migration files found');
    return false;
  }

  console.log(`📄 Found ${migrationFiles.length} migration files`);
  console.log('');

  for (const file of migrationFiles) {
    const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const success = await runSQLQuery(migrationSQL, `Migration ${file}`);
    
    if (!success) {
      console.error(`❌ Migration ${file} failed - stopping`);
      return false;
    }
    
    // Wait a bit between migrations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('');
  console.log('🎉 All migrations completed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Test your live application at https://solefolio.vercel.app');
  console.log('2. Create test user accounts');
  console.log('3. Test core functionality (auth, profiles, offers)');
  
  return true;
}

async function main() {
  if (!config.supabaseToken) {
    console.error('❌ SUPABASE_ACCESS_TOKEN environment variable is required');
    process.exit(1);
  }

  const success = await runMigrations();
  
  if (!success) {
    console.error('❌ Migration failed');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}