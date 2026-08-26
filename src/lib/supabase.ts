import { createClient } from '@supabase/supabase-js';

// El modo online NO usa base de datos: solo el canal Realtime (Presence +
// Broadcast). Por eso alcanza con la URL del proyecto y la anon key.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/**
 * Sin credenciales el cliente apuntaría a un host inventado y cada intento de
 * entrar a una sala se quedaría colgado hasta el timeout, sin decir por qué.
 * Se expone la bandera para avisarlo en pantalla en vez de fallar en silencio.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(
  url || 'https://placeholder-project.supabase.co',
  anonKey || 'placeholder-key',
  {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 20 } },
  },
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[impostor] Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local. ' +
      'El modo online no puede conectarse; el modo local sigue funcionando.',
  );
}
