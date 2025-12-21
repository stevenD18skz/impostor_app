import { ArrowLeftIcon, ArrowRightIcon, UsersRound } from "lucide-react";
import ButtonsGeneral from "@/components/ui/ButtonsGeneral";
import "./styleLocal.css";

interface NamesStateProps {
    gameData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => void;
    onBack: () => void;
    onStartGame: () => void;
}

export default function NamesState({
    gameData,
    handleChange,
    onBack,
    onStartGame
}: NamesStateProps) {
    return (
        <div className="text-center space-y-8">
            <div className="text-white">
                <h2 className="text-4xl font-bold">
                    <UsersRound size={42} strokeWidth={3} className="inline mr-2 mb-1 text-amber-400" />
                     Nombres de Jugadores
                </h2>
                <p className="text-lg">Ingresa el nombre de cada jugador</p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {Array(gameData.config.numPlayers).fill(0).map((_, idx) => (
                    <div key={idx} className="bg-white/10 rounded-xl p-4 backdrop-blur">
                        <label className="block text-white text-lg font-semibold mb-2">
                            Jugador {idx + 1}
                        </label>
                        <input
                            name={`playerName-${idx}`}
                            id={`playerName-${idx}`}
                            type="text"
                            placeholder={`Jugador ${idx + 1}`}
                            value={gameData.game.playerNames[idx] || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-lg bg-white/20 text-white placeholder-purple-300 rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                        />
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <ButtonsGeneral type="back" onBack={onBack} onContinue={onStartGame} />
                <ButtonsGeneral type="continue" onBack={onBack} onContinue={onStartGame} />     
            </div>
        </div>
    );
}
