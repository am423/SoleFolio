'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OfferCard } from '@/components/offers/OfferCard'
import { offerAPI } from '@/lib/api/offers'
import { OfferWithDetails } from '@/lib/database.types'
import { Loader2, Inbox, Send, DollarSign } from 'lucide-react'

export default function OffersPage() {
  const [receivedOffers, setReceivedOffers] = useState<OfferWithDetails[]>([])
  const [sentOffers, setSentOffers] = useState<OfferWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    setLoading(true)
    try {
      const [received, sent] = await Promise.all([
        offerAPI.getUserOffers('received'),
        offerAPI.getUserOffers('sent')
      ])

      if (received.data) setReceivedOffers(received.data)
      if (sent.data) setSentOffers(sent.data)
    } catch (error) {
      console.error('Error loading offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const pendingReceived = receivedOffers.filter(offer => offer.status === 'pending')
  const pendingSent = sentOffers.filter(offer => offer.status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-gray-600">Loading your offers...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="text-green-600" />
            Offers
          </h1>
          <p className="text-gray-600 mt-2">
            Manage offers you've received and sent
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Inbox className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Received</h3>
                <p className="text-gray-500">{pendingReceived.length} pending</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{receivedOffers.length}</div>
              <p className="text-sm text-gray-500">Total offers received</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Sent</h3>
                <p className="text-gray-500">{pendingSent.length} pending</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{sentOffers.length}</div>
              <p className="text-sm text-gray-500">Total offers sent</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Value</h3>
                <p className="text-gray-500">Active offers</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                ${[...pendingReceived, ...pendingSent]
                  .reduce((sum, offer) => sum + offer.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">Pending offer value</p>
            </div>
          </div>
        </div>

        {/* Offers Tabs */}
        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Received ({receivedOffers.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent ({sentOffers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No offers received</h3>
                <p className="text-gray-500">
                  When someone makes an offer on your sneakers, they'll appear here.
                </p>
              </div>
            ) : (
              receivedOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  type="received"
                  onUpdate={loadOffers}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No offers sent</h3>
                <p className="text-gray-500">
                  Start making offers on sneakers you want to add them to your collection!
                </p>
              </div>
            ) : (
              sentOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  type="sent"
                  onUpdate={loadOffers}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}