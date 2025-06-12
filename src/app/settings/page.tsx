'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { 
  Settings, 
  User, 
  Camera, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Globe,
  Instagram
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SettingsPage() {
  const { userProfile, refreshProfile } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    website_url: '',
    instagram_handle: '',
    avatar_url: ''
  })

  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        full_name: userProfile.full_name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website_url: userProfile.website_url || '',
        instagram_handle: userProfile.instagram_handle || '',
        avatar_url: userProfile.avatar_url || ''
      })
    }
  }, [userProfile])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!userProfile) return

    setLoading(true)
    setSaveMessage(null)

    try {
      // Validate username (basic validation)
      if (formData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long')
      }

      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        throw new Error('Username can only contain letters, numbers, and underscores')
      }

      // Clean up URLs
      const cleanWebsiteUrl = formData.website_url.trim()
      const websiteUrl = cleanWebsiteUrl && !cleanWebsiteUrl.startsWith('http') 
        ? `https://${cleanWebsiteUrl}` 
        : cleanWebsiteUrl

      const instagramHandle = formData.instagram_handle.replace('@', '').trim()

      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username.trim(),
          full_name: formData.full_name.trim(),
          bio: formData.bio.trim(),
          location: formData.location.trim(),
          website_url: websiteUrl,
          instagram_handle: instagramHandle,
          avatar_url: formData.avatar_url.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id)

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Username is already taken')
        }
        throw error
      }

      // Refresh the profile in the auth context
      await refreshProfile()

      setSaveMessage({
        type: 'success',
        message: 'Profile updated successfully!'
      })

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)

    } catch (error: any) {
      setSaveMessage({
        type: 'error',
        message: error.message || 'Failed to update profile'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userProfile) return

    // Basic validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setSaveMessage({
        type: 'error',
        message: 'Image must be smaller than 5MB'
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      setSaveMessage({
        type: 'error',
        message: 'Please select an image file'
      })
      return
    }

    setLoading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${userProfile.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }))

      setSaveMessage({
        type: 'success',
        message: 'Avatar uploaded! Click Save to update your profile.'
      })

    } catch (error: any) {
      setSaveMessage({
        type: 'error',
        message: error.message || 'Failed to upload avatar'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-gray-600">Loading profile...</p>
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
            <Settings className="text-purple-600" />
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Customize your profile and personal information
          </p>
        </div>

        {/* Alert Messages */}
        {saveMessage && (
          <Alert className={`mb-6 ${saveMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {saveMessage.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Photo
              </h2>
              
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-4">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                
                <div className="text-center">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Camera className="w-4 h-4 mr-2" />
                    )}
                    Upload Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>

              <div className="space-y-6">
                {/* Username */}
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="your_username"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This is how other users will find you. Letters, numbers, and underscores only.
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Your full name"
                    className="mt-1"
                  />
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell the community about yourself and your sneaker journey..."
                    rows={4}
                    className="mt-1"
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="New York, NY"
                    className="mt-1"
                  />
                </div>

                {/* Website */}
                <div>
                  <Label htmlFor="website_url" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="yourwebsite.com"
                    className="mt-1"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <Label htmlFor="instagram_handle" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram Handle
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                    <Input
                      id="instagram_handle"
                      value={formData.instagram_handle}
                      onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
                      placeholder="username"
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}