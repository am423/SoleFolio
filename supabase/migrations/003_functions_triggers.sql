-- Database functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sneakers_updated_at 
  BEFORE UPDATE ON public.sneakers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sneakers_updated_at 
  BEFORE UPDATE ON public.user_sneakers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at 
  BEFORE UPDATE ON public.offers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user counts
CREATE OR REPLACE FUNCTION update_user_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update follower counts
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.following_id;
    
    UPDATE public.users 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users 
    SET follower_count = follower_count - 1 
    WHERE id = OLD.following_id;
    
    UPDATE public.users 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_follow_counts
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION update_user_counts();

-- Function to update sneaker counts
CREATE OR REPLACE FUNCTION update_sneaker_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users 
    SET sneaker_count = sneaker_count + 1 
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users 
    SET sneaker_count = sneaker_count - 1 
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_sneaker_counts
  AFTER INSERT OR DELETE ON public.user_sneakers
  FOR EACH ROW EXECUTE FUNCTION update_sneaker_counts();

-- Function to automatically expire old offers
CREATE OR REPLACE FUNCTION expire_old_offers()
RETURNS void AS $$
BEGIN
  UPDATE public.offers 
  SET status = 'expired'
  WHERE status = 'pending' 
  AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to create activity feed items
CREATE OR REPLACE FUNCTION create_activity_feed_item()
RETURNS TRIGGER AS $$
BEGIN
  -- New sneaker added
  IF TG_TABLE_NAME = 'user_sneakers' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_feed (type, user_id, user_sneaker_id)
    VALUES ('new_sneaker', NEW.user_id, NEW.id);
  
  -- New follow
  ELSIF TG_TABLE_NAME = 'follows' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_feed (type, user_id, target_user_id)
    VALUES ('new_follow', NEW.follower_id, NEW.following_id);
  
  -- Offer received
  ELSIF TG_TABLE_NAME = 'offers' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_feed (type, user_id, target_user_id, offer_id, user_sneaker_id)
    VALUES ('offer_received', NEW.seller_id, NEW.buyer_id, NEW.id, NEW.user_sneaker_id);
  
  -- Offer status changed
  ELSIF TG_TABLE_NAME = 'offers' AND TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.activity_feed (type, user_id, target_user_id, offer_id, user_sneaker_id)
      VALUES ('offer_accepted', NEW.buyer_id, NEW.seller_id, NEW.id, NEW.user_sneaker_id);
    ELSIF NEW.status = 'declined' THEN
      INSERT INTO public.activity_feed (type, user_id, target_user_id, offer_id, user_sneaker_id)
      VALUES ('offer_declined', NEW.buyer_id, NEW.seller_id, NEW.id, NEW.user_sneaker_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply activity feed triggers
CREATE TRIGGER create_activity_on_sneaker_add
  AFTER INSERT ON public.user_sneakers
  FOR EACH ROW EXECUTE FUNCTION create_activity_feed_item();

CREATE TRIGGER create_activity_on_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION create_activity_feed_item();

CREATE TRIGGER create_activity_on_offer
  AFTER INSERT OR UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION create_activity_feed_item();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to get user's feed
CREATE OR REPLACE FUNCTION get_user_feed(user_uuid UUID, limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
RETURNS TABLE (
  id UUID,
  type activity_type,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  target_user_id UUID,
  target_username TEXT,
  sneaker_brand TEXT,
  sneaker_model TEXT,
  sneaker_colorway TEXT,
  sneaker_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    af.id,
    af.type,
    af.user_id,
    u.username,
    u.avatar_url,
    af.target_user_id,
    tu.username as target_username,
    s.brand as sneaker_brand,
    s.model as sneaker_model,
    s.colorway as sneaker_colorway,
    s.image_url as sneaker_image,
    af.created_at
  FROM public.activity_feed af
  LEFT JOIN public.users u ON af.user_id = u.id
  LEFT JOIN public.users tu ON af.target_user_id = tu.id
  LEFT JOIN public.user_sneakers us ON af.user_sneaker_id = us.id
  LEFT JOIN public.sneakers s ON us.sneaker_id = s.id
  WHERE af.user_id IN (
    SELECT following_id 
    FROM public.follows 
    WHERE follower_id = user_uuid
  )
  OR af.user_id = user_uuid
  ORDER BY af.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ language 'plpgsql' SECURITY DEFINER;