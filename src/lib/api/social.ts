import { supabase } from '@/lib/supabase'
import { User, Follow, ActivityFeedWithDetails } from '@/lib/database.types'

export const socialAPI = {
  // Follow a user
  async followUser(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: followingId,
      })
      .select()
      .single()

    return { data, error }
  },

  // Unfollow a user
  async unfollowUser(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    return { data, error }
  },

  // Check if following a user
  async isFollowing(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: false, error: null }
    }

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single()

    return { data: !!data, error }
  },

  // Get user's followers
  async getUserFollowers(userId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:users(
          id,
          username,
          full_name,
          avatar_url,
          bio,
          follower_count,
          sneaker_count
        )
      `)
      .eq('following_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Get who user is following
  async getUserFollowing(userId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:users(
          id,
          username,
          full_name,
          avatar_url,
          bio,
          follower_count,
          sneaker_count
        )
      `)
      .eq('follower_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Get user's activity feed
  async getUserFeed(limit = 20, offset = 0) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase.rpc('get_user_feed', {
      user_uuid: user.id,
      limit_count: limit,
      offset_count: offset,
    })

    return { data: data as ActivityFeedWithDetails[] | null, error }
  },

  // Search users
  async searchUsers(query: string, limit = 10) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, bio, follower_count, sneaker_count')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(limit)

    return { data, error }
  },

  // Get user profile by username
  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    return { data, error }
  },

  // Get popular users (by follower count)
  async getPopularUsers(limit = 10) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, bio, follower_count, sneaker_count')
      .order('follower_count', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  // Get recent activity for a specific user
  async getUserActivity(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('activity_feed')
      .select(`
        *,
        user:users(username, avatar_url),
        target_user:users(username, avatar_url),
        user_sneaker:user_sneakers(
          *,
          sneaker:sneakers(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  // Get suggested users to follow
  async getSuggestedUsers(limit = 5) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    // Get users that the current user is not following, ordered by follower count
    const { data, error } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, bio, follower_count, sneaker_count')
      .neq('id', user.id)
      .not('id', 'in', `(
        SELECT following_id FROM follows WHERE follower_id = '${user.id}'
      )`)
      .order('follower_count', { ascending: false })
      .limit(limit)

    return { data, error }
  }
}