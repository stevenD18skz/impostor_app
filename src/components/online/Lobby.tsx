import { Users, Play, Settings, Home, Book, Drama, Clock, LogOut } from 'lucide-react';
import { categorias } from '@/app/lib/data';
import { useState, useEffect } from 'react';
import NumberInput from '@/components/ui/NumberInput';

interface LobbyProps {
  room: any;
  player: any;
  settingsRoom: any;
  updateSettings: (settings: any) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  loading: {
    leaving: boolean;
    updating: boolean;
    starting: boolean;
    confirming: boolean;
    ending: boolean;
    resetting: boolean;
  };
}

export default function Lobby({ room, player, settingsRoom, updateSettings, onStartGame, onLeaveRoom, loading }: LobbyProps) {
  const [settingsForms, setSettingsForms] = useState({
    category: settingsRoom.category,
    numImpostors: settingsRoom.numImpostors,
    timeLimit: settingsRoom.timeLimit
  });

  const updateSettingsForms = (settings: any) => {
    setSettingsForms(settings);
    updateSettings(settings);
  };

  useEffect(() => {
    setSettingsForms(room.settings)
  }, [room]);

  const handleIncrementImpostors = () => {
    const max = Math.max(1, room.players.length - 1);
    if (settingsForms.numImpostors < max) {
      updateSettingsForms({ ...settingsForms, numImpostors: settingsForms.numImpostors + 1 });
    }
  };

  const handleDecrementImpostors = () => {
    if (settingsForms.numImpostors > 1) {
      updateSettingsForms({ ...settingsForms, numImpostors: settingsForms.numImpostors - 1 });
    }
  };

  const handleIncrementTime = () => {
    if (settingsForms.timeLimit < 600) {
      updateSettingsForms({ ...settingsForms, timeLimit: Math.min(settingsForms.timeLimit + 30, 600) });
    }
  };

  const handleDecrementTime = () => {
    if (settingsForms.timeLimit > 60) {
      updateSettingsForms({ ...settingsForms, timeLimit: Math.max(settingsForms.timeLimit - 30, 60) });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-center gap-4">
        
        <div className="flex flex-col items-center justify-center">
          <h2 className="flex items-center justify-center gap-2 text-4xl font-bold text-(--color-main)">
            <Home size={42} strokeWidth={3} />
            Sala: {room.code}
          </h2>
          <p className="text-(--color-detail) text-lg">Esperando jugadores...</p>
        </div>
      </header>

      <main className="flex gap-4">
        {/* Players List */}
        <div className="flex-1 rounded-2xl p-6 bg-white/10 backdrop-blur">
          <h3 className="flex items-center justify-center gap-2 text-2xl font-bold text-(--color-primary) mb-4">
            <Users size={24} strokeWidth={3} />
            Jugadores ({room.players.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {room.players.map((p: any, idx: number) => (
              <div key={idx} className={` rounded-xl p-3 flex items-center gap-3 ${p.name === player.name ? 'bg-purple-500' : 'bg-white/10'}`}>
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-(--color-secondary) text-xl font-bold">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="text-(--color-secondary) text-xl font-medium">{p.name}</span>
                {p.is_host && (
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
            Configuración {player.is_host ? '(Host)' : '(Ver)'}
          </h3>

          <div className="space-y-4">
            {/* Categoría */}
            <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
              <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
                <Book size={24} strokeWidth={3} />
                Categoría
              </label>
              {player.is_host ? (
                <select
                  value={settingsForms.category}
                  onChange={(e) => updateSettingsForms({ ...settingsForms, category: e.target.value })}
                  className="w-full px-4 py-3 text-xl cursor-pointer hover:bg-white/30 bg-white/20 text-(--color-secondary) rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary) focus:outline-none"
                >
                  {Object.keys(categorias).map(key => (
                    <option key={key} value={key} className="bg-slate-800">
                      {/* @ts-ignore */}
                      {categorias[key].nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-(--color-secondary) text-xl font-medium text-center">
                  {/* @ts-ignore */}
                  {categorias[settingsForms.category]?.nombre || settingsForms.category}
                </div>
              )}
            </div>

            {/* Número de Impostores */}
            {player.is_host ? (
              <NumberInput
                label="Número de Impostores"
                icon={Drama}
                readOnly={true}
                name="numImpostors"
                value={settingsForms.numImpostors}
                min={1}
                max={Math.max(1, room.players.length - 1)}
                onChange={(e) => updateSettingsForms({ ...settingsForms, numImpostors: parseInt(e.target.value) })}
                onIncrement={handleIncrementImpostors}
                onDecrement={handleDecrementImpostors}
              />
            ) : (
              <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
                <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
                  <Drama size={24} strokeWidth={3} />
                  Número de Impostores
                </label>
                <div className="text-(--color-secondary) text-2xl font-medium text-center">{settingsForms.numImpostors}</div>
              </div>
            )}

            {/* Tiempo del Juego */}
            {player.is_host ? (
              <NumberInput
                label="Tiempo del Juego (segundos)"
                icon={Clock}
                readOnly={true}
                name="timeLimit"
                value={settingsForms.timeLimit}
                min={60}
                max={600}
                step={30}
                onChange={(e) => updateSettingsForms({ ...settingsForms, timeLimit: parseInt(e.target.value) })}
                onIncrement={handleIncrementTime}
                onDecrement={handleDecrementTime}
              />
            ) : (
              <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
                <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
                  <Clock size={24} strokeWidth={3} />
                  Tiempo del Juego (segundos)
                </label>
                <div className="text-(--color-secondary) text-2xl font-medium text-center">{settingsForms.timeLimit}</div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-4">
        <button
          onClick={onLeaveRoom}
          className="flex flex-1 items-center justify-center gap-1 py-4 px-8 w-full rounded-xl cursor-pointer text-xl bg-slate-600 text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
          >
          <LogOut size={32} strokeWidth={3} />
          {loading.leaving ? 'Saliendo...' : 'Salir de la sala'}
        </button>

        {player.is_host ? (
          <button
            onClick={onStartGame}
            disabled={room.players.length < 3}
            className="flex flex-1 items-center justify-center gap-1 py-4 px-8 w-full rounded-xl text-xl bg-pink-600 text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            <Play size={32} strokeWidth={3} />
            {loading.starting ? 'Iniciando...' : 'Iniciar Partida'}
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
