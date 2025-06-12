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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { sneakerAPI } from '@/lib/api/sneakers'
import { Sneaker, ConditionType, SaleStatus } from '@/lib/database.types'
import { Loader2, Heart, DollarSign } from 'lucide-react'

interface AddSneakerDialogProps {
  open: boolean
  onClose: () => void
  sneaker: Sneaker | null
}

const conditions: { value: ConditionType; label: string; description: string }[] = [
  { value: 'deadstock', label: 'Deadstock (DS)', description: 'Never worn, brand new' },
  { value: 'very_near_deadstock', label: 'Very Near Deadstock (VNDS)', description: 'Worn 1-2 times, like new' },
  { value: 'excellent', label: 'Excellent', description: 'Minimal wear, great condition' },
  { value: 'good', label: 'Good', description: 'Some wear but well maintained' },
  { value: 'fair', label: 'Fair', description: 'Noticeable wear but functional' },
  { value: 'poor', label: 'Poor', description: 'Heavy wear, beaters' },
]

const saleStatuses: { value: SaleStatus; label: string; description: string }[] = [
  { value: 'not_for_sale', label: 'Not For Sale', description: 'Personal collection item' },
  { value: 'open_to_offers', label: 'Open to Offers', description: 'Accepting offers but not actively selling' },
  { value: 'for_sale', label: 'For Sale', description: 'Actively selling with asking price' },
]

const shoeSizes = [
  '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', 
  '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', 
  '13.5', '14', '14.5', '15', '16', '17', '18'
]

export function AddSneakerDialog({ open, onClose, sneaker }: AddSneakerDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState<ConditionType>('excellent')
  const [status, setStatus] = useState<SaleStatus>('not_for_sale')
  const [askingPrice, setAskingPrice] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [story, setStory] = useState('')
  const [isGrail, setIsGrail] = useState(false)

  const resetForm = () => {
    setSize('')
    setCondition('excellent')
    setStatus('not_for_sale')
    setAskingPrice('')
    setPurchasePrice('')
    setPurchaseDate('')
    setStory('')
    setIsGrail(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sneaker || !size) return

    setLoading(true)
    setError('')

    try {
      const { error } = await sneakerAPI.addSneakerToCollection(sneaker.id, {
        size,
        condition,
        status,
        asking_price: askingPrice ? parseFloat(askingPrice) : undefined,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
        purchase_date: purchaseDate || undefined,
        story: story || undefined,
        is_grail: isGrail,
      })

      if (error) {
        setError(error.message)
      } else {
        onClose()
        resetForm()
        router.refresh() // Refresh to show new sneaker
      }
    } catch (err) {
      setError('Failed to add sneaker to collection')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!sneaker) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            Add {sneaker.brand} {sneaker.model} - {sneaker.colorway} to your collection
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
          <div>
            <h3 className="font-semibold">{sneaker.brand} {sneaker.model}</h3>
            <p className="text-gray-600">{sneaker.colorway}</p>
            {sneaker.style_code && (
              <p className="text-sm text-gray-500">{sneaker.style_code}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Size Selection */}
          <div className="space-y-2">
            <Label htmlFor="size">Size *</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select your size" />
              </SelectTrigger>
              <SelectContent>
                {shoeSizes.map((s) => (
                  <SelectItem key={s} value={s}>
                    US {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={(value: ConditionType) => setCondition(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div>
                      <div>{c.label}</div>
                      <div className="text-xs text-gray-500">{c.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sale Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Availability</Label>
            <Select value={status} onValueChange={(value: SaleStatus) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {saleStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <div>
                      <div>{s.label}</div>
                      <div className="text-xs text-gray-500">{s.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asking Price (if for sale) */}
          {status === 'for_sale' && (
            <div className="space-y-2">
              <Label htmlFor="askingPrice">Asking Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="askingPrice"
                  type="number"
                  placeholder="0.00"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  className="pl-10"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Purchase Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="pl-10"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          {/* Story */}
          <div className="space-y-2">
            <Label htmlFor="story">Your Story (Optional)</Label>
            <Textarea
              id="story"
              placeholder="Tell the story behind this sneaker... How did you get it? Why is it special to you?"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={3}
            />
          </div>

          {/* Grail Toggle */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsGrail(!isGrail)}
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                isGrail 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${isGrail ? 'fill-current' : ''}`} />
              <span className="font-medium">Mark as Grail</span>
            </button>
            {isGrail && (
              <p className="text-sm text-red-600">This is one of your holy grail sneakers!</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !size}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Collection'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}