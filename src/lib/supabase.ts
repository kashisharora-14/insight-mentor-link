/**
 * Supabase client configuration
 * Handles initialization and configuration of Supabase client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hewepoiktjlrtmraknpt.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Client configuration options
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
}

// Create the main Supabase client (for frontend use)
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  supabaseOptions
)

// Create admin client (for server-side operations, if needed)
export const supabaseAdmin: SupabaseClient | null = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Connection validation function
export const validateSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('_supabase_migrations').select('version').limit(1)
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "relation does not exist" which is fine for new projects
      console.error('Supabase connection validation failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection validated successfully')
    return true
  } catch (error) {
    console.error('❌ Supabase connection validation error:', error)
    return false
  }
}

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
}

// Helper function to get session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting current session:', error)
    return null
  }
  
  return session
}

// Auth state change listener setup
export const setupAuthStateListener = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// Export types for TypeScript support
export type { SupabaseClient } from '@supabase/supabase-js'

export default supabase