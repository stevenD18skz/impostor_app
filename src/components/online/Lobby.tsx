import { Users, Play, Settings, Home, Book, Drama, Clock, LogOut } from 'lucide-react';
import { categorias } from '@/lib/data';
import { useState, useEffect } from 'react';
import NumberInput from '@/components/ui/NumberInput';
import type { Player, Settings as RoomSettings } from '@/lib/room';

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

  // Nunca todos impostores: tiene que quedar alguien que sepa la palabra.
  const maxImpostors = Math.max(1, Math.floor(players.length / 2));

  const change = (patch: Partial<RoomSettings>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    updateSettings(patch);
  };

  const canStart = players.length >= 3;

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center justify-center">
          <h2 className="flex items-center justify-center gap-2 text-4xl font-bold text-(--color-main)">
            <Home size={42} strokeWidth={3} />
            Sala: {code}
          </h2>
          <p className="text-(--color-detail) text-lg">Esperando jugadores...</p>
        </div>
      </header>

      <main className="flex gap-4">
        {/* Players List */}
        <div className="flex-1 rounded-2xl p-6 bg-white/10 backdrop-blur">
          <h3 className="flex items-center justify-center gap-2 text-2xl font-bold text-(--color-primary) mb-4">
            <Users size={24} strokeWidth={3} />
            Jugadores ({players.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {players.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl p-3 flex items-center gap-3 ${p.id === myId ? 'bg-purple-500' : 'bg-white/10'}`}
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-(--color-secondary) text-xl font-bold">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="text-(--color-secondary) text-xl font-medium">{p.name}</span>
                {p.id === hostId && (
                  <span className="text-sm bg-amber-500 text-black px-2 py-1 rounded-full font-bold">
                    HOST
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings (Host Only or View Only) */}
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
                  className="w-full px-4 py-3 text-xl cursor-pointer hover:bg-white/30 bg-white/20 text-(--color-secondary) rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary) focus:outline-none"
                >
                  {Object.keys(categorias).map((key) => (
                    <option key={key} value={key} className="bg-slate-800">
                      {/* @ts-ignore */}
                      {categorias[key].nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-(--color-secondary) text-xl font-medium text-center">
                  {/* @ts-ignore */}
                  {categorias[form.category]?.nombre || form.category}
                </div>
              )}
            </div>

            {/* Número de Impostores */}
            {isHost ? (
              <NumberInput
                label="Número de Impostores"
                icon={Drama}
                readOnly={true}
                name="numImpostors"
                value={form.numImpostors}
                min={1}
                max={maxImpostors}
                onChange={(e) => change({ numImpostors: parseInt(e.target.value) })}
                onIncrement={() =>
                  form.numImpostors < maxImpostors && change({ numImpostors: form.numImpostors + 1 })
                }
                onDecrement={() =>
                  form.numImpostors > 1 && change({ numImpostors: form.numImpostors - 1 })
                }
              />
            ) : (
              <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
                <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
                  <Drama size={24} strokeWidth={3} />
                  Número de Impostores
                </label>
                <div className="text-(--color-secondary) text-2xl font-medium text-center">
                  {form.numImpostors}
                </div>
              </div>
            )}

            {/* Tiempo del Juego */}
            {isHost ? (
              <NumberInput
                label="Tiempo del Juego (segundos)"
                icon={Clock}
                readOnly={true}
                name="timeLimit"
                value={form.timeLimit}
                min={60}
                max={600}
                step={30}
                onChange={(e) => change({ timeLimit: parseInt(e.target.value) })}
                onIncrement={() =>
                  form.timeLimit < 600 && change({ timeLimit: Math.min(form.timeLimit + 30, 600) })
                }
                onDecrement={() =>
                  form.timeLimit > 60 && change({ timeLimit: Math.max(form.timeLimit - 30, 60) })
                }
              />
            ) : (
              <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
                <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
                  <Clock size={24} strokeWidth={3} />
                  Tiempo del Juego (segundos)
                </label>
                <div className="text-(--color-secondary) text-2xl font-medium text-center">
                  {form.timeLimit}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={`flex items-center justify-center gap-4 ${isHost ? 'flex-row' : 'flex-col'}`}>
        <button
          onClick={onLeaveRoom}
          className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl cursor-pointer text-xl bg-slate-600 text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
        >
          <LogOut size={32} strokeWidth={3} />
          {leaving ? 'Saliendo...' : 'Salir de la sala'}
        </button>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className="flex flex-1 items-center justify-center gap-1 py-4 px-8 w-full rounded-xl cursor-pointer text-xl bg-pink-600 text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            <Play size={32} strokeWidth={3} />
            {canStart ? 'Iniciar Partida' : `Faltan ${3 - players.length} jugador(es)`}
          </button>
        ) : (
          <div className="text-(--color-detail) text-xl text-center animate-pulse">
            Esperando a que el anfitrión inicie la partida...
          </div>
        )}
      </footer>
    </div>
  );
}
