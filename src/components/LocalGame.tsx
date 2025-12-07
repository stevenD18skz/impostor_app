import { useState, useEffect } from 'react';
import { Eye, Play, RotateCcw, Users } from 'lucide-react';
import { categorias } from '@/app/lib/data';

interface Player {
  isImpostor: boolean;
  name: string;
}

interface LocalGameProps {
  onBack: () => void;
}

export default function LocalGame({ onBack }: LocalGameProps) {
  const [gameState, setGameState] = useState('setup'); // setup, names, reveal, playing, ended
  const [numPlayers, setNumPlayers] = useState(4);
  const [numImpostors, setNumImpostors] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [secretWord, setSecretWord] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('comida');
  const [timeLimit, setTimeLimit] = useState(180);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [playingOrder, setPlayingOrder] = useState<Player[]>([]);

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setGameState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const goToNames = () => {
    if (playerNames.length !== numPlayers) {
      setPlayerNames(Array(numPlayers).fill(''));
    }
    setGameState('names');
  };

  const startGame = () => {
    // @ts-ignore
    const palabras:string[] = categorias[selectedCategory].palabras;
    const word = palabras[Math.floor(Math.random() * palabras.length)];
    setSecretWord(word);
    
    const playerRoles = Array(numPlayers).fill(false);
    const impostorIndices: number[] = [];
    
    while (impostorIndices.length < numImpostors) {
      const idx = Math.floor(Math.random() * numPlayers);
      if (!impostorIndices.includes(idx)) {
        impostorIndices.push(idx);
        playerRoles[idx] = true;
      }
    }
    
    setPlayers(playerRoles.map((isImpostor, idx) => ({ 
      isImpostor, 
      name: playerNames[idx] || `Jugador ${idx + 1}` 
    })));
    setGameState('reveal');
    setCurrentPlayer(0);
    setShowRole(false);
    setTimeLeft(timeLimit);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const nextPlayer = () => {
    if (currentPlayer < numPlayers - 1) {
      setCurrentPlayer(currentPlayer + 1);
      setShowRole(false);
    } else {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      setPlayingOrder(shuffled);
      setGameState('playing');
      setIsTimerRunning(true);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentPlayer(0);
    setShowRole(false);
    setPlayers([]);
    setSecretWord('');
    setTimeLeft(timeLimit);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-8 w-full max-w-2xl">
        {gameState === 'setup' && (
          <div className="text-center space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">🕵️ EL IMPOSTOR</h1>
              <p className="text-purple-200 text-lg">Modo Local</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                <label className="block text-white text-lg font-semibold mb-3">
                  🎯 Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 text-lg bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                >
                  {Object.keys(categorias).map(key => (
                    <option key={key} value={key} className="bg-gray-800">
                      {/* @ts-ignore */}
                      {categorias[key].nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                <label className="block text-white text-lg font-semibold mb-3">
                  <Users className="inline mr-2 mb-1" size={24} />
                  Número de Jugadores
                </label>
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={numPlayers}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNumPlayers(val);
                    if (numImpostors >= val) setNumImpostors(Math.max(1, val - 1));
                  }}
                  className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                <label className="block text-white text-lg font-semibold mb-3">
                  👤 Número de Impostores
                </label>
                <input
                  type="number"
                  min="1"
                  max={numPlayers - 1}
                  value={numImpostors}
                  onChange={(e) => setNumImpostors(parseInt(e.target.value))}
                  className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                <label className="block text-white text-lg font-semibold mb-3">
                  ⏱️ Tiempo del Juego (segundos)
                </label>
                <input
                  type="number"
                  min="60"
                  max="600"
                  step="30"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
                <button
                onClick={onBack}
                className="flex-1 bg-gray-600 text-white font-bold py-4 px-8 rounded-xl text-xl hover:bg-gray-700 transition-all shadow-lg"
                >
                ← Volver
                </button>
                <button
                onClick={goToNames}
                className="flex-1 bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
                >
                <Play className="inline mr-2 mb-1" size={24} />
                Continuar
                </button>
            </div>
          </div>
        )}

        {gameState === 'names' && (
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">👥 Nombres de Jugadores</h2>
              <p className="text-purple-200">Ingresa el nombre de cada jugador</p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Array(numPlayers).fill(0).map((_, idx) => (
                <div key={idx} className="bg-white/10 rounded-xl p-4 backdrop-blur">
                  <label className="block text-white text-sm font-semibold mb-2">
                    Jugador {idx + 1}
                  </label>
                  <input
                    type="text"
                    placeholder={`Jugador ${idx + 1}`}
                    value={playerNames[idx] || ''}
                    onChange={(e) => updatePlayerName(idx, e.target.value)}
                    className="w-full px-4 py-3 text-lg bg-white/20 text-white placeholder-purple-300 rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setGameState('setup')}
                className="flex-1 bg-gray-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 transition-all"
              >
                ← Atrás
              </button>
              <button
                onClick={startGame}
                className="flex-1 bg-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Iniciar Juego →
              </button>
            </div>
          </div>
        )}

        {gameState === 'reveal' && (
          <div className="text-center space-y-8">
            <div className="bg-pink-500/30 rounded-2xl p-6 border-2 border-purple-400">
              <h2 className="text-3xl font-bold text-white">
                🃏 Carta de {players[currentPlayer].name}
              </h2>
            </div>
            
            {!showRole ? (
              <div className="space-y-6">
                <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-8">
                  <p className="text-white text-lg mb-4">
                    ⚠️ {players[currentPlayer].name}, asegúrate de que solo tú puedas ver la pantalla
                  </p>
                  <p className="text-yellow-200 text-sm">
                    Los demás jugadores deben mirar hacia otro lado
                  </p>
                </div>

                <button
                  onClick={() => setShowRole(true)}
                  className="bg-linear-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  <Eye className="inline mr-2 mb-1" size={24} />
                  Ver Mi Rol
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`rounded-2xl p-8 border-4 ${players[currentPlayer].isImpostor ? 'bg-linear-gradient-to-br from-red-900/40 to-red-600/40 border-red-400' : 'bg-linear-gradient-to-br from-green-900/40 to-green-600/40 border-green-400'}`}>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
                    <h3 className="text-3xl font-bold text-white">
                      🃏 {players[currentPlayer].name}
                    </h3>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {players[currentPlayer].isImpostor ? '🎭 ERES EL IMPOSTOR' : '✅ ERES INOCENTE'}
                  </h3>
                  
                  {!players[currentPlayer].isImpostor && (
                    <div className="bg-white/20 rounded-xl p-6 mt-4">
                      <p className="text-white text-sm mb-2">Tu palabra secreta es:</p>
                      <p className="text-white text-4xl font-bold">{secretWord}</p>
                    </div>
                  )}

                  {players[currentPlayer].isImpostor && (
                    <div className="bg-white/20 rounded-xl p-6 mt-4">
                      <p className="text-white text-lg">
                        No conoces la palabra secreta. Intenta descubrirla escuchando a los demás sin que te descubran.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={nextPlayer}
                  className="w-full bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  {currentPlayer < numPlayers - 1 ? '➡️ Siguiente Jugador' : '🎮 Comenzar Juego'}
                </button>
              </div>
            )}
          </div>
        )}

        {gameState === 'playing' && (
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-white">🎮 ¡Juego en Curso!</h2>
            <h3 className="text-4xl font-bold text-white">🧪 La categoria es {selectedCategory} 🧪</h3>
            
            <div className="bg-indigo-500/30 border-2 border-blue-400 rounded-3xl p-12">
              <p className="text-white text-lg mb-4">Tiempo Restante</p>
              <p className={`text-7xl font-bold ${timeLeft <= 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
              <p className="text-white text-xl font-bold mb-4">📋 Orden de Turnos:</p>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {playingOrder.map((player, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/10 rounded-lg p-3 border border-white/20"
                  >
                    <span className="text-purple-300 font-semibold">{idx + 1}.</span>
                    <span className="text-white ml-2">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
              <p className="text-white text-lg">📋 Instrucciones:</p>
              <ul className="text-purple-200 text-left space-y-2">
                <li>• Los inocentes deben hablar sobre la palabra sin decirla directamente</li>
                <li>• El impostor debe intentar adivinar la palabra y actuar natural</li>
                <li>• Al final, voten por quién creen que es el impostor</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex-1 bg-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-yellow-600 transition-all"
              >
                {isTimerRunning ? '⏸️ Pausar' : '▶️ Reanudar'}
              </button>
              
              <button
                onClick={() => setGameState('ended')}
                className="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all"
              >
                🏁 Terminar
              </button>
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
            >
              <RotateCcw className="inline mr-2 mb-1" size={20} />
              Nueva Partida
            </button>
          </div>
        )}

        {gameState === 'ended' && (
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-white">🏁 ¡Juego Terminado!</h2>
            
            <div className="bg-white/10 rounded-2xl p-8 space-y-4">
              <p className="text-white text-2xl mb-4">La palabra secreta era:</p>
              <p className="text-yellow-300 text-5xl font-bold">{secretWord}</p>

              <p className="text-white text-2xl mt-8 mb-4">El impostor era:</p>
              <p className="text-red-400 text-5xl font-bold">{players.find(p => p.isImpostor)?.name}</p>
                
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-purple-200 text-lg">
                  ¿Adivinaron quién era el impostor? 🤔
                </p>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
            >
              <RotateCcw className="inline mr-2 mb-1" size={24} />
              Nueva Partida
            </button>
          </div>
        )}
    </div>
  );
}
