import { createClient } from '@supabase/supabase-js';

// Obtén estas credenciales de tu proyecto en Supabase
// Para modo local (sin multijugador), estas pueden estar vacías
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Nota: Las credenciales de Supabase no están configuradas. El modo multijugador no funcionará, pero puedes seguir usando el modo local.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
