import { Minus, Plus, LucideIcon } from 'lucide-react';

interface NumberInputProps {
    label: string;
    icon: LucideIcon;
    readOnly?: boolean;
    name: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onIncrement: () => void;
    onDecrement: () => void;
    disabled?: boolean;
}

export default function NumberInput({
    label,
    icon: Icon,
    readOnly = false,
    name,
    value,
    min,
    max,
    step = 1,
    onChange,
    onIncrement,
    onDecrement,
    disabled = false
}: NumberInputProps) {
    return (
        <div className="border-4 border-cyan-800 p-4 bg-slate-900 rounded-none relative">
            <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600"></div>

            <label className="flex items-center justify-center gap-2 text-cyan-400 text-lg font-bold uppercase tracking-widest mb-3 relative z-10">
                <Icon strokeWidth={3} size={20} className="text-pink-500" />
                {label}
            </label>
            <div className="number-input-wrapper relative z-10">
                <button
                    type="button"
                    onClick={onDecrement}
                    disabled={value <= min || disabled}
                    className="number-input-btn"
                >
                    <Minus size={20} strokeWidth={4} />
                </button>
                <input
                    name={name}
                    readOnly={readOnly}
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full px-4 py-3 text-3xl font-vt323 text-center bg-slate-800 text-white border-2 border-cyan-700 rounded-none focus:border-cyan-400 focus:outline-none focus:bg-slate-700 transition-colors"
                />
                <button
                    type="button"
                    onClick={onIncrement}
                    disabled={value >= max || disabled}
                    className="number-input-btn"
                >
                    <Plus size={20} strokeWidth={4} />
                </button>
            </div>
        </div>
    );
}
