import { Minus, Plus, LucideIcon } from 'lucide-react';

interface NumberInputProps {
    label: string;
    icon: LucideIcon;
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
        <div className="rounded-2xl p-6 bg-white/10 backdrop-blur">
            <label className="flex items-center justify-center gap-1 text-(--color-primary) text-2xl font-semibold mb-3">
                <Icon strokeWidth={3} size={24} />
                {label}
            </label>
            <div className="number-input-wrapper">
                <button
                    type="button"
                    onClick={onDecrement}
                    disabled={value <= min || disabled}
                    className="number-input-btn"
                >
                    <Minus size={20} />
                </button>
                <input
                    name={name}
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-(--color-secondary) rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary) focus:outline-none"
                />
                <button
                    type="button"
                    onClick={onIncrement}
                    disabled={value >= max || disabled}
                    className="number-input-btn"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
}
