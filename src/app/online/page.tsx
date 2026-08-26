'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DoorOpen } from 'lucide-react';

import GameSetup from '@/components/online/GameSetup';
import Shell, { NotConfigured } from '@/components/online/Shell';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  newRoomCode,
  normalizeCode,
  randomId,
  subscribeSession,
  writeSession,
} from '@/lib/room';

/*
  La antesala: acá solo se elige nombre y sala. Ni se abre el canal ni se
  comprueba nada contra el servidor — de eso se encarga `/room/[code]`, que es
  el único que se conecta. Sondear la sala desde acá era lo que rompía todo:
  dejaba el canal a medio cerrar y el de la sala se quedaba mudo.
*/

export default function OnlinePage() {
  const router = useRouter();
  // La sesión guardada vive en localStorage, que es un sistema externo: se lee
  // con `useSyncExternalStore` y no copiándola a estado dentro de un efecto.
  const saved = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  const go = (code: string, name: string, isHost: boolean) => {
    writeSession({ code, playerId: randomId(), name: name.trim(), isHost });
    router.push(`/room/${code}`);
  };

  if (!isSupabaseConfigured) return <NotConfigured />;

  return (
    <Shell>
      <button
        onClick={() => router.push('/')}
        className="absolute top-2 left-2 text-cyan-400 hover:text-pink-400 transition-colors flex items-center gap-2 font-press-start text-xs z-20 hover:-translate-x-1"
      >
        <ArrowLeft size={20} /> VOLVER
      </button>

      <div className="mt-8">
        {saved && (
          <button
            onClick={() => router.push(`/room/${saved.code}`)}
            className="flex items-center justify-center gap-2 w-full mb-6 py-3 px-6 rounded-xl text-xl bg-amber-600/80 text-(--color-secondary) font-bold hover:bg-amber-600 transition-all duration-300"
          >
            <DoorOpen size={24} strokeWidth={3} />
            Volver a la sala {saved.code}
          </button>
        )}

        <GameSetup
          onCreate={async (name) => go(newRoomCode(), name, true)}
          onJoin={async (code, name) => go(normalizeCode(code), name, false)}
        />
      </div>
    </Shell>
  );
}
