'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { notificationsAPI, Notification } from '@/lib/api/notifications'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  DollarSign, 
  UserPlus, 
  Heart,
  TrendingDown,
  Package,
  Loader2,
  BellOff
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function NotificationsPage() {
  const { userProfile } = useAuthContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  useEffect(() => {
    if (userProfile) {
      loadNotifications()
      subscribeToRealTimeNotifications()
    }
  }, [userProfile])

  const loadNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getUserNotifications(50)
      if (data) {
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToRealTimeNotifications = () => {
    if (!userProfile) return

    const channel = notificationsAPI.subscribeToNotifications(
      userProfile.id,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new, ...prev])
        }
      }
    )

    return () => {
      channel.unsubscribe()
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true)
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setMarkingAllRead(false)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationsAPI.deleteNotification(notificationId)
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      )
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer_received':
        return <DollarSign className="w-5 h-5 text-green-600" />
      case 'offer_accepted':
        return <Check className="w-5 h-5 text-green-600" />
      case 'offer_declined':
        return <Heart className="w-5 h-5 text-red-600" />
      case 'new_follower':
        return <UserPlus className="w-5 h-5 text-blue-600" />
      case 'price_drop':
        return <TrendingDown className="w-5 h-5 text-orange-600" />
      case 'new_sneaker':
        return <Package className="w-5 h-5 text-purple-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'offer_received':
      case 'offer_accepted':
        return 'border-l-green-500 bg-green-50'
      case 'offer_declined':
        return 'border-l-red-500 bg-red-50'
      case 'new_follower':
        return 'border-l-blue-500 bg-blue-50'
      case 'price_drop':
        return 'border-l-orange-500 bg-orange-50'
      case 'new_sneaker':
        return 'border-l-purple-500 bg-purple-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-gray-600">Loading notifications...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="text-purple-600" />
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-2">
                Stay updated with offers, follows, and market activity
              </p>
            </div>
            
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={markingAllRead}
                variant="outline"
                className="flex items-center gap-2"
              >
                {markingAllRead ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500 mb-6">
              When you receive offers, get new followers, or there's market activity, you'll see it here.
            </p>
            <Button asChild variant="outline">
              <Link href="/discover">Discover Collectors</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow ${
                  getNotificationColor(notification.type)
                } ${!notification.read ? 'ring-1 ring-purple-200' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className={`mt-1 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action buttons for specific notification types */}
                  {notification.type === 'offer_received' && notification.data?.offer_id && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" asChild>
                        <Link href={`/offers`}>
                          View Offer
                        </Link>
                      </Button>
                    </div>
                  )}

                  {notification.type === 'new_follower' && notification.data?.follower_username && (
                    <div className="mt-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/profile/${notification.data.follower_username}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {notifications.length >= 50 && (
          <div className="mt-8 text-center">
            <Button variant="outline">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}