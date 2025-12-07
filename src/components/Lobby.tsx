import { useState } from 'react';
import { Users, Play, Settings } from 'lucide-react';
import { categorias } from '@/app/lib/data';

interface LobbyProps {
  room: any;
  isHost: boolean;
  onUpdateSettings: (settings: any) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  loadingState: boolean;
}

export default function Lobby({ room, isHost, onUpdateSettings, onStartGame, onLeaveRoom, loadingState }: LobbyProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    onUpdateSettings({ [key]: value });
  };

  return (
    <div className="text-center space-y-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={() => { onLeaveRoom() }}>
          {loadingState ? 'Saliendo...' : 'Salir de la sala'}
        </button>
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-white mb-2">🏠 Sala: {room.code}</h2>
          <p className="text-purple-200">Esperando jugadores...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Players List */}
        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Users size={24} />
            Jugadores ({room.players.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {room.players.map((player: any, idx: number) => (
              <div key={idx} className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  {player.name[0].toUpperCase()}
                </div>
                <span className="text-white font-medium">{player.name}</span>
                {player.isHost && (
                  <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
                    HOST
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings (Host Only or View Only) */}
        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Settings size={24} />
            Configuración
          </h3>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-purple-200 text-sm mb-1">Categoría</label>
              {isHost ? (
                <select
                  value={room.settings.category}
                  onChange={(e) => handleSettingChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:outline-none"
                >
                  {Object.keys(categorias).map(key => (
                    <option key={key} value={key} className="bg-gray-800">
                      {/* @ts-ignore */}
                      {categorias[key].nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-white font-medium">
                  {/* @ts-ignore */}
                  {categorias[room.settings.category]?.nombre || room.settings.category}
                </div>
              )}
            </div>

            <div>
              <label className="block text-purple-200 text-sm mb-1">Impostores</label>
              {isHost ? (
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, room.players.length - 1)}
                  value={room.settings.numImpostors}
                  onChange={(e) => handleSettingChange('numImpostors', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:outline-none"
                />
              ) : (
                <div className="text-white font-medium">{room.settings.numImpostors}</div>
              )}
            </div>

            <div>
              <label className="block text-purple-200 text-sm mb-1">Tiempo (seg)</label>
              {isHost ? (
                <input
                  type="number"
                  step="30"
                  value={room.settings.timeLimit}
                  onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:outline-none"
                />
              ) : (
                <div className="text-white font-medium">{room.settings.timeLimit}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isHost ? (
        <button
          onClick={onStartGame}
          disabled={room.players.length < 3}
          className="w-full bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:transform-none"
        >
          <Play className="inline mr-2 mb-1" size={24} />
          {loadingState ? 'Iniciando...' : 'Iniciar Partida'}
        </button>
      ) : (
        <div className="text-purple-200 animate-pulse">
          Esperando a que el anfitrión inicie la partida...
        </div>
      )}
    </div>
  );
}
