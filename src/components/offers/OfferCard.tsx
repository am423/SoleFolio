'use client'

import { useState } from 'react'
import { OfferWithDetails } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  Clock, 
  User, 
  MessageSquare, 
  Check, 
  X, 
  RotateCcw,
  Calendar
} from 'lucide-react'
import { offerAPI } from '@/lib/api/offers'
import { useAuthContext } from '@/components/auth/AuthProvider'

interface OfferCardProps {
  offer: OfferWithDetails
  type: 'received' | 'sent'
  onUpdate?: () => void
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
  expired: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
  expired: 'Expired'
}

export function OfferCard({ offer, type, onUpdate }: OfferCardProps) {
  const { userProfile } = useAuthContext()
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatusUpdate = async (status: 'accepted' | 'declined' | 'withdrawn') => {
    setLoading(status)
    try {
      await offerAPI.updateOfferStatus(offer.id, status)
      onUpdate?.()
    } catch (error) {
      console.error('Error updating offer:', error)
    } finally {
      setLoading(null)
    }
  }

  const isExpired = new Date(offer.expires_at) < new Date()
  const timeUntilExpiry = new Date(offer.expires_at).getTime() - new Date().getTime()
  const daysLeft = Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24))

  const canAccept = type === 'received' && offer.status === 'pending' && !isExpired
  const canDecline = type === 'received' && offer.status === 'pending' && !isExpired
  const canWithdraw = type === 'sent' && offer.status === 'pending' && !isExpired

  const otherUser = type === 'received' ? offer.buyer : offer.seller
  const userSneaker = offer.user_sneaker

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Sneaker Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          {userSneaker?.sneaker?.image_url ? (
            <img
              src={userSneaker.sneaker.image_url}
              alt={`${userSneaker.sneaker.brand} ${userSneaker.sneaker.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">👟</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">
                {userSneaker?.sneaker?.brand} {userSneaker?.sneaker?.model}
              </h3>
              <p className="text-gray-600 text-sm truncate">
                {userSneaker?.sneaker?.colorway} • Size {userSneaker?.size}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={statusColors[offer.status]}>
                  {statusLabels[offer.status]}
                </Badge>
                {offer.status === 'pending' && !isExpired && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${offer.amount.toLocaleString()}
              </div>
              {userSneaker?.asking_price && (
                <p className="text-sm text-gray-500">
                  Ask: ${userSneaker.asking_price.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {type === 'received' ? 'Offer from' : 'Offer to'} @{otherUser?.username}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(offer.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Message */}
          {offer.message && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{offer.message}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {offer.status === 'pending' && !isExpired && (
            <div className="flex gap-2">
              {canAccept && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate('accepted')}
                  disabled={loading === 'accepted'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading === 'accepted' ? (
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      Accepting...
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </>
                  )}
                </Button>
              )}
              
              {canDecline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate('declined')}
                  disabled={loading === 'declined'}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  {loading === 'declined' ? (
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                      Declining...
                    </span>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </>
                  )}
                </Button>
              )}

              {canWithdraw && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate('withdrawn')}
                  disabled={loading === 'withdrawn'}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  {loading === 'withdrawn' ? (
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Withdrawing...
                    </span>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Withdraw
                    </>
                  )}
                </Button>
              )}

              {canDecline && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Counter
                </Button>
              )}
            </div>
          )}

          {/* Status Messages */}
          {offer.status === 'accepted' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-green-800">
                🎉 Offer accepted! You'll be contacted to arrange payment and delivery.
              </p>
            </div>
          )}

          {offer.status === 'declined' && offer.responded_at && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-red-800">
                Offer declined on {new Date(offer.responded_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {(isExpired || offer.status === 'expired') && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                This offer expired on {new Date(offer.expires_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}