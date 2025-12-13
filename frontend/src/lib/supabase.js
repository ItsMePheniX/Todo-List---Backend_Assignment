import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Guard: provide clear error if env vars are missing and avoid creating client
let supabase
if (!supabaseUrl || !supabaseAnonKey) {
	// eslint-disable-next-line no-console
	console.error(
		'Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env',
	)
} else {
	supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
