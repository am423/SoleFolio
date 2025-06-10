'use client'

import { useState, useEffect } from 'react'
import { Plus, Grid3X3, Grid2X2, List, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SneakerCard } from './SneakerCard'
import { SneakerSearchDialog } from './SneakerSearchDialog'
import { AddSneakerDialog } from './AddSneakerDialog'
import { SneakerDetailDialog } from './SneakerDetailDialog'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { sneakerAPI } from '@/lib/api/sneakers'
import { UserSneakerWithDetails, Sneaker } from '@/lib/database.types'

interface SneakerCollectionProps {
  userId?: string
  showAddButton?: boolean
  title?: string
}

type ViewMode = 'grid-large' | 'grid-small' | 'list'

export function SneakerCollection({ userId, showAddButton = true, title = "My Collection" }: SneakerCollectionProps) {
  const { userProfile } = useAuthContext()
  const [sneakers, setSneakers] = useState<UserSneakerWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid-large')
  
  // Dialog states
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedSneaker, setSelectedSneaker] = useState<Sneaker | null>(null)
  const [selectedUserSneaker, setSelectedUserSneaker] = useState<UserSneakerWithDetails | null>(null)

  const targetUserId = userId || userProfile?.id

  useEffect(() => {
    if (targetUserId) {
      loadSneakers()
    }
  }, [targetUserId])

  const loadSneakers = async () => {
    if (!targetUserId) return

    setLoading(true)
    try {
      const { data, error } = await sneakerAPI.getUserSneakers(targetUserId)
      if (data) {
        setSneakers(data)
      }
    } catch (error) {
      console.error('Error loading sneakers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSneakerSelect = (sneaker: Sneaker) => {
    setSelectedSneaker(sneaker)
    setShowSearchDialog(false)
    setShowAddDialog(true)
  }

  const handleViewSneaker = (userSneaker: UserSneakerWithDetails) => {
    setSelectedUserSneaker(userSneaker)
    setShowDetailDialog(true)
  }

  const handleOfferSneaker = (userSneaker: UserSneakerWithDetails) => {
    // TODO: Implement offer dialog
    console.log('Make offer on:', userSneaker)
  }

  const filteredSneakers = sneakers.filter(sneaker => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      sneaker.sneaker?.brand.toLowerCase().includes(searchLower) ||
      sneaker.sneaker?.model.toLowerCase().includes(searchLower) ||
      sneaker.sneaker?.colorway.toLowerCase().includes(searchLower) ||
      sneaker.story?.toLowerCase().includes(searchLower)
    )
  })

  const getGridClass = () => {
    switch (viewMode) {
      case 'grid-large':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      case 'grid-small':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      case 'list':
        return 'grid-cols-1'
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
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
            {filteredSneakers.length} sneaker{filteredSneakers.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {showAddButton && (
            <Button 
              onClick={() => setShowSearchDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sneaker
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search your collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid-large' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid-large')}
          >
            <Grid2X2 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid-small' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid-small')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Collection Grid */}
      {filteredSneakers.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <div>
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sneakers found</h3>
              <p className="text-gray-500 mb-4">
                No sneakers match your search for "{searchQuery}"
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">👟</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showAddButton ? 'Start your collection' : 'No sneakers yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {showAddButton 
                  ? "Add your first sneaker to get started"
                  : "This collection is empty"
                }
              </p>
              {showAddButton && (
                <Button 
                  onClick={() => setShowSearchDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Sneaker
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 ${getGridClass()}`}>
          {filteredSneakers.map((userSneaker) => (
            <SneakerCard
              key={userSneaker.id}
              userSneaker={userSneaker}
              onView={handleViewSneaker}
              onOffer={handleOfferSneaker}
              showOwner={!!userId && userId !== userProfile?.id}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <SneakerSearchDialog
        open={showSearchDialog}
        onClose={() => setShowSearchDialog(false)}
        onSneakerSelect={handleSneakerSelect}
      />

      <AddSneakerDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false)
          setSelectedSneaker(null)
          loadSneakers() // Refresh collection
        }}
        sneaker={selectedSneaker}
      />

      <SneakerDetailDialog
        open={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false)
          setSelectedUserSneaker(null)
        }}
        userSneaker={selectedUserSneaker}
        onOffer={handleOfferSneaker}
      />
    </div>
  )
}