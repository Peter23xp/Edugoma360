import { Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GradeInputProps {
    studentId: string;
    currentValue: number | null;
    maxScore: number; // 10 or 20
    onChange: (value: number | null) => void;
    isLocked: boolean;
    passingThreshold?: number; // Default: 10 for /20, 5 for /10
}

export default function GradeInput({
    studentId,
    currentValue,
    maxScore,
    onChange,
    isLocked,
    passingThreshold,
}: GradeInputProps) {
    const [value, setValue] = useState<string>(
        currentValue !== null ? currentValue.toString() : ''
    );

    const threshold = passingThreshold || (maxScore === 20 ? 10 : 5);

    useEffect(() => {
        setValue(currentValue !== null ? currentValue.toString() : '');
    }, [currentValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        if (newValue === '') {
            onChange(null);
            return;
        }

        const numValue = parseFloat(newValue);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= maxScore) {
            onChange(numValue);
        }
    };

    const handleBlur = () => {
        // Format to 2 decimals on blur if value exists
        if (value !== '' && !isNaN(parseFloat(value))) {
            const numValue = parseFloat(value);
            setValue(numValue.toFixed(2));
        }
    };

    // Determine border color
    let borderColor = 'border-neutral-300';
    if (value !== '' && !isNaN(parseFloat(value))) {
        const numValue = parseFloat(value);
        if (numValue < threshold) {
            borderColor = 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
        } else {
            borderColor = 'border-green-500 focus:border-green-500 focus:ring-green-500/20';
        }
    }

    return (
        <div className="relative">
            <input
                type="number"
                min="0"
                max={maxScore}
                step="0.25"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLocked}
                className={`w-20 px-2 py-1.5 text-sm border rounded 
                           focus:ring-2 focus:outline-none transition-colors
                           disabled:bg-neutral-100 disabled:cursor-not-allowed
                           ${borderColor}`}
                placeholder="--"
            />
            {isLocked && (
                <Lock
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400"
                />
            )}
        </div>
    );
}

