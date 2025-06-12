'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SneakerCollection } from '@/components/sneakers/SneakerCollection'
import { UserList } from './UserList'
import { User } from '@/lib/database.types'
import { Grid3X3, Users, Heart, Activity } from 'lucide-react'

interface ProfileTabsProps {
  user: User
  isOwner: boolean
}

export function ProfileTabs({ user, isOwner }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('collection')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">Collection</span>
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Followers</span>
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Following</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="space-y-6">
          <SneakerCollection 
            userId={user.id}
            showAddButton={isOwner}
            title={isOwner ? "My Collection" : `${user.username}'s Collection`}
          />
        </TabsContent>

        <TabsContent value="followers" className="space-y-6">
          <UserList 
            userId={user.id}
            type="followers"
            title="Followers"
          />
        </TabsContent>

        <TabsContent value="following" className="space-y-6">
          <UserList 
            userId={user.id}
            type="following"
            title="Following"
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Feed</h3>
            <p className="text-gray-500">
              {isOwner 
                ? "Your recent activity will appear here" 
                : `${user.username}'s recent activity will appear here`
              }
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}