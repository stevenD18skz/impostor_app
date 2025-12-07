import { useState } from 'react';
import { Play, Users } from 'lucide-react';

interface GameSetupProps {
  onJoin: (roomCode: string, playerName: string, roomData: any) => void;
  onLocalPlay: () => void;
}

// 🎯 Tipo para las reglas de validación
type ValidationRule = {
  field: string;
  value: any;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
};

// 🔍 Función de validación genérica
const validate = (rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    // Validar campo requerido
    if (rule.required && (!rule.value || rule.value.trim() === '')) {
      return rule.message;
    }

    // Validar longitud mínima
    if (rule.minLength && rule.value.length < rule.minLength) {
      return `${rule.field} debe tener al menos ${rule.minLength} caracteres`;
    }

    // Validar longitud máxima
    if (rule.maxLength && rule.value.length > rule.maxLength) {
      return `${rule.field} no puede tener más de ${rule.maxLength} caracteres`;
    }

    // Validar patrón (regex)
    if (rule.pattern && !rule.pattern.test(rule.value)) {
      return rule.message;
    }
  }
  return null;
};

export default function GameSetup({ onJoin, onLocalPlay }: GameSetupProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const createRoom = async () => {
    // 📋 Definir reglas de validación para crear sala
    const validationError = validate([
      {
        field: 'Nombre',
        value: playerName,
        required: true,
        minLength: 2,
        maxLength: 20,
        message: 'Por favor ingresa tu nombre (mínimo 2 caracteres)'
      }
    ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsJoining(true);

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', playerName })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onJoin(data.roomCode, playerName, data.room);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const joinRoom = async () => {
    // 📋 Definir reglas de validación para unirse a sala
    const validationError = validate([
      {
        field: 'Nombre',
        value: playerName,
        required: true,
        minLength: 2,
        maxLength: 20,
        message: 'Por favor ingresa tu nombre (mínimo 2 caracteres)'
      },
      {
        field: 'Código de sala',
        value: roomCode,
        required: true,
        minLength: 6,
        maxLength: 6,
        pattern: /^[A-Z0-9]{6}$/,
        message: 'El código de sala debe tener 6 caracteres'
      }
    ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsJoining(true);

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', roomCode: roomCode.toUpperCase(), playerName })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onJoin(roomCode.toUpperCase(), playerName, data.room);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="text-center space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-white mb-2">🕵️ EL IMPOSTOR</h1>
        <p className="text-purple-200 text-lg">¿Quién no conoce la palabra secreta?</p>
      </div>

      <div className="bg-white/10 rounded-2xl p-8 backdrop-blur space-y-6">
        <div>
          <label className="block text-white text-lg font-semibold mb-3 text-left">
            👤 Tu Nombre
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ej: Juan"
            className="w-full px-4 py-3 text-lg bg-white/20 text-white placeholder-purple-300 rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-white mb-4 font-semibold">Crear Nueva Sala</p>
          <button
            onClick={createRoom}
            disabled={isJoining}
            className="w-full bg-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-600 transition-all shadow-lg disabled:opacity-50"
          >
            {isJoining ? 'Uniendote a la sala...' : '✨ Crear Sala'}
          </button>
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-white mb-4 font-semibold">O Unirse a una Sala</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              className="flex-1 px-4 py-3 text-lg bg-white/20 text-white placeholder-purple-300 rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none uppercase"
            />
            <button
              onClick={joinRoom}
              disabled={isJoining}
              className="bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50"
            >
              {isJoining ? 'Uniendo...' : 'Entrar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <p className="text-white mb-4 font-semibold">O Jugar Local</p>
          <button
            onClick={onLocalPlay}
            className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 transition-all shadow-lg"
          >
            📱 Jugar Local (Un solo dispositivo)
          </button>
        </div>
      </div>
    </div>
  );
}
