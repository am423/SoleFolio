-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE condition_type AS ENUM (
  'deadstock',
  'very_near_deadstock', 
  'excellent',
  'good',
  'fair',
  'poor'
);

CREATE TYPE sale_status AS ENUM (
  'not_for_sale',
  'open_to_offers',
  'for_sale'
);

CREATE TYPE offer_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'withdrawn',
  'expired'
);

CREATE TYPE activity_type AS ENUM (
  'new_sneaker',
  'price_drop',
  'sold',
  'new_follow',
  'offer_received',
  'offer_accepted',
  'offer_declined'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  instagram_handle TEXT,
  website_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  sneaker_count INTEGER DEFAULT 0,
  total_collection_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sneakers master database
CREATE TABLE public.sneakers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  colorway TEXT NOT NULL,
  style_code TEXT UNIQUE,
  release_date DATE,
  retail_price DECIMAL(10,2),
  description TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'lifestyle',
  gender TEXT DEFAULT 'unisex',
  sizes_available TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's sneaker collection
CREATE TABLE public.user_sneakers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sneaker_id UUID REFERENCES public.sneakers(id) ON DELETE CASCADE NOT NULL,
  size TEXT NOT NULL,
  condition condition_type NOT NULL DEFAULT 'excellent',
  status sale_status NOT NULL DEFAULT 'not_for_sale',
  asking_price DECIMAL(10,2),
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  story TEXT,
  images TEXT[] DEFAULT '{}',
  is_grail BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  market_value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, sneaker_id, size)
);

-- Offers system
CREATE TABLE public.offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_sneaker_id UUID REFERENCES public.user_sneakers(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status offer_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (amount > 0),
  CHECK (buyer_id != seller_id)
);

-- Social following system
CREATE TABLE public.follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Activity feed
CREATE TABLE public.activity_feed (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type activity_type NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_sneaker_id UUID REFERENCES public.user_sneakers(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlists (users can watch specific sneakers for price drops)
CREATE TABLE public.watchlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sneaker_id UUID REFERENCES public.sneakers(id) ON DELETE CASCADE NOT NULL,
  size TEXT,
  max_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, sneaker_id, size)
);

-- Price history for market tracking
CREATE TABLE public.price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sneaker_id UUID REFERENCES public.sneakers(id) ON DELETE CASCADE NOT NULL,
  size TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL, -- 'solefolio', 'stockx', 'goat', etc.
  condition condition_type NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_sneakers_brand_model ON public.sneakers(brand, model);
CREATE INDEX idx_sneakers_style_code ON public.sneakers(style_code);
CREATE INDEX idx_user_sneakers_user_id ON public.user_sneakers(user_id);
CREATE INDEX idx_user_sneakers_sneaker_id ON public.user_sneakers(sneaker_id);
CREATE INDEX idx_user_sneakers_status ON public.user_sneakers(status);
CREATE INDEX idx_offers_buyer_id ON public.offers(buyer_id);
CREATE INDEX idx_offers_seller_id ON public.offers(seller_id);
CREATE INDEX idx_offers_status ON public.offers(status);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX idx_price_history_sneaker_size ON public.price_history(sneaker_id, size);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sneakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sneakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;