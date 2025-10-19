/**
 * Supabase connection test utility
 * Use this to validate Supabase configuration and connection
 */

import { supabase, validateSupabaseConnection } from '../lib/supabase'

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test 1: Basic connection validation
    const isConnected = await validateSupabaseConnection()
    console.log(`Connection Status: ${isConnected ? '✅ Connected' : '❌ Failed'}`)
    
    // Test 2: Auth service test
    console.log('🔐 Testing Auth service...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth service error:', authError)
    } else {
      console.log('✅ Auth service working')
      console.log('Current session:', authData.session ? 'Active' : 'None')
    }
    
    // Test 3: Database access test (will fail until we create tables)
    console.log('🗄️ Testing Database access...')
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Database tables not created yet (expected for new setup)')
        } else {
          console.error('❌ Database error:', error)
        }
      } else {
        console.log('✅ Database access working')
      }
    } catch (dbError) {
      console.log('⚠️ Database not accessible yet (expected for new setup)')
    }
    
    // Test 4: Real-time service test
    console.log('⚡ Testing Real-time service...')
    const channel = supabase.channel('test-channel')
    
    if (channel) {
      console.log('✅ Real-time service initialized')
      channel.unsubscribe()
    } else {
      console.log('❌ Real-time service failed')
    }
    
    return {
      connection: isConnected,
      auth: !authError,
      realtime: !!channel
    }
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error)
    return {
      connection: false,
      auth: false,
      realtime: false
    }
  }
}

// Helper function to display environment variables (without exposing keys)
export const displaySupabaseConfig = () => {
  console.log('📋 Supabase Configuration:')
  console.log(`URL: https://hewepoiktjlrtmraknpt.supabase.co`)
  console.log(`Anon Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`Service Role Key: ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`)
}