import { ArrowLeft, Play } from 'lucide-react';

export default function ButtonsGeneral({
    type,
    onBack,
    onContinue,
    text
}: {
    type: 'back' | 'continue';
    onBack: () => void;
    onContinue: () => void;
    text?: string;
}) {
    if (type === 'back') {
        return (
            <button
                onClick={onBack}
                className="group relative flex flex-1 items-center justify-center gap-2 py-4 px-6 border-4 border-cyan-800 bg-slate-900 text-cyan-400 font-press-start text-xs sm:text-sm hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)] active:shadow-none transition-all duration-200 outline-none"
            >
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-800 group-hover:bg-cyan-400"></div>
                <ArrowLeft strokeWidth={3} className="inline" size={18} />
                {text || 'VOLVER'}
            </button>
        );
    }
    else if (type === 'continue') {
        return (
            <button
                onClick={onContinue}
                className="group relative flex flex-1 items-center justify-center gap-2 py-4 px-6 border-4 border-pink-700 bg-slate-900 text-pink-400 font-press-start text-xs sm:text-sm hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:shadow-none transition-all duration-200 outline-none"
            >
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-700 group-hover:bg-pink-400"></div>
                <Play strokeWidth={3} className="inline" size={18} />
                {text || 'SIGUIENTE'}
            </button>
        );
    }
}
