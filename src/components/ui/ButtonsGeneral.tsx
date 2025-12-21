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
                    className="flex-1 bg-gray-600 text-white font-bold py-4 px-8 rounded-xl text-xl hover:bg-gray-700 transition-all shadow-lg"
                >
                    <ArrowLeft strokeWidth={4}   className="inline mr-2 mb-1" size={24} />
                    Volver
                </button>
        );
    }
    else if (type === 'continue') {
        return (
            <button
                    onClick={onContinue}
                    className="flex-1 bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
                >
                    <Play strokeWidth={4} className="inline mr-2 mb-1" size={24} />
                    Continuar
                </button>
        );
    }
}
