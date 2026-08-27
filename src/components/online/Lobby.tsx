'use client';

import {
  Users, Play, Settings, Home, Book, Drama, LogOut, Check, Link2, Share2,
} from 'lucide-react';
import { useState, useEffect, useSyncExternalStore } from 'react';

import { categorias } from '@/lib/data';
import NumberInput from '@/components/ui/NumberInput';
import {
  MIN_PLAYERS,
  maxImpostorsFor,
  type Player,
  type Settings as RoomSettings,
} from '@/lib/room';

const cats = categorias as Record<string, { nombre: string; palabras: string[] }>;

interface LobbyProps {
  code: string;
  /** Sale de Presence, no de una tabla: quien cierra la pestaña desaparece solo. */
  players: Player[];
  myId: string;
  hostId: string | null;
  isHost: boolean;
  settings: RoomSettings;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  leaving: boolean;
}

/*
  Invitar a la sala. En el móvil abre la hoja de compartir del sistema, que es
  de donde sale WhatsApp: el amigo recibe el mensaje y el enlace juntos, sin
  tener que pegar nada. Donde no existe esa hoja —casi todo el escritorio— se
  copia el enlace al portapapeles, que es lo que se podía hacer antes.
*/
type InviteState = 'idle' | 'copied' | 'failed';

/*
  Si el aparato sabe compartir es un dato del navegador, no del estado de React:
  se lee con `useSyncExternalStore`, igual que la sesión guardada. El servidor
  devuelve `false`, así que el HTML dice «Copiar enlace» y, ya en el cliente,
  React cambia el texto a «Invitar» sin que la hidratación se queje.

  La suscripción no hace nada a propósito: esto no cambia mientras la pantalla
  está abierta, así que no hay nada a lo que apuntarse.
*/
const subscribeNever = () => () => {};
const canShareNow = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';
const canShareOnServer = () => false;

function InviteButton({ code }: { code: string }) {
  const [state, setState] = useState<InviteState>('idle');
  const canShare = useSyncExternalStore(subscribeNever, canShareNow, canShareOnServer);

  useEffect(() => {
    if (state === 'idle') return;
    const t = setTimeout(() => setState('idle'), 2500);
    return () => clearTimeout(t);
  }, [state]);

  const invite = async () => {
    const link = window.location.href;

    if (canShare) {
      try {
        await navigator.share({
          title: 'El Impostor',
          text: `¡Únete a mi sala para jugar al Impostor! Código: ${code}`,
          url: link,
        });
        // La hoja del sistema ya da su propio acuse; repetirlo aquí sobra.
        return;
      } catch (err) {
        // Cerrar la hoja sin elegir a nadie no es un fallo: no hay que avisar.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Cualquier otro fallo cae al portapapeles, que aguanta más.
      }
    }

    try {
      await navigator.clipboard.writeText(link);
      setState('copied');
    } catch {
      // Sin portapapeles (http sin TLS, permiso denegado). El código está en
      // pantalla justo encima, así que se invita a dictarlo en vez de callar.
      setState('failed');
    }
  };

  const { Icon, label, tone } = {
    idle: canShare
      ? { Icon: Share2, label: 'Invitar amigos', tone: 'bg-cyan-600 hover:bg-cyan-700' }
      : { Icon: Link2, label: 'Copiar enlace', tone: 'bg-cyan-600 hover:bg-cyan-700' },
    copied: { Icon: Check, label: '¡Enlace copiado!', tone: 'bg-emerald-600 hover:bg-emerald-700' },
    failed: { Icon: Link2, label: `Dicta el código: ${code}`, tone: 'bg-slate-600 hover:bg-slate-700' },
  }[state];

  return (
    <button
      onClick={invite}
      title={canShare ? 'Compartir el enlace de la sala' : 'Copiar el enlace de la sala'}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer text-xl font-bold text-(--color-secondary) shadow-lg transition-all duration-300 ${tone}`}
    >
      <Icon size={24} strokeWidth={3} />
      {label}
    </button>
  );
}

export default function Lobby({
  code,
  players,
  myId,
  hostId,
  isHost,
  settings,
  updateSettings,
  onStartGame,
  onLeaveRoom,
  leaving,
}: LobbyProps) {
  // Copia local para que los botones respondan al instante. El host aplica su
  // propio cambio de una vez, así que este eco solo cubre el parpadeo entre
  // tocar y recibir el estado repartido.
  const [form, setForm] = useState<RoomSettings>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const maxImpostors = maxImpostorsFor(players.length);
  // Si alguien se fue, el número guardado puede haber quedado por encima del
  // tope. Se muestra ya recortado para que no se lea un valor imposible.
  const numImpostors = Math.min(form.numImpostors, maxImpostors);

  const change = (patch: Partial<RoomSettings>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    updateSettings(patch);
  };

  const missing = MIN_PLAYERS - players.length;
  const canStart = missing <= 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-center gap-2">
        <h2 className="flex items-center justify-center gap-2 text-4xl font-bold text-(--color-main)">
          <Home size={42} strokeWidth={3} />
          Sala: <span className="tracking-widest text-cyan-400">{code}</span>
        </h2>
        <InviteButton code={code} />
        <p className="text-(--color-detail) text-lg">Esperando jugadores...</p>
      </header>

      <main className="flex flex-col md:flex-row gap-4">
        {/* Jugadores */}
        <div className="flex-1 rounded-2xl p-6 bg-white/10 backdrop-blur">
          <h3 className="flex items-center justify-center gap-2 text-2xl font-bold text-(--color-primary) mb-4">
            <Users size={24} strokeWidth={3} />
            Jugadores ({players.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {players.length === 0 && (
              <p className="text-(--color-detail) text-lg animate-pulse">Conectando...</p>
            )}
            {players.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl p-3 flex items-center gap-3 ${p.id === myId ? 'bg-purple-500' : 'bg-white/10'}`}
              >
                <div className="w-10 h-10 shrink-0 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-(--color-secondary) text-xl font-bold">
                  {p.name?.trim()?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-(--color-secondary) text-xl font-medium truncate">
                  {p.name}
                </span>
                {p.id === hostId && (
                  <span className="ml-auto text-sm bg-amber-500 text-black px-2 py-1 rounded-full font-bold">
                    HOST
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configuración (host manda, el resto mira) */}
        <div className="flex-1 rounded-2xl p-6 bg-white/10 backdrop-blur">
          <h3 className="flex items-center justify-center gap-2 text-2xl font-bold text-(--color-primary) mb-4">
            <Settings size={24} strokeWidth={3} />
            Configuración {isHost ? '(Host)' : '(Ver)'}
          </h3>

          <div className="space-y-4">
            {/* Categoría */}
            <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
              <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
                <Book size={24} strokeWidth={3} />
                Categoría
              </label>
              {isHost ? (
                <select
                  value={form.category}
                  onChange={(e) => change({ category: e.target.value })}
                  className="w-full px-4 py-3 text-xl cursor-pointer hover:bg-white/30 bg-white/20 text-(--color-secondary) rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:outline-none"
                >
                  {Object.entries(cats).map(([key, cat]) => (
                    <option key={key} value={key} className="bg-slate-800">
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-(--color-secondary) text-xl font-medium text-center">
                  {cats[form.category]?.nombre ?? form.category}
                </div>
              )}
            </div>

            {/* Número de impostores */}
            {isHost ? (
              <NumberInput
                label="Número de Impostores"
                icon={Drama}
                readOnly
                name="numImpostors"
                value={numImpostors}
                min={1}
                max={maxImpostors}
                onChange={(e) => change({ numImpostors: parseInt(e.target.value, 10) })}
                onIncrement={() =>
                  numImpostors < maxImpostors && change({ numImpostors: numImpostors + 1 })
                }
                onDecrement={() => numImpostors > 1 && change({ numImpostors: numImpostors - 1 })}
              />
            ) : (
              <ReadOnlyField label="Número de Impostores" icon={Drama} value={numImpostors} />
            )}
          </div>
        </div>
      </main>

      <footer className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onLeaveRoom}
          disabled={leaving}
          className="flex flex-1 w-full items-center justify-center gap-1 py-4 px-8 rounded-xl cursor-pointer text-xl bg-slate-600 text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300 disabled:opacity-50"
        >
          <LogOut size={32} strokeWidth={3} />
          {leaving ? 'Saliendo...' : 'Salir de la sala'}
        </button>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className="flex flex-1 w-full items-center justify-center gap-1 py-4 px-8 rounded-xl cursor-pointer text-xl bg-pink-600 text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={32} strokeWidth={3} />
            {canStart ? 'Iniciar Partida' : `Faltan ${missing} jugador(es)`}
          </button>
        ) : (
          <div className="flex-1 text-(--color-detail) text-xl text-center animate-pulse">
            Esperando a que el anfitrión inicie la partida...
          </div>
        )}
      </footer>
    </div>
  );
}

function ReadOnlyField({
  label,
  icon: Icon,
  value,
}: {
  label: string;
  icon: typeof Drama;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
      <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
        <Icon size={24} strokeWidth={3} />
        {label}
      </label>
      <div className="text-(--color-secondary) text-2xl font-medium text-center">{value}</div>
    </div>
  );
}
