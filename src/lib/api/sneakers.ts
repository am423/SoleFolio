import { supabase } from '@/lib/supabase'
import { Sneaker, UserSneaker, UserSneakerWithDetails } from '@/lib/database.types'

export const sneakerAPI = {
  // Get all sneakers with optional filtering
  async getAllSneakers(filters?: {
    brand?: string
    category?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('sneakers')
      .select('*')

    if (filters?.brand) {
      query = query.eq('brand', filters.brand)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      query = query.or(`brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%,colorway.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    return { data, error }
  },

  // Get sneaker by ID
  async getSneakerById(id: string) {
    const { data, error } = await supabase
      .from('sneakers')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  // Search sneakers by name/brand
  async searchSneakers(query: string, limit = 10) {
    const { data, error } = await supabase
      .from('sneakers')
      .select('*')
      .or(`brand.ilike.%${query}%,model.ilike.%${query}%,colorway.ilike.%${query}%`)
      .limit(limit)

    return { data, error }
  },

  // Get user's sneaker collection
  async getUserSneakers(userId: string) {
    const { data, error } = await supabase
      .from('user_sneakers')
      .select(`
        *,
        sneaker:sneakers(*),
        user:users(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data: data as UserSneakerWithDetails[] | null, error }
  },

  // Add sneaker to user's collection
  async addSneakerToCollection(sneakerId: string, details: {
    size: string
    condition: string
    status?: string
    asking_price?: number
    purchase_price?: number
    purchase_date?: string
    story?: string
    is_grail?: boolean
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('user_sneakers')
      .insert({
        user_id: user.id,
        sneaker_id: sneakerId,
        ...details,
      })
      .select(`
        *,
        sneaker:sneakers(*),
        user:users(*)
      `)
      .single()

    return { data: data as UserSneakerWithDetails | null, error }
  },

  // Update user's sneaker
  async updateUserSneaker(userSneakerId: string, updates: Partial<UserSneaker>) {
    const { data, error } = await supabase
      .from('user_sneakers')
      .update(updates)
      .eq('id', userSneakerId)
      .select(`
        *,
        sneaker:sneakers(*),
        user:users(*)
      `)
      .single()

    return { data: data as UserSneakerWithDetails | null, error }
  },

  // Remove sneaker from collection
  async removeSneakerFromCollection(userSneakerId: string) {
    const { data, error } = await supabase
      .from('user_sneakers')
      .delete()
      .eq('id', userSneakerId)

    return { data, error }
  },

  // Get sneakers available for sale/offers
  async getAvailableSneakers(filters?: {
    status?: 'for_sale' | 'open_to_offers'
    brand?: string
    maxPrice?: number
    size?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('user_sneakers')
      .select(`
        *,
        sneaker:sneakers(*),
        user:users(username, avatar_url, location)
      `)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    } else {
      query = query.in('status', ['for_sale', 'open_to_offers'])
    }

    if (filters?.brand) {
      query = query.eq('sneaker.brand', filters.brand)
    }

    if (filters?.maxPrice) {
      query = query.lte('asking_price', filters.maxPrice)
    }

    if (filters?.size) {
      query = query.eq('size', filters.size)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    return { data: data as UserSneakerWithDetails[] | null, error }
  },

  // Get trending sneakers (most active in offers/follows)
  async getTrendingSneakers(limit = 10) {
    // This is a simplified version - in production you'd want more complex trending logic
    const { data, error } = await supabase
      .from('user_sneakers')
      .select(`
        sneaker_id,
        sneaker:sneakers(*),
        count:user_sneakers(count)
      `)
      .limit(limit)
      .order('created_at', { ascending: false })

    return { data, error }
  }
}