-- Notifications table for real-time user notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'offer_received',
    'offer_accepted', 
    'offer_declined',
    'offer_withdrawn',
    'new_follower',
    'price_drop',
    'new_sneaker'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can create notifications for any user
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON public.notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create notifications for offers
CREATE OR REPLACE FUNCTION create_offer_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- New offer received
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    SELECT 
      NEW.seller_id,
      'offer_received',
      'New Offer Received',
      CONCAT(u.username, ' made a $', NEW.amount, ' offer on your ', s.brand, ' ', s.model),
      jsonb_build_object(
        'offer_id', NEW.id,
        'buyer_id', NEW.buyer_id,
        'amount', NEW.amount,
        'sneaker_name', CONCAT(s.brand, ' ', s.model)
      )
    FROM public.users u, public.user_sneakers us, public.sneakers s
    WHERE u.id = NEW.buyer_id 
    AND us.id = NEW.user_sneaker_id 
    AND s.id = us.sneaker_id;
    
    RETURN NEW;
  
  -- Offer status changed
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      SELECT 
        NEW.buyer_id,
        'offer_accepted',
        'Offer Accepted! 🎉',
        CONCAT(u.username, ' accepted your offer for ', s.brand, ' ', s.model),
        jsonb_build_object(
          'offer_id', NEW.id,
          'seller_id', NEW.seller_id,
          'amount', NEW.amount,
          'sneaker_name', CONCAT(s.brand, ' ', s.model)
        )
      FROM public.users u, public.user_sneakers us, public.sneakers s
      WHERE u.id = NEW.seller_id 
      AND us.id = NEW.user_sneaker_id 
      AND s.id = us.sneaker_id;
    
    ELSIF NEW.status = 'declined' THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      SELECT 
        NEW.buyer_id,
        'offer_declined',
        'Offer Declined',
        CONCAT(u.username, ' declined your offer for ', s.brand, ' ', s.model),
        jsonb_build_object(
          'offer_id', NEW.id,
          'seller_id', NEW.seller_id,
          'amount', NEW.amount,
          'sneaker_name', CONCAT(s.brand, ' ', s.model)
        )
      FROM public.users u, public.user_sneakers us, public.sneakers s
      WHERE u.id = NEW.seller_id 
      AND us.id = NEW.user_sneaker_id 
      AND s.id = us.sneaker_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply notification triggers
CREATE TRIGGER create_offer_notifications_trigger
  AFTER INSERT OR UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION create_offer_notifications();

-- Function to create follow notifications
CREATE OR REPLACE FUNCTION create_follow_notifications()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    SELECT 
      NEW.following_id,
      'new_follower',
      'New Follower',
      CONCAT(u.username, ' started following you'),
      jsonb_build_object(
        'follower_id', NEW.follower_id,
        'follower_username', u.username
      )
    FROM public.users u
    WHERE u.id = NEW.follower_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply follow notification trigger
CREATE TRIGGER create_follow_notifications_trigger
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION create_follow_notifications();