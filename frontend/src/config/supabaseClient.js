import { createClient } from '@supabase/supabase-js'

// Estas variáveis virão de um ficheiro .env que vamos criar a seguir
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)