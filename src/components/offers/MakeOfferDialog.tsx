'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { offerAPI } from '@/lib/api/offers'
import { UserSneakerWithDetails } from '@/lib/database.types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { Loader2, DollarSign, Clock, Heart, AlertTriangle } from 'lucide-react'

interface MakeOfferDialogProps {
  open: boolean
  onClose: () => void
  userSneaker: UserSneakerWithDetails | null
}

export function MakeOfferDialog({ open, onClose, userSneaker }: MakeOfferDialogProps) {
  const router = useRouter()
  const { userProfile } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  const resetForm = () => {
    setAmount('')
    setMessage('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userSneaker || !amount) return

    const offerAmount = parseFloat(amount)
    if (isNaN(offerAmount) || offerAmount <= 0) {
      setError('Please enter a valid offer amount')
      return
    }

    // Check if asking price exists and offer is reasonable
    if (userSneaker.asking_price && offerAmount > userSneaker.asking_price * 1.5) {
      setError('Your offer seems unusually high. Please check the amount.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await offerAPI.createOffer(userSneaker.id, offerAmount, message || undefined)
      
      if (error) {
        setError(error.message)
      } else {
        onClose()
        resetForm()
        // Could show success toast here
        router.refresh()
      }
    } catch (err) {
      setError('Failed to submit offer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!userSneaker?.sneaker) return null

  const { sneaker, user } = userSneaker
  const isOwner = userProfile?.id === userSneaker.user_id
  const suggestedOffer = userSneaker.asking_price 
    ? Math.round(userSneaker.asking_price * 0.85) 
    : userSneaker.market_value 
    ? Math.round(userSneaker.market_value * 0.9)
    : null

  // Don't allow offers on own sneakers
  if (isOwner) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cannot Make Offer</DialogTitle>
            <DialogDescription>
              You cannot make an offer on your own sneaker.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Make an Offer
          </DialogTitle>
          <DialogDescription>
            Submit an offer for this sneaker. The owner will be notified and can accept, decline, or counter.
          </DialogDescription>
        </DialogHeader>

        {/* Sneaker Preview */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            {sneaker.image_url ? (
              <img
                src={sneaker.image_url}
                alt={`${sneaker.brand} ${sneaker.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">👟</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{sneaker.brand} {sneaker.model}</h3>
            <p className="text-gray-600">{sneaker.colorway}</p>
            <p className="text-sm text-gray-500">Size {userSneaker.size} • {userSneaker.condition}</p>
            {user && (
              <p className="text-sm text-gray-500">Owned by @{user.username}</p>
            )}
          </div>
          <div className="text-right">
            {userSneaker.asking_price ? (
              <div>
                <p className="text-sm text-gray-500">Asking Price</p>
                <p className="text-lg font-bold text-green-600">
                  ${userSneaker.asking_price.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-center">
                {userSneaker.status === 'not_for_sale' ? (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Collection
                  </div>
                ) : (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Open to Offers
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Special message for non-sale items */}
        {userSneaker.status === 'not_for_sale' && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Special Offer:</strong> This sneaker is marked as "Not For Sale" but you can still make an offer. 
              Sometimes the right price can change someone's mind!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Offer Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Your Offer *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-lg font-semibold"
                step="0.01"
                min="1"
                required
                disabled={loading}
              />
            </div>
            
            {/* Suggested offer */}
            {suggestedOffer && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Suggested:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(suggestedOffer.toString())}
                  disabled={loading}
                  className="h-7 px-2 text-xs"
                >
                  ${suggestedOffer.toLocaleString()}
                </Button>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to make your offer more compelling..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={loading}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {message.length}/500 characters
            </p>
          </div>

          {/* Offer Details */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Offer Details</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your offer will expire in 7 days</li>
              <li>• The seller will be notified immediately</li>
              <li>• You can withdraw your offer anytime before acceptance</li>
              <li>• If accepted, you'll be contacted to arrange payment</li>
            </ul>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !amount}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Offer...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Submit Offer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}