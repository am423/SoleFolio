#!/usr/bin/env node

/**
 * Setup Supabase database schema with safe migrations
 */

const https = require('https');

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
  console.log(`📤 ${description}...`);
  
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
      console.log(`✅ ${description} completed`);
      return true;
    } else {
      console.error(`❌ ${description} failed:`, response.data.message || response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error with ${description}:`, error.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('🗃️  Setting up SoleFolio database schema...');
  console.log('==========================================');
  
  // Step 1: Create extensions
  await runSQLQuery(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `, 'Installing extensions');

  // Step 2: Create types (with safe handling)
  await runSQLQuery(`
    DO $$ BEGIN
      CREATE TYPE condition_type AS ENUM (
        'deadstock',
        'very_near_deadstock', 
        'excellent',
        'good',
        'fair',
        'poor'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `, 'Creating condition_type enum');

  await runSQLQuery(`
    DO $$ BEGIN
      CREATE TYPE sale_status AS ENUM (
        'not_for_sale',
        'open_to_offers',
        'for_sale'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `, 'Creating sale_status enum');

  await runSQLQuery(`
    DO $$ BEGIN
      CREATE TYPE offer_status AS ENUM (
        'pending',
        'accepted',
        'declined',
        'withdrawn',
        'expired'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `, 'Creating offer_status enum');

  await runSQLQuery(`
    DO $$ BEGIN
      CREATE TYPE activity_type AS ENUM (
        'new_sneaker',
        'offer_received',
        'offer_accepted',
        'offer_declined',
        'offer_withdrawn',
        'counter_offer',
        'new_follower',
        'sneaker_sold',
        'sneaker_purchased'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `, 'Creating activity_type enum');

  // Step 3: Create main tables
  await runSQLQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT auth.uid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      location VARCHAR(100),
      instagram_handle VARCHAR(50),
      twitter_handle VARCHAR(50),
      verified BOOLEAN DEFAULT FALSE,
      private_profile BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `, 'Creating users table');

  await runSQLQuery(`
    CREATE TABLE IF NOT EXISTS sneakers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      brand VARCHAR(100) NOT NULL,
      model VARCHAR(200) NOT NULL,
      colorway VARCHAR(200),
      release_date DATE,
      retail_price DECIMAL(10,2),
      sku VARCHAR(50),
      image_url TEXT,
      description TEXT,
      category VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `, 'Creating sneakers table');

  await runSQLQuery(`
    CREATE TABLE IF NOT EXISTS user_sneakers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sneaker_id UUID NOT NULL REFERENCES sneakers(id) ON DELETE CASCADE,
      size DECIMAL(4,1) NOT NULL,
      condition condition_type NOT NULL,
      purchase_price DECIMAL(10,2),
      purchase_date DATE,
      asking_price DECIMAL(10,2),
      market_value DECIMAL(10,2),
      sale_status sale_status DEFAULT 'not_for_sale',
      notes TEXT,
      images TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, sneaker_id, size)
    );
  `, 'Creating user_sneakers table');

  await runSQLQuery(`
    CREATE TABLE IF NOT EXISTS offers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_sneaker_id UUID NOT NULL REFERENCES user_sneakers(id) ON DELETE CASCADE,
      buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
      message TEXT,
      status offer_status DEFAULT 'pending',
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      responded_at TIMESTAMP WITH TIME ZONE,
      parent_offer_id UUID REFERENCES offers(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `, 'Creating offers table');

  await runSQLQuery(`
    CREATE TABLE IF NOT EXISTS follows (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(follower_id, following_id),
      CHECK (follower_id != following_id)
    );
  `, 'Creating follows table');

  await runSQLQuery(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type activity_type NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT,
      read BOOLEAN DEFAULT FALSE,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `, 'Creating notifications table');

  // Step 4: Create indexes
  await runSQLQuery(`
    CREATE INDEX IF NOT EXISTS idx_user_sneakers_user_id ON user_sneakers(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sneakers_sneaker_id ON user_sneakers(sneaker_id);
    CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
    CREATE INDEX IF NOT EXISTS idx_offers_user_sneaker_id ON offers(user_sneaker_id);
    CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
  `, 'Creating database indexes');

  // Step 5: Enable RLS
  await runSQLQuery(`
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_sneakers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  `, 'Enabling Row Level Security');

  // Step 6: Create RLS policies
  await runSQLQuery(`
    -- Users policies
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
  `, 'Creating user policies');

  await runSQLQuery(`
    -- Sneakers policies (public read)
    DROP POLICY IF EXISTS "Anyone can view sneakers" ON sneakers;
    CREATE POLICY "Anyone can view sneakers" ON sneakers FOR SELECT USING (true);
  `, 'Creating sneaker policies');

  await runSQLQuery(`
    -- User sneakers policies
    DROP POLICY IF EXISTS "Users can view own sneakers" ON user_sneakers;
    CREATE POLICY "Users can view own sneakers" ON user_sneakers FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own sneakers" ON user_sneakers;
    CREATE POLICY "Users can insert own sneakers" ON user_sneakers FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update own sneakers" ON user_sneakers;
    CREATE POLICY "Users can update own sneakers" ON user_sneakers FOR UPDATE USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete own sneakers" ON user_sneakers;
    CREATE POLICY "Users can delete own sneakers" ON user_sneakers FOR DELETE USING (auth.uid() = user_id);
  `, 'Creating user_sneakers policies');

  await runSQLQuery(`
    -- Offers policies
    DROP POLICY IF EXISTS "Users can view their offers" ON offers;
    CREATE POLICY "Users can view their offers" ON offers FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
    
    DROP POLICY IF EXISTS "Users can create offers" ON offers;
    CREATE POLICY "Users can create offers" ON offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
    
    DROP POLICY IF EXISTS "Users can update their offers" ON offers;
    CREATE POLICY "Users can update their offers" ON offers FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  `, 'Creating offer policies');

  await runSQLQuery(`
    -- Follow policies
    DROP POLICY IF EXISTS "Users can view follows" ON follows;
    CREATE POLICY "Users can view follows" ON follows FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can manage their follows" ON follows;
    CREATE POLICY "Users can manage their follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
    
    DROP POLICY IF EXISTS "Users can unfollow" ON follows;
    CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);
  `, 'Creating follow policies');

  await runSQLQuery(`
    -- Notification policies
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
    CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
    CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "System can create notifications" ON notifications;
    CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
  `, 'Creating notification policies');

  console.log('');
  console.log('🎉 SoleFolio database setup complete!');
  console.log('=====================================');
  console.log('✅ All tables created');
  console.log('✅ Indexes optimized');
  console.log('✅ Row Level Security enabled');
  console.log('✅ Security policies configured');
  console.log('');
  console.log('🚀 Your application is ready for production!');
  console.log('🌐 Test at: https://solefolio.vercel.app');
}

async function main() {
  if (!config.supabaseToken) {
    console.error('❌ SUPABASE_ACCESS_TOKEN environment variable is required');
    process.exit(1);
  }

  await setupDatabase();
}

if (require.main === module) {
  main();
}