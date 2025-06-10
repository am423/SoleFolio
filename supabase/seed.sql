-- Seed data for SoleFolio

-- Insert popular sneakers into the database
INSERT INTO public.sneakers (brand, model, colorway, style_code, release_date, retail_price, description, image_url, category, gender) VALUES
('Nike', 'Air Jordan 1 Retro High OG', 'Chicago', '555088-101', '2015-04-01', 160.00, 'The legendary Chicago colorway that started it all. Red, white, and black perfection.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'basketball', 'unisex'),
('Nike', 'Air Jordan 1 Retro High OG', 'Bred', '555088-001', '2016-09-03', 160.00, 'Classic black and red colorway. A must-have for any sneaker collection.', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500', 'basketball', 'unisex'),
('Nike', 'Air Jordan 1 Retro High OG', 'Royal', '555088-007', '2017-04-01', 160.00, 'Royal blue and black perfection. One of the original colorways.', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500', 'basketball', 'unisex'),
('Nike', 'Dunk Low', 'Panda', 'DD1391-100', '2021-03-10', 100.00, 'Simple black and white colorway that goes with everything.', 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500', 'lifestyle', 'unisex'),
('Nike', 'Air Force 1 Low', 'White', '315122-111', '1982-01-01', 90.00, 'The classic all-white AF1. A timeless icon.', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', 'lifestyle', 'unisex'),
('Adidas', 'Yeezy Boost 350 V2', 'Zebra', 'CP9654', '2017-02-25', 220.00, 'Kanye West''s iconic design with white and black stripes.', 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=500', 'lifestyle', 'unisex'),
('Adidas', 'Stan Smith', 'White Green', 'M20324', '1971-01-01', 80.00, 'The minimalist tennis shoe that became a fashion staple.', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500', 'tennis', 'unisex'),
('New Balance', '550', 'White Grey', 'BB550LM1', '2020-09-01', 100.00, 'Retro basketball shoe with vintage appeal.', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500', 'basketball', 'unisex'),
('Nike', 'Travis Scott x Air Jordan 1 Low', 'Mocha', 'CQ4277-001', '2019-07-25', 130.00, 'Travis Scott collaboration with reverse swoosh design.', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500', 'basketball', 'unisex'),
('Off-White', 'Nike Air Jordan 1', 'Chicago', 'AA3834-101', '2017-09-01', 190.00, 'Virgil Abloh''s deconstructed take on the Chicago Jordan 1.', 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500', 'basketball', 'unisex');

-- Create some sample users (these would normally be created via auth)
-- Note: In production, users are created automatically when they sign up
INSERT INTO public.users (id, username, full_name, bio, location, follower_count, following_count, sneaker_count) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'sneakerhead_mike', 'Mike Johnson', 'Collector of rare Jordans and Yeezys. Always looking for the next grail.', 'Los Angeles, CA', 1250, 500, 47),
('550e8400-e29b-41d4-a716-446655440002', 'sole_sarah', 'Sarah Chen', 'Sneaker photographer and style influencer. DM for collabs.', 'New York, NY', 2100, 800, 32),
('550e8400-e29b-41d4-a716-446655440003', 'jordan_king', 'Alex Rivera', 'Jordan brand enthusiast since day one. OG collector.', 'Chicago, IL', 890, 300, 89),
('550e8400-e29b-41d4-a716-446655440004', 'yeezy_queen', 'Emma Davis', 'Yeezy specialist. Have every colorway released.', 'Atlanta, GA', 1540, 400, 28);

-- Add some sneakers to user collections
INSERT INTO public.user_sneakers (user_id, sneaker_id, size, condition, status, asking_price, story, is_grail) VALUES
-- Mike's collection
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.sneakers WHERE style_code = '555088-101'), '10.5', 'deadstock', 'not_for_sale', NULL, 'My first Jordan 1. Been looking for these since I was 16.', true),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.sneakers WHERE style_code = 'CP9654'), '10', 'excellent', 'open_to_offers', NULL, 'Copped on release day. Wore them a few times but kept them clean.', false),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.sneakers WHERE style_code = 'DD1391-100'), '10.5', 'very_near_deadstock', 'for_sale', 150.00, 'Great beaters but I have too many dunks now.', false),

-- Sarah's collection  
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.sneakers WHERE style_code = '555088-001'), '8', 'deadstock', 'not_for_sale', NULL, 'Photography prop but also my personal grail. Never selling.', true),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.sneakers WHERE style_code = 'M20324'), '8.5', 'good', 'for_sale', 90.00, 'Classic Stan Smiths in good condition.', false),

-- Alex's collection
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.sneakers WHERE style_code = '555088-007'), '11', 'excellent', 'open_to_offers', NULL, 'Royal 1s from 2017. One of my favorites.', true),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.sneakers WHERE style_code = 'CQ4277-001'), '11', 'deadstock', 'not_for_sale', NULL, 'Travis Scott collab. Paid resale but worth every penny.', true),

-- Emma's collection
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM public.sneakers WHERE style_code = 'CP9654'), '7.5', 'very_near_deadstock', 'open_to_offers', NULL, 'Zebras are my favorite Yeezy colorway.', true),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM public.sneakers WHERE style_code = '315122-111'), '7.5', 'excellent', 'for_sale', 110.00, 'Classic white AF1s. Clean and ready to ship.', false);

-- Create some follows
INSERT INTO public.follows (follower_id, following_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002');

-- Create some sample offers
INSERT INTO public.offers (user_sneaker_id, buyer_id, seller_id, amount, message, expires_at) VALUES
((SELECT id FROM public.user_sneakers WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' AND sneaker_id = (SELECT id FROM public.sneakers WHERE style_code = 'CP9654')), 
 '550e8400-e29b-41d4-a716-446655440002', 
 '550e8400-e29b-41d4-a716-446655440001', 
 400.00, 
 'These are in great condition! Would love to add them to my collection.', 
 NOW() + INTERVAL '7 days'),

((SELECT id FROM public.user_sneakers WHERE user_id = '550e8400-e29b-41d4-a716-446655440003' AND sneaker_id = (SELECT id FROM public.sneakers WHERE style_code = '555088-007')), 
 '550e8400-e29b-41d4-a716-446655440004', 
 '550e8400-e29b-41d4-a716-446655440003', 
 350.00, 
 'Been looking for Royal 1s in this size for months!', 
 NOW() + INTERVAL '5 days');

-- Add some price history data
INSERT INTO public.price_history (sneaker_id, size, price, source, condition) VALUES
((SELECT id FROM public.sneakers WHERE style_code = '555088-101'), '10.5', 2500.00, 'stockx', 'deadstock'),
((SELECT id FROM public.sneakers WHERE style_code = '555088-101'), '10', 2300.00, 'goat', 'deadstock'),
((SELECT id FROM public.sneakers WHERE style_code = 'CP9654'), '10', 300.00, 'stockx', 'excellent'),
((SELECT id FROM public.sneakers WHERE style_code = 'CP9654'), '9.5', 320.00, 'goat', 'very_near_deadstock'),
((SELECT id FROM public.sneakers WHERE style_code = 'CQ4277-001'), '11', 1200.00, 'stockx', 'deadstock'),
((SELECT id FROM public.sneakers WHERE style_code = 'AA3834-101'), '10', 8500.00, 'goat', 'deadstock');