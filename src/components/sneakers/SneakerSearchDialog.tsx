'use client'

import { useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { sneakerAPI } from '@/lib/api/sneakers'
import { Sneaker } from '@/lib/database.types'

interface SneakerSearchDialogProps {
  open: boolean
  onClose: () => void
  onSneakerSelect: (sneaker: Sneaker) => void
}

export function SneakerSearchDialog({ open, onClose, onSneakerSelect }: SneakerSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Sneaker[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const debounceTimer = setTimeout(async () => {
        setLoading(true)
        try {
          const { data, error } = await sneakerAPI.searchSneakers(searchQuery)
          if (data) {
            setSearchResults(data)
          }
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setLoading(false)
        }
      }, 300)

      return () => clearTimeout(debounceTimer)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleSneakerSelect = (sneaker: Sneaker) => {
    onSneakerSelect(sneaker)
    onClose()
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Sneaker to Collection</DialogTitle>
          <DialogDescription>
            Search for a sneaker to add to your collection
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by brand, model, or colorway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading && (
              <div className="text-center py-8 text-gray-500">
                Searching...
              </div>
            )}
            
            {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sneakers found. Try a different search term.
              </div>
            )}
            
            {searchResults.map((sneaker) => (
              <div
                key={sneaker.id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSneakerSelect(sneaker)}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {sneaker.image_url ? (
                    <img
                      src={sneaker.image_url}
                      alt={`${sneaker.brand} ${sneaker.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">👟</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {sneaker.brand} {sneaker.model}
                  </h3>
                  <p className="text-gray-600">{sneaker.colorway}</p>
                  {sneaker.style_code && (
                    <p className="text-sm text-gray-500">{sneaker.style_code}</p>
                  )}
                  {sneaker.retail_price && (
                    <p className="text-sm text-green-600">
                      Retail: ${sneaker.retail_price}
                    </p>
                  )}
                </div>
                
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
          
          {searchQuery.length < 2 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Start typing to search for sneakers</p>
              <p className="text-sm">Try searching for "Jordan 1", "Yeezy 350", or "Air Force"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}