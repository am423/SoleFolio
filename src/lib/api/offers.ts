import { supabase } from '@/lib/supabase'
import { Offer, OfferWithDetails } from '@/lib/database.types'

interface CreateOfferParams {
  user_sneaker_id: string
  buyer_id: string
  seller_id: string
  amount: number
  message?: string
  expires_at: string
  parent_offer_id?: string
}

export const offerAPI = {
  // Create a new offer with overloaded signatures
  async createOffer(
    userSneakerIdOrParams: string | CreateOfferParams, 
    amount?: number, 
    message?: string
  ) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    let offerData: any

    // Handle both function signatures
    if (typeof userSneakerIdOrParams === 'string') {
      // Simple version - create regular offer
      const userSneakerId = userSneakerIdOrParams

      // First get the user_sneaker to find the seller
      const { data: userSneaker, error: sneakerError } = await supabase
        .from('user_sneakers')
        .select('user_id')
        .eq('id', userSneakerId)
        .single()

      if (sneakerError || !userSneaker) {
        return { data: null, error: sneakerError || new Error('Sneaker not found') }
      }

      offerData = {
        user_sneaker_id: userSneakerId,
        buyer_id: user.id,
        seller_id: userSneaker.user_id,
        amount,
        message,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      }
    } else {
      // Advanced version - create counter-offer with provided params
      offerData = {
        user_sneaker_id: userSneakerIdOrParams.user_sneaker_id,
        buyer_id: userSneakerIdOrParams.buyer_id,
        seller_id: userSneakerIdOrParams.seller_id,
        amount: userSneakerIdOrParams.amount,
        message: userSneakerIdOrParams.message,
        expires_at: userSneakerIdOrParams.expires_at,
        parent_offer_id: userSneakerIdOrParams.parent_offer_id,
      }
    }

    // Create the offer
    const { data, error } = await supabase
      .from('offers')
      .insert(offerData)
      .select(`
        *,
        user_sneaker:user_sneakers(
          *,
          sneaker:sneakers(*)
        ),
        buyer:users(*),
        seller:users(*)
      `)
      .single()

    return { data: data as OfferWithDetails | null, error }
  },

  // Get offers for a user (both received and sent)
  async getUserOffers(type: 'received' | 'sent' | 'all' = 'all') {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    let query = supabase
      .from('offers')
      .select(`
        *,
        user_sneaker:user_sneakers(
          *,
          sneaker:sneakers(*)
        ),
        buyer:users(*),
        seller:users(*)
      `)

    if (type === 'received') {
      query = query.eq('seller_id', user.id)
    } else if (type === 'sent') {
      query = query.eq('buyer_id', user.id)
    } else {
      query = query.or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    return { data: data as OfferWithDetails[] | null, error }
  },

  // Update offer status
  async updateOfferStatus(offerId: string, status: 'accepted' | 'declined' | 'withdrawn') {
    const { data, error } = await supabase
      .from('offers')
      .update({ 
        status,
        responded_at: new Date().toISOString()
      })
      .eq('id', offerId)
      .select(`
        *,
        user_sneaker:user_sneakers(
          *,
          sneaker:sneakers(*)
        ),
        buyer:users(*),
        seller:users(*)
      `)
      .single()

    return { data: data as OfferWithDetails | null, error }
  },

  // Get offers for a specific sneaker
  async getSneakerOffers(userSneakerId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        buyer:users(username, avatar_url),
        seller:users(username, avatar_url)
      `)
      .eq('user_sneaker_id', userSneakerId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Counter offer
  async createCounterOffer(originalOfferId: string, newAmount: number, message?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    // First decline the original offer
    await supabase
      .from('offers')
      .update({ status: 'declined' })
      .eq('id', originalOfferId)

    // Get original offer details
    const { data: originalOffer, error: originalError } = await supabase
      .from('offers')
      .select('*')
      .eq('id', originalOfferId)
      .single()

    if (originalError || !originalOffer) {
      return { data: null, error: originalError || new Error('Original offer not found') }
    }

    // Create counter offer (roles reversed)
    const { data, error } = await supabase
      .from('offers')
      .insert({
        user_sneaker_id: originalOffer.user_sneaker_id,
        buyer_id: originalOffer.seller_id,
        seller_id: originalOffer.buyer_id,
        amount: newAmount,
        message,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select(`
        *,
        user_sneaker:user_sneakers(*),
        buyer:users(*),
        seller:users(*)
      `)
      .single()

    return { data: data as OfferWithDetails | null, error }
  },

  // Expire old offers (utility function)
  async expireOldOffers() {
    const { data, error } = await supabase.rpc('expire_old_offers')
    return { data, error }
  }
}