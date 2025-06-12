-- Add parent_offer_id column to offers table for counter-offers
ALTER TABLE public.offers 
ADD COLUMN parent_offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL;

-- Create index for parent offer relationships
CREATE INDEX idx_offers_parent_offer_id ON public.offers(parent_offer_id);

-- Add comment for clarity
COMMENT ON COLUMN public.offers.parent_offer_id IS 'Reference to the original offer if this is a counter-offer';

-- Function to get offer chain (original offer and all counter-offers)
CREATE OR REPLACE FUNCTION get_offer_chain(offer_uuid UUID)
RETURNS TABLE (
  id UUID,
  amount DECIMAL(10,2),
  message TEXT,
  status offer_status,
  buyer_username TEXT,
  seller_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  is_counter_offer BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE offer_chain AS (
    -- Base case: find the root offer (no parent)
    SELECT 
      o.id,
      o.amount,
      o.message,
      o.status,
      buyer.username as buyer_username,
      seller.username as seller_username,
      o.created_at,
      FALSE as is_counter_offer,
      0 as level
    FROM public.offers o
    LEFT JOIN public.users buyer ON o.buyer_id = buyer.id
    LEFT JOIN public.users seller ON o.seller_id = seller.id
    WHERE o.id = offer_uuid AND o.parent_offer_id IS NULL
    
    UNION ALL
    
    -- Recursive case: find counter-offers
    SELECT 
      o.id,
      o.amount,
      o.message,
      o.status,
      buyer.username as buyer_username,
      seller.username as seller_username,
      o.created_at,
      TRUE as is_counter_offer,
      oc.level + 1
    FROM public.offers o
    LEFT JOIN public.users buyer ON o.buyer_id = buyer.id
    LEFT JOIN public.users seller ON o.seller_id = seller.id
    JOIN offer_chain oc ON o.parent_offer_id = oc.id
  )
  SELECT 
    oc.id,
    oc.amount,
    oc.message,
    oc.status,
    oc.buyer_username,
    oc.seller_username,
    oc.created_at,
    oc.is_counter_offer
  FROM offer_chain oc
  ORDER BY oc.level, oc.created_at;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Update the notification trigger to handle counter-offers
CREATE OR REPLACE FUNCTION create_offer_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- New offer received
  IF TG_OP = 'INSERT' THEN
    -- Determine if this is a counter-offer
    IF NEW.parent_offer_id IS NOT NULL THEN
      -- Counter-offer notification
      INSERT INTO public.notifications (user_id, type, title, message, data)
      SELECT 
        NEW.seller_id,
        'offer_received',
        'Counter-Offer Received',
        CONCAT(u.username, ' sent a $', NEW.amount, ' counter-offer for your ', s.brand, ' ', s.model),
        jsonb_build_object(
          'offer_id', NEW.id,
          'buyer_id', NEW.buyer_id,
          'amount', NEW.amount,
          'sneaker_name', CONCAT(s.brand, ' ', s.model),
          'is_counter_offer', true,
          'parent_offer_id', NEW.parent_offer_id
        )
      FROM public.users u, public.user_sneakers us, public.sneakers s
      WHERE u.id = NEW.buyer_id 
      AND us.id = NEW.user_sneaker_id 
      AND s.id = us.sneaker_id;
    ELSE
      -- Regular offer notification
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
          'sneaker_name', CONCAT(s.brand, ' ', s.model),
          'is_counter_offer', false
        )
      FROM public.users u, public.user_sneakers us, public.sneakers s
      WHERE u.id = NEW.buyer_id 
      AND us.id = NEW.user_sneaker_id 
      AND s.id = us.sneaker_id;
    END IF;
    
    RETURN NEW;
  
  -- Offer status changed
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      SELECT 
        NEW.buyer_id,
        'offer_accepted',
        CASE 
          WHEN NEW.parent_offer_id IS NOT NULL THEN 'Counter-Offer Accepted! 🎉'
          ELSE 'Offer Accepted! 🎉'
        END,
        CONCAT(u.username, ' accepted your ', 
          CASE WHEN NEW.parent_offer_id IS NOT NULL THEN 'counter-offer' ELSE 'offer' END,
          ' for ', s.brand, ' ', s.model),
        jsonb_build_object(
          'offer_id', NEW.id,
          'seller_id', NEW.seller_id,
          'amount', NEW.amount,
          'sneaker_name', CONCAT(s.brand, ' ', s.model),
          'is_counter_offer', CASE WHEN NEW.parent_offer_id IS NOT NULL THEN true ELSE false END
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
        CASE 
          WHEN NEW.parent_offer_id IS NOT NULL THEN 'Counter-Offer Declined'
          ELSE 'Offer Declined'
        END,
        CONCAT(u.username, ' declined your ', 
          CASE WHEN NEW.parent_offer_id IS NOT NULL THEN 'counter-offer' ELSE 'offer' END,
          ' for ', s.brand, ' ', s.model),
        jsonb_build_object(
          'offer_id', NEW.id,
          'seller_id', NEW.seller_id,
          'amount', NEW.amount,
          'sneaker_name', CONCAT(s.brand, ' ', s.model),
          'is_counter_offer', CASE WHEN NEW.parent_offer_id IS NOT NULL THEN true ELSE false END
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