import { UserRound, UsersRound } from "lucide-react";
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
        <div className="space-y-6">
            <header className="text-(--color-primary)">
                <h2 className="flex items-center justify-center gap-2 text-4xl font-bold">
                    <UsersRound size={42} strokeWidth={3}/>
                     Nombres de Jugadores
                </h2>
                <p className="text-lg text-(--color-detail)">Ingresa el nombre de cada jugador</p>
            </header>

            <main className="space-y-4 max-h-100 overflow-y-auto custom-scrollbar">
                {Array(gameData.config.numPlayers).fill(0).map((_, idx) => (
                    <div key={idx} className="bg-white/10 rounded-xl p-4 backdrop-blur">
                        <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
                            <UserRound size={24} strokeWidth={3}/>
                            Jugador {idx + 1}
                        </label>
                        <input
                            name={`playerName-${idx}`}
                            id={`playerName-${idx}`}
                            type="text"
                            placeholder={`Jugador ${idx + 1}`}
                            value={gameData.game.playerNames[idx] || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-xl bg-white/20 text-(--color-secondary) rounded-lg focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary) focus:outline-none"
                        />
                    </div>
                ))}
            </main>

            <footer className="flex gap-4">
                <ButtonsGeneral type="back" onBack={onBack} onContinue={onStartGame} />
                <ButtonsGeneral type="continue" onBack={onBack} onContinue={onStartGame} />     
            </footer>
        </div>
    );
}
