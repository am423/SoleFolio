'use client'

import { useState, useEffect } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { ProfileTabs } from './ProfileTabs'
import { socialAPI } from '@/lib/api/social'
import { User } from '@/lib/database.types'
import { useAuthContext } from '@/components/auth/AuthProvider'

interface ProfilePageClientProps {
  initialUser: User
}

export function ProfilePageClient({ initialUser }: ProfilePageClientProps) {
  const { userProfile } = useAuthContext()
  const [user, setUser] = useState(initialUser)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const isOwner = userProfile?.id === user.id

  useEffect(() => {
    if (userProfile && !isOwner) {
      checkFollowStatus()
    }
  }, [userProfile, user.id, isOwner])

  const checkFollowStatus = async () => {
    if (!userProfile) return
    
    try {
      const { data } = await socialAPI.isFollowing(user.id)
      setIsFollowing(data || false)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollowChange = async () => {
    // Refetch user data to get updated follower count
    try {
      const { data: updatedUser } = await socialAPI.getUserByUsername(user.username)
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader 
        user={user} 
        isFollowing={isFollowing}
        onFollowChange={handleFollowChange}
      />
      <div className="py-8">
        <ProfileTabs user={user} isOwner={isOwner} />
      </div>
    </div>
  )
}