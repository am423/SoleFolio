'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { socialAPI } from '@/lib/api/social'
import { User } from '@/lib/database.types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { Search, Users, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface UserListProps {
  userId: string
  type: 'followers' | 'following'
  title: string
}

interface UserWithFollow extends User {
  isFollowing?: boolean
}

export function UserList({ userId, type, title }: UserListProps) {
  const { userProfile } = useAuthContext()
  const [users, setUsers] = useState<UserWithFollow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadUsers()
  }, [userId, type])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = type === 'followers' 
        ? await socialAPI.getUserFollowers(userId)
        : await socialAPI.getUserFollowing(userId)

      if (data) {
        const userList = data.map((item: any) => 
          type === 'followers' ? item.follower : item.following
        ).filter(Boolean) as User[]
        
        setUsers(userList)
        
        // Check follow status for each user
        if (userProfile) {
          const followChecks = await Promise.all(
            userList.map(async (user) => {
              if (user.id === userProfile.id) return [user.id, false]
              const { data: isFollowing } = await socialAPI.isFollowing(user.id)
              return [user.id, isFollowing]
            })
          )
          
          const followMap = Object.fromEntries(followChecks)
          setFollowStates(followMap)
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async (targetUserId: string) => {
    if (!userProfile || targetUserId === userProfile.id) return

    const isCurrentlyFollowing = followStates[targetUserId]
    
    try {
      if (isCurrentlyFollowing) {
        await socialAPI.unfollowUser(targetUserId)
      } else {
        await socialAPI.followUser(targetUserId)
      }
      
      setFollowStates(prev => ({
        ...prev,
        [targetUserId]: !isCurrentlyFollowing
      }))
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.username.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-600">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* User Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          {searchQuery ? (
            <div>
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500 mb-4">
                No users match your search for "{searchQuery}"
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <div>
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {type === 'followers' ? 'followers' : 'following'} yet
              </h3>
              <p className="text-gray-500">
                {type === 'followers' 
                  ? "No one is following this user yet"
                  : "This user isn't following anyone yet"
                }
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <Link href={`/profile/${user.username}`}>
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                </Link>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${user.username}`}>
                    <h3 className="font-semibold text-gray-900 truncate cursor-pointer hover:text-purple-600 transition-colors">
                      {user.full_name || user.username}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm truncate">@{user.username}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{user.sneaker_count || 0} sneakers</span>
                    <span>{user.follower_count || 0} followers</span>
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
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {user.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}