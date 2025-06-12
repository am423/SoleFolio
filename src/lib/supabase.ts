import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create a safe client creation function that handles missing environment variables
function createSupabaseClient() {
  // During build time or when environment variables are missing, create a dummy client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found, creating dummy client')
    return createClient('https://dummy.supabase.co', 'dummy-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
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
  // During build time or when environment variables are missing, create a dummy client
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase admin environment variables not found, creating dummy client')
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