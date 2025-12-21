import { Minus, Plus, LucideIcon } from 'lucide-react';

interface NumberInputHorizontalProps {
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

export default function NumberInputHorizontal({
    label,
    icon: Icon,
    name,
    value,
    min,
    max,
    readOnly,
    step = 1,
    onChange,
    onIncrement,
    onDecrement,
    disabled = false
}: NumberInputHorizontalProps) {
    return (
        <div className="flex gap-2 rounded-2xl py-6 px-4 bg-white/10 backdrop-blur">
            <label className="flex flex-1/3 items-center justify-center   text-(--color-primary) text-xl font-semibold">
                {label}
            </label>

            <div className="flex flex-2/3 number-input-wrapper">
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
