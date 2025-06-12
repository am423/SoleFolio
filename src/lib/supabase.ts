import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create a safe client creation function that handles missing environment variables
function createSupabaseClient() {
  // Check if we're in a browser environment and have real credentials
  const isClient = typeof window !== 'undefined'
  
  // During build time or when environment variables are missing, create a dummy client
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isClient) {
      console.error('Supabase environment variables not found in browser')
    }
    return createClient('https://dummy.supabase.co', 'dummy-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  // Log successful connection in development
  if (isClient && process.env.NODE_ENV === 'development') {
    console.log('✅ Supabase client initialized:', supabaseUrl)
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

function createSupabaseAdminClient() {
  const isClient = typeof window !== 'undefined'
  
  // During build time or when environment variables are missing, create a dummy client
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    if (isClient) {
      console.warn('Supabase admin environment variables not found, using anon key')
    }
    
    // Fallback to regular client if service role key is missing
    if (supabaseUrl && supabaseAnonKey) {
      return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }
    
    return createClient('https://dummy.supabase.co', 'dummy-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export const supabase = createSupabaseClient()
export const supabaseAdmin = createSupabaseAdminClient()