'use client'

import { useState } from 'react'
import { Heart, DollarSign, Eye, MoreHorizontal } from 'lucide-react'
import { UserSneakerWithDetails } from '@/lib/database.types'
import { Button } from '@/components/ui/button'

interface SneakerCardProps {
  userSneaker: UserSneakerWithDetails
  onView?: (userSneaker: UserSneakerWithDetails) => void
  onOffer?: (userSneaker: UserSneakerWithDetails) => void
  showOwner?: boolean
}

const conditionLabels = {
  deadstock: 'DS',
  very_near_deadstock: 'VNDS',
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
}

const conditionColors = {
  deadstock: 'bg-green-100 text-green-800',
  very_near_deadstock: 'bg-blue-100 text-blue-800',
  excellent: 'bg-purple-100 text-purple-800',
  good: 'bg-yellow-100 text-yellow-800',
  fair: 'bg-orange-100 text-orange-800',
  poor: 'bg-red-100 text-red-800'
}

const statusColors = {
  not_for_sale: 'bg-gray-100 text-gray-800',
  open_to_offers: 'bg-blue-100 text-blue-800',
  for_sale: 'bg-green-100 text-green-800'
}

const statusLabels = {
  not_for_sale: 'Collection',
  open_to_offers: 'Open to Offers',
  for_sale: 'For Sale'
}

export function SneakerCard({ userSneaker, onView, onOffer, showOwner = false }: SneakerCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const { sneaker, user } = userSneaker
  
  if (!sneaker) return null

  const handleCardClick = () => {
    onView?.(userSneaker)
  }

  const handleOfferClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onOffer?.(userSneaker)
  }

  return (
    <div 
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {sneaker.image_url ? (
          <>
            <img
              src={sneaker.image_url}
              alt={`${sneaker.brand} ${sneaker.model} ${sneaker.colorway}`}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-4xl">👟</div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
            👟
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {userSneaker.is_grail && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              Grail
            </div>
          )}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${conditionColors[userSneaker.condition]}`}>
            {conditionLabels[userSneaker.condition]}
          </div>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[userSneaker.status]}`}>
            {statusLabels[userSneaker.status]}
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
            <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            {userSneaker.status !== 'not_for_sale' && (
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleOfferClick}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Offer
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {sneaker.brand} {sneaker.model}
              </h3>
              <p className="text-gray-600 text-sm truncate">{sneaker.colorway}</p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Size {userSneaker.size}</span>
            {userSneaker.asking_price && (
              <span className="font-semibold text-green-600">
                ${userSneaker.asking_price.toLocaleString()}
              </span>
            )}
          </div>
          
          {showOwner && user && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs">👤</span>
                )}
              </div>
              <span className="text-xs text-gray-600">@{user.username}</span>
            </div>
          )}
          
          {userSneaker.story && (
            <p className="text-xs text-gray-500 line-clamp-2 pt-1">
              {userSneaker.story}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}