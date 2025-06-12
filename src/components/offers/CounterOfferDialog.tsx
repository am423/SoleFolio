'use client'

import { useState } from 'react'
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
import { OfferWithDetails } from '@/lib/database.types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { Loader2, DollarSign, ArrowRightLeft, AlertTriangle, TrendingUp, Clock } from 'lucide-react'

interface CounterOfferDialogProps {
  open: boolean
  onClose: () => void
  originalOffer: OfferWithDetails | null
  onSuccess?: () => void
}

export function CounterOfferDialog({ open, onClose, originalOffer, onSuccess }: CounterOfferDialogProps) {
  const { userProfile } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    expiresIn: '24' // hours
  })

  if (!originalOffer || !userProfile) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const amount = parseFloat(formData.amount)
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      if (amount === originalOffer.amount) {
        throw new Error('Counter-offer amount must be different from the original offer')
      }

      // Calculate expiration time
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + parseInt(formData.expiresIn))

      // First, decline the original offer
      await offerAPI.updateOfferStatus(originalOffer.id, 'declined')

      // Then create a new counter-offer (seller becomes buyer, buyer becomes seller)
      const { error: createError } = await offerAPI.createOffer({
        user_sneaker_id: originalOffer.user_sneaker_id,
        buyer_id: originalOffer.seller_id, // Seller becomes buyer
        seller_id: originalOffer.buyer_id, // Original buyer becomes seller
        amount,
        message: formData.message || `Counter-offer to your $${originalOffer.amount} offer`,
        expires_at: expiresAt.toISOString(),
        parent_offer_id: originalOffer.id // Track the relationship
      })

      if (createError) throw createError

      onSuccess?.()
      onClose()
      
      // Reset form
      setFormData({
        amount: '',
        message: '',
        expiresIn: '24'
      })

    } catch (error: any) {
      setError(error.message || 'Failed to create counter-offer')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError(null)
      setFormData({
        amount: '',
        message: '',
        expiresIn: '24'
      })
      onClose()
    }
  }

  const sneakerName = `${originalOffer.user_sneaker?.sneaker?.brand} ${originalOffer.user_sneaker?.sneaker?.model}`
  const originalAmount = originalOffer.amount
  const marketValue = originalOffer.user_sneaker?.market_value
  const askingPrice = originalOffer.user_sneaker?.asking_price

  // Suggest counter-offer amounts
  const suggestedAmounts = [
    originalAmount * 1.1, // 10% higher
    originalAmount * 1.2, // 20% higher
    marketValue || originalAmount * 1.15, // Market value or 15% higher
    askingPrice || originalAmount * 1.25 // Asking price or 25% higher
  ].filter((amount, index, arr) => 
    amount > originalAmount && // Must be higher
    amount <= (askingPrice || originalAmount * 2) && // Not unreasonably high
    arr.indexOf(amount) === index // Remove duplicates
  ).slice(0, 3) // Max 3 suggestions

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            Make Counter-Offer
          </DialogTitle>
          <DialogDescription>
            Respond to the $${originalAmount} offer for {sneakerName} with your counter-offer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Original Offer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Original Offer</h4>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-lg">${originalAmount}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-600">From:</span>
              <span className="text-gray-900">@{originalOffer.buyer?.username}</span>
            </div>
            {originalOffer.message && (
              <div className="mt-2 text-sm text-gray-600 italic">
                "{originalOffer.message}"
              </div>
            )}
          </div>

          {/* Counter-Offer Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Your Counter-Offer Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="pl-8"
                required
              />
            </div>
            
            {/* Suggested Amounts */}
            {suggestedAmounts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Quick suggestions:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {suggestedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                      className="text-xs"
                    >
                      ${Math.round(amount)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Price context */}
            <div className="text-xs text-gray-500 space-y-1">
              {marketValue && (
                <div>Market value: ${marketValue}</div>
              )}
              {askingPrice && (
                <div>Asking price: ${askingPrice}</div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Explain your counter-offer or add any details..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{formData.message.length}/500 characters</p>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expiresIn" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expires In
            </Label>
            <select
              id="expiresIn"
              value={formData.expiresIn}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresIn: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
              <option value="168">1 week</option>
            </select>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ArrowRightLeft className="w-4 h-4 mr-2" />
            )}
            Send Counter-Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}