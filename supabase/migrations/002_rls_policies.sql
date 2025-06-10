-- Row Level Security Policies

-- Users table policies
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Sneakers table policies (read-only for most users)
CREATE POLICY "Anyone can view sneakers" ON public.sneakers
  FOR SELECT USING (true);

-- User sneakers policies
CREATE POLICY "Anyone can view user sneakers" ON public.user_sneakers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own sneakers" ON public.user_sneakers
  FOR ALL USING (auth.uid() = user_id);

-- Offers policies
CREATE POLICY "Users can view offers they're involved in" ON public.offers
  FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
  );

CREATE POLICY "Users can create offers" ON public.offers
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update offers on their items" ON public.offers
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can update their own offers" ON public.offers
  FOR UPDATE USING (auth.uid() = buyer_id);

-- Follows policies
CREATE POLICY "Anyone can view follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Activity feed policies
CREATE POLICY "Users can view activity from people they follow" ON public.activity_feed
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follower_id = auth.uid() 
      AND following_id = activity_feed.user_id
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create their own activity" ON public.activity_feed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Watchlists policies
CREATE POLICY "Users can view their own watchlists" ON public.watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watchlists" ON public.watchlists
  FOR ALL USING (auth.uid() = user_id);

-- Price history policies (read-only for all)
CREATE POLICY "Anyone can view price history" ON public.price_history
  FOR SELECT USING (true);