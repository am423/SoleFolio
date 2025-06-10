export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          instagram_handle: string | null
          website_url: string | null
          is_verified: boolean
          follower_count: number
          following_count: number
          sneaker_count: number
          total_collection_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          instagram_handle?: string | null
          website_url?: string | null
          is_verified?: boolean
          follower_count?: number
          following_count?: number
          sneaker_count?: number
          total_collection_value?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          instagram_handle?: string | null
          website_url?: string | null
          is_verified?: boolean
          follower_count?: number
          following_count?: number
          sneaker_count?: number
          total_collection_value?: number
          created_at?: string
          updated_at?: string
        }
      }
      sneakers: {
        Row: {
          id: string
          brand: string
          model: string
          colorway: string
          style_code: string | null
          release_date: string | null
          retail_price: number | null
          description: string | null
          image_url: string | null
          images: string[]
          category: string
          gender: string
          sizes_available: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand: string
          model: string
          colorway: string
          style_code?: string | null
          release_date?: string | null
          retail_price?: number | null
          description?: string | null
          image_url?: string | null
          images?: string[]
          category?: string
          gender?: string
          sizes_available?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand?: string
          model?: string
          colorway?: string
          style_code?: string | null
          release_date?: string | null
          retail_price?: number | null
          description?: string | null
          image_url?: string | null
          images?: string[]
          category?: string
          gender?: string
          sizes_available?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_sneakers: {
        Row: {
          id: string
          user_id: string
          sneaker_id: string
          size: string
          condition: 'deadstock' | 'very_near_deadstock' | 'excellent' | 'good' | 'fair' | 'poor'
          status: 'not_for_sale' | 'open_to_offers' | 'for_sale'
          asking_price: number | null
          purchase_price: number | null
          purchase_date: string | null
          story: string | null
          images: string[]
          is_grail: boolean
          is_featured: boolean
          market_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sneaker_id: string
          size: string
          condition?: 'deadstock' | 'very_near_deadstock' | 'excellent' | 'good' | 'fair' | 'poor'
          status?: 'not_for_sale' | 'open_to_offers' | 'for_sale'
          asking_price?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          story?: string | null
          images?: string[]
          is_grail?: boolean
          is_featured?: boolean
          market_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sneaker_id?: string
          size?: string
          condition?: 'deadstock' | 'very_near_deadstock' | 'excellent' | 'good' | 'fair' | 'poor'
          status?: 'not_for_sale' | 'open_to_offers' | 'for_sale'
          asking_price?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          story?: string | null
          images?: string[]
          is_grail?: boolean
          is_featured?: boolean
          market_value?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          user_sneaker_id: string
          buyer_id: string
          seller_id: string
          amount: number
          message: string | null
          status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired'
          expires_at: string
          responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_sneaker_id: string
          buyer_id: string
          seller_id: string
          amount: number
          message?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired'
          expires_at: string
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_sneaker_id?: string
          buyer_id?: string
          seller_id?: string
          amount?: number
          message?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired'
          expires_at?: string
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      activity_feed: {
        Row: {
          id: string
          type: 'new_sneaker' | 'price_drop' | 'sold' | 'new_follow' | 'offer_received' | 'offer_accepted' | 'offer_declined'
          user_id: string
          target_user_id: string | null
          user_sneaker_id: string | null
          offer_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          type: 'new_sneaker' | 'price_drop' | 'sold' | 'new_follow' | 'offer_received' | 'offer_accepted' | 'offer_declined'
          user_id: string
          target_user_id?: string | null
          user_sneaker_id?: string | null
          offer_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'new_sneaker' | 'price_drop' | 'sold' | 'new_follow' | 'offer_received' | 'offer_accepted' | 'offer_declined'
          user_id?: string
          target_user_id?: string | null
          user_sneaker_id?: string | null
          offer_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      watchlists: {
        Row: {
          id: string
          user_id: string
          sneaker_id: string
          size: string | null
          max_price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sneaker_id: string
          size?: string | null
          max_price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sneaker_id?: string
          size?: string | null
          max_price?: number | null
          created_at?: string
        }
      }
      price_history: {
        Row: {
          id: string
          sneaker_id: string
          size: string
          price: number
          source: string
          condition: 'deadstock' | 'very_near_deadstock' | 'excellent' | 'good' | 'fair' | 'poor'
          recorded_at: string
        }
        Insert: {
          id?: string
          sneaker_id: string
          size: string
          price: number
          source: string
          condition: 'deadstock' | 'very_near_deadstock' | 'excellent' | 'good' | 'fair' | 'poor'
          recorded_at?: string
        }
        Update: {
          id?: string
          sneaker_id?: string
          size?: string
          price?: number
          source?: string
          condition?: 'deadstock' | 'very_near_deadstock' | 'excellent' | 'good' | 'fair' | 'poor'
          recorded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_feed: {
        Args: {
          user_uuid: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          type: 'new_sneaker' | 'price_drop' | 'sold' | 'new_follow' | 'offer_received' | 'offer_accepted' | 'offer_declined'
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
        }[]
      }
      expire_old_offers: {
        Args: {}
        Returns: undefined
      }
    }
    Enums: {
      condition_type: 'deadstock' | 'very_near_deadstock' | 'excellent' | 'good' | 'fair' | 'poor'
      sale_status: 'not_for_sale' | 'open_to_offers' | 'for_sale'
      offer_status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired'
      activity_type: 'new_sneaker' | 'price_drop' | 'sold' | 'new_follow' | 'offer_received' | 'offer_accepted' | 'offer_declined'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}