'use client'

import { useState } from 'react'
import { Heart, DollarSign, Calendar, Package, MapPin, MessageSquare, Share, MoreHorizontal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserSneakerWithDetails } from '@/lib/database.types'
import { useAuthContext } from '@/components/auth/AuthProvider'

interface SneakerDetailDialogProps {
  open: boolean
  onClose: () => void
  userSneaker: UserSneakerWithDetails | null
  onOffer?: (userSneaker: UserSneakerWithDetails) => void
}

const conditionLabels = {
  deadstock: 'Deadstock (DS)',
  very_near_deadstock: 'Very Near Deadstock (VNDS)',
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
}

const conditionDescriptions = {
  deadstock: 'Never worn, brand new condition',
  very_near_deadstock: 'Worn 1-2 times, like new',
  excellent: 'Minimal wear, great condition',
  good: 'Some wear but well maintained',
  fair: 'Noticeable wear but functional',
  poor: 'Heavy wear, beaters'
}

const statusLabels = {
  not_for_sale: 'Not For Sale',
  open_to_offers: 'Open to Offers',
  for_sale: 'For Sale'
}

export function SneakerDetailDialog({ open, onClose, userSneaker, onOffer }: SneakerDetailDialogProps) {
  const { userProfile } = useAuthContext()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  if (!userSneaker || !userSneaker.sneaker) return null

  const { sneaker, user } = userSneaker
  const isOwner = userProfile?.id === userSneaker.user_id
  const canOffer = !isOwner && userSneaker.status !== 'not_for_sale'

  const images = [
    sneaker.image_url,
    ...userSneaker.images,
    ...(sneaker.images || [])
  ].filter(Boolean)

  const handleOfferClick = () => {
    if (onOffer) {
      onOffer(userSneaker)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {sneaker.brand} {sneaker.model}
          </DialogTitle>
          <DialogDescription>
            {sneaker.colorway} • Size {userSneaker.size}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex] || ''}
                  alt={`${sneaker.brand} ${sneaker.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                  👟
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image || ''}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Owner Info */}
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm">👤</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">@{user.username}</p>
                    {user.location && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {user.location}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Status and Price */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="font-medium">{statusLabels[userSneaker.status]}</span>
              </div>
              
              {userSneaker.asking_price && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Asking Price</span>
                  <span className="text-xl font-bold text-green-600">
                    ${userSneaker.asking_price.toLocaleString()}
                  </span>
                </div>
              )}
              
              {userSneaker.market_value && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Market Value</span>
                  <span className="font-medium">
                    ${userSneaker.market_value.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Condition and Details */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Condition</span>
                <div className="text-right">
                  <p className="font-medium">{conditionLabels[userSneaker.condition]}</p>
                  <p className="text-xs text-gray-500">
                    {conditionDescriptions[userSneaker.condition]}
                  </p>
                </div>
              </div>
              
              {userSneaker.purchase_price && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Purchase Price</span>
                  <span className="font-medium">
                    ${userSneaker.purchase_price.toLocaleString()}
                  </span>
                </div>
              )}
              
              {userSneaker.purchase_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Purchase Date</span>
                  <span className="font-medium">
                    {new Date(userSneaker.purchase_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {sneaker.release_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Release Date</span>
                  <span className="font-medium">
                    {new Date(sneaker.release_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {sneaker.retail_price && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Retail Price</span>
                  <span className="font-medium">
                    ${sneaker.retail_price.toLocaleString()}
                  </span>
                </div>
              )}
              
              {sneaker.style_code && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Style Code</span>
                  <span className="font-medium font-mono text-sm">
                    {sneaker.style_code}
                  </span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-2 pt-2">
              {userSneaker.is_grail && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-current" />
                  Grail
                </div>
              )}
              {userSneaker.is_featured && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </div>
              )}
            </div>

            {/* Story */}
            {userSneaker.story && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Story
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {userSneaker.story}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {canOffer && (
                <Button 
                  onClick={handleOfferClick}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Make Offer
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {sneaker.description && (
          <div className="border-t pt-6 mt-6">
            <h4 className="font-medium mb-2">About this sneaker</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {sneaker.description}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}