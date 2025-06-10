import { Database } from '@/types/supabase'

// Utility types for easier database operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type User = Tables<'users'>
export type Sneaker = Tables<'sneakers'>
export type UserSneaker = Tables<'user_sneakers'>
export type Offer = Tables<'offers'>
export type Follow = Tables<'follows'>
export type ActivityFeed = Tables<'activity_feed'>
export type Watchlist = Tables<'watchlists'>
export type PriceHistory = Tables<'price_history'>

// Extended types with relations
export type UserSneakerWithDetails = UserSneaker & {
  sneaker: Sneaker
  user: User
}

export type OfferWithDetails = Offer & {
  user_sneaker: UserSneakerWithDetails
  buyer: User
  seller: User
}

export type ActivityFeedWithDetails = {
  id: string
  type: Database['public']['Enums']['activity_type']
  user_id: string
  username: string
  avatar_url: string | null
  target_user_id: string | null
  target_username: string | null
  sneaker_brand: string | null
  sneaker_model: string | null
  sneaker_colorway: string | null
  sneaker_image: string | null
  created_at: string
}

// Enums
export type ConditionType = Database['public']['Enums']['condition_type']
export type SaleStatus = Database['public']['Enums']['sale_status']
export type OfferStatus = Database['public']['Enums']['offer_status']
export type ActivityType = Database['public']['Enums']['activity_type']