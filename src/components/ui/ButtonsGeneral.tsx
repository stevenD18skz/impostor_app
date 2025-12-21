import { ArrowLeft, Play } from 'lucide-react';

export default function ButtonsGeneral({
    type,
    onBack,
    onContinue
}: {
    type: 'back' | 'continue';
    onBack: () => void;
    onContinue: () => void;
}) {
    if (type === 'back') {
        return (
            <button
                onClick={onBack}
                className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl cursor-pointer text-xl bg-slate-600 text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
            >
                <ArrowLeft strokeWidth={4} className="inline" size={24} />
                Volver
            </button>
        );
    }
    else if (type === 'continue') {
        return (
            <button
                onClick={onContinue}
                className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl cursor-pointer text-xl bg-pink-600 text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300"
            >
                <Play strokeWidth={4} className="inline" size={24} />
                Continuar
            </button>
        );
    }
}
