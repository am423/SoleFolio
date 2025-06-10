export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  avatar_url?: string
  bio?: string
  location?: string
  instagram_handle?: string
  created_at: string
  updated_at: string
}

export interface Sneaker {
  id: string
  brand: string
  model: string
  colorway: string
  style_code: string
  release_date?: string
  retail_price?: number
  image_url?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface UserSneaker {
  id: string
  user_id: string
  sneaker_id: string
  size: string
  condition: 'deadstock' | 'very_near_deadstock' | 'excellent' | 'good' | 'fair' | 'poor'
  status: 'not_for_sale' | 'open_to_offers' | 'for_sale'
  asking_price?: number
  purchase_price?: number
  purchase_date?: string
  story?: string
  images: string[]
  is_grail: boolean
  created_at: string
  updated_at: string
  
  // Relations
  sneaker?: Sneaker
  user?: User
}

export interface Offer {
  id: string
  user_sneaker_id: string
  buyer_id: string
  seller_id: string
  amount: number
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired'
  expires_at: string
  created_at: string
  updated_at: string
  
  // Relations
  user_sneaker?: UserSneaker
  buyer?: User
  seller?: User
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  
  // Relations
  follower?: User
  following?: User
}

export interface ActivityFeedItem {
  id: string
  type: 'new_sneaker' | 'price_drop' | 'sold' | 'new_follow' | 'offer_received'
  user_id: string
  target_user_id?: string
  user_sneaker_id?: string
  offer_id?: string
  created_at: string
  
  // Relations
  user?: User
  target_user?: User
  user_sneaker?: UserSneaker
  offer?: Offer
}