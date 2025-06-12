'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Calendar, 
  Instagram, 
  Globe, 
  Settings, 
  UserPlus,
  UserMinus,
  MessageSquare,
  MoreHorizontal,
  Verified
} from 'lucide-react'
import { User } from '@/lib/database.types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { socialAPI } from '@/lib/api/social'

interface ProfileHeaderProps {
  user: User
  isFollowing?: boolean
  onFollowChange?: () => void
}

export function ProfileHeader({ user, isFollowing = false, onFollowChange }: ProfileHeaderProps) {
  const { userProfile } = useAuthContext()
  const [followLoading, setFollowLoading] = useState(false)
  const [currentlyFollowing, setCurrentlyFollowing] = useState(isFollowing)

  const isOwner = userProfile?.id === user.id
  const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  const handleFollowToggle = async () => {
    if (followLoading) return

    setFollowLoading(true)
    try {
      if (currentlyFollowing) {
        await socialAPI.unfollowUser(user.id)
      } else {
        await socialAPI.followUser(user.id)
      }
      
      setCurrentlyFollowing(!currentlyFollowing)
      onFollowChange?.()
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cover Image Area - Gradient for now */}
        <div className="h-32 sm:h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-b-lg relative">
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-b-lg" />
          
          {/* Profile Picture */}
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full ring-4 ring-white overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl sm:text-4xl">
                  👤
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex-1">
              {/* Name and Verification */}
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {user.full_name || user.username}
                </h1>
                {user.is_verified && (
                  <Verified className="w-6 h-6 text-blue-500 fill-current" />
                )}
              </div>
              
              <p className="text-lg text-gray-600 mb-2">@{user.username}</p>
              
              {/* Bio */}
              {user.bio && (
                <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
              )}
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinedDate}</span>
                </div>
                
                {user.instagram_handle && (
                  <a 
                    href={`https://instagram.com/${user.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-pink-600 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>@{user.instagram_handle}</span>
                  </a>
                )}
                
                {user.website_url && (
                  <a 
                    href={user.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isOwner ? (
                <>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={
                      currentlyFollowing
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    }
                  >
                    {followLoading ? (
                      <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                    ) : currentlyFollowing ? (
                      <UserMinus className="w-4 h-4 mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {currentlyFollowing ? 'Following' : 'Follow'}
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {user.sneaker_count?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">Sneakers</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {user.follower_count?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {user.following_count?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
            
            {user.total_collection_value && user.total_collection_value > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${user.total_collection_value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Collection Value</div>
              </div>
            )}
          </div>

          {/* Special Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {user.is_verified && (
              <Badge className="bg-blue-100 text-blue-800">
                Verified Collector
              </Badge>
            )}
            
            {user.sneaker_count && user.sneaker_count >= 100 && (
              <Badge className="bg-purple-100 text-purple-800">
                Mega Collector
              </Badge>
            )}
            
            {user.follower_count && user.follower_count >= 1000 && (
              <Badge className="bg-pink-100 text-pink-800">
                Influencer
              </Badge>
            )}
            
            {user.total_collection_value && user.total_collection_value >= 10000 && (
              <Badge className="bg-green-100 text-green-800">
                High Roller
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}