import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProfilePageClient } from '@/components/profile/ProfilePageClient'
import { socialAPI } from '@/lib/api/social'

interface ProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  // During build time, skip API calls to prevent build failures
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    return {
      title: `${params.username} - SoleFolio`,
      description: `Check out ${params.username}'s sneaker collection on SoleFolio`,
    }
  }

  try {
    const { data: user } = await socialAPI.getUserByUsername(params.username)
    
    if (!user) {
      return {
        title: 'User Not Found - SoleFolio',
      }
    }

    return {
      title: `${user.full_name || user.username} (@${user.username}) - SoleFolio`,
      description: user.bio || `Check out ${user.username}'s sneaker collection on SoleFolio`,
      openGraph: {
        title: `${user.full_name || user.username} (@${user.username})`,
        description: user.bio || `Check out ${user.username}'s sneaker collection on SoleFolio`,
        images: user.avatar_url ? [user.avatar_url] : [],
      },
      twitter: {
        card: 'summary',
        title: `${user.full_name || user.username} (@${user.username})`,
        description: user.bio || `Check out ${user.username}'s sneaker collection on SoleFolio`,
        images: user.avatar_url ? [user.avatar_url] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Profile - SoleFolio',
      description: 'SoleFolio - The Instagram for Sneakerheads',
    }
  }
}

async function getUser(username: string) {
  // During build time, return null to prevent build failures
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    return null
  }

  try {
    const { data: user, error } = await socialAPI.getUserByUsername(username)
    if (error || !user) {
      return null
    }
    return user
  } catch (error) {
    return null
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getUser(params.username)

  if (!user) {
    notFound()
  }

  return <ProfilePageClient initialUser={user} />
}