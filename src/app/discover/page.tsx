'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { socialAPI } from '@/lib/api/social'
import { User } from '@/lib/database.types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { 
  Search, 
  TrendingUp, 
  Users, 
  UserPlus, 
  UserMinus, 
  Loader2,
  Star,
  Crown,
  Flame
} from 'lucide-react'
import Link from 'next/link'

export default function DiscoverPage() {
  const { userProfile } = useAuthContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [popularUsers, setPopularUsers] = useState<User[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState({ search: false, popular: true, suggested: true })
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadPopularUsers()
    loadSuggestedUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const debounceTimer = setTimeout(() => {
        searchUsers()
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const loadPopularUsers = async () => {
    try {
      const { data } = await socialAPI.getPopularUsers(20)
      if (data) {
        setPopularUsers(data)
        await updateFollowStates(data)
      }
    } catch (error) {
      console.error('Error loading popular users:', error)
    } finally {
      setLoading(prev => ({ ...prev, popular: false }))
    }
  }

  const loadSuggestedUsers = async () => {
    try {
      const { data } = await socialAPI.getSuggestedUsers(10)
      if (data) {
        setSuggestedUsers(data)
        await updateFollowStates(data)
      }
    } catch (error) {
      console.error('Error loading suggested users:', error)
    } finally {
      setLoading(prev => ({ ...prev, suggested: false }))
    }
  }

  const searchUsers = async () => {
    setLoading(prev => ({ ...prev, search: true }))
    try {
      const { data } = await socialAPI.searchUsers(searchQuery, 20)
      if (data) {
        setSearchResults(data)
        await updateFollowStates(data)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(prev => ({ ...prev, search: false }))
    }
  }

  const updateFollowStates = async (users: User[]) => {
    if (!userProfile) return

    const followChecks = await Promise.all(
      users.map(async (user) => {
        if (user.id === userProfile.id) return [user.id, false]
        try {
          const { data: isFollowing } = await socialAPI.isFollowing(user.id)
          return [user.id, isFollowing || false]
        } catch {
          return [user.id, false]
        }
      })
    )

    const followMap = Object.fromEntries(followChecks)
    setFollowStates(prev => ({ ...prev, ...followMap }))
  }

  const handleFollowToggle = async (userId: string) => {
    if (!userProfile || userId === userProfile.id) return

    const isCurrentlyFollowing = followStates[userId]
    
    try {
      if (isCurrentlyFollowing) {
        await socialAPI.unfollowUser(userId)
      } else {
        await socialAPI.followUser(userId)
      }
      
      setFollowStates(prev => ({
        ...prev,
        [userId]: !isCurrentlyFollowing
      }))
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const renderUserCard = (user: User, showBadge?: 'popular' | 'suggested') => (
    <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <Link href={`/profile/${user.username}`}>
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
            {showBadge === 'popular' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <Flame className="w-3 h-3 text-white" />
              </div>
            )}
            {showBadge === 'suggested' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </Link>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user.username}`}>
            <h3 className="font-semibold text-gray-900 truncate cursor-pointer hover:text-purple-600 transition-colors">
              {user.full_name || user.username}
              {user.is_verified && <Crown className="w-4 h-4 text-yellow-500 inline ml-1" />}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm truncate">@{user.username}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{user.sneaker_count || 0} sneakers</span>
            <span>{user.follower_count || 0} followers</span>
            {user.total_collection_value && user.total_collection_value > 0 && (
              <span className="text-green-600 font-medium">
                ${user.total_collection_value.toLocaleString()} collection
              </span>
            )}
          </div>
        </div>

        {/* Follow Button */}
        {userProfile && user.id !== userProfile.id && (
          <Button
            size="sm"
            variant={followStates[user.id] ? "outline" : "default"}
            onClick={() => handleFollowToggle(user.id)}
            className={
              followStates[user.id]
                ? "border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-700"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            }
          >
            {followStates[user.id] ? (
              <>
                <UserMinus className="w-4 h-4 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-sm text-gray-600 mt-4 line-clamp-2">
          {user.bio}
        </p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-purple-600" />
            Discover Collectors
          </h1>
          <p className="text-gray-600 mt-2">
            Find and follow amazing sneaker collectors from around the world
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search collectors by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Search Results
              {!loading.search && ` (${searchResults.length})`}
            </h2>
            
            {loading.search ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map(user => renderUserCard(user))}
              </div>
            )}
          </div>
        )}

        {/* Tabs for Popular and Suggested */}
        <Tabs defaultValue="popular" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="suggested" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Suggested
            </TabsTrigger>
          </TabsList>

          <TabsContent value="popular" className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Popular Collectors</h2>
            
            {loading.popular ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularUsers.map(user => renderUserCard(user, 'popular'))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggested" className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Suggested for You</h2>
            
            {loading.suggested ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : suggestedUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h3>
                <p className="text-gray-500">
                  Start following some collectors to get personalized suggestions
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestedUsers.map(user => renderUserCard(user, 'suggested'))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}