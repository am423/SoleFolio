import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  user_id: string
  type: 'offer_received' | 'offer_accepted' | 'offer_declined' | 'offer_withdrawn' | 'new_follower' | 'price_drop' | 'new_sneaker'
  title: string
  message: string
  data?: any
  read: boolean
  created_at: string
  updated_at: string
}

export const notificationsAPI = {
  // Get user's notifications
  async getUserNotifications(limit = 20, offset = 0) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return { data, error }
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single()

    return { data, error }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('read', false)

    return { data, error }
  },

  // Get unread notification count
  async getUnreadCount() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: 0, error: null }
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    return { data: count || 0, error }
  },

  // Create notification (system use)
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    return { data, error }
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    return { data, error }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()

    return channel
  },

  // Helper functions for creating specific notification types
  async notifyOfferReceived(sellerId: string, buyerId: string, sneakerName: string, amount: number) {
    const { data: buyer } = await supabase
      .from('users')
      .select('username')
      .eq('id', buyerId)
      .single()

    if (!buyer) return { data: null, error: new Error('Buyer not found') }

    return this.createNotification({
      user_id: sellerId,
      type: 'offer_received',
      title: 'New Offer Received',
      message: `${buyer.username} made a $${amount} offer on your ${sneakerName}`,
      data: { buyerId, amount, sneakerName },
      read: false
    })
  },

  async notifyOfferAccepted(buyerId: string, sellerId: string, sneakerName: string) {
    const { data: seller } = await supabase
      .from('users')
      .select('username')
      .eq('id', sellerId)
      .single()

    if (!seller) return { data: null, error: new Error('Seller not found') }

    return this.createNotification({
      user_id: buyerId,
      type: 'offer_accepted',
      title: 'Offer Accepted! 🎉',
      message: `${seller.username} accepted your offer for ${sneakerName}`,
      data: { sellerId, sneakerName },
      read: false
    })
  },

  async notifyOfferDeclined(buyerId: string, sellerId: string, sneakerName: string) {
    const { data: seller } = await supabase
      .from('users')
      .select('username')
      .eq('id', sellerId)
      .single()

    if (!seller) return { data: null, error: new Error('Seller not found') }

    return this.createNotification({
      user_id: buyerId,
      type: 'offer_declined',
      title: 'Offer Declined',
      message: `${seller.username} declined your offer for ${sneakerName}`,
      data: { sellerId, sneakerName },
      read: false
    })
  },

  async notifyNewFollower(userId: string, followerId: string) {
    const { data: follower } = await supabase
      .from('users')
      .select('username')
      .eq('id', followerId)
      .single()

    if (!follower) return { data: null, error: new Error('Follower not found') }

    return this.createNotification({
      user_id: userId,
      type: 'new_follower',
      title: 'New Follower',
      message: `${follower.username} started following you`,
      data: { followerId },
      read: false
    })
  }
}