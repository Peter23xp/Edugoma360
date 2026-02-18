import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  length?: number;
}

export default function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus premier input au montage
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, inputValue: string) => {
    // Ne garder que les chiffres
    const digit = inputValue.replace(/\D/g, '').slice(-1);
    
    const newValue = [...value];
    newValue[index] = digit;
    onChange(newValue);

    // Focus automatique sur le suivant si rempli
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Si vide, revenir sur le précédent
        inputRefs.current[index - 1]?.focus();
      } else {
        // Effacer la valeur actuelle
        const newValue = [...value];
        newValue[index] = '';
        onChange(newValue);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData.length === length) {
      const newValue = pastedData.split('');
      onChange(newValue);
      // Focus sur le dernier input
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`h-12 w-10 text-center text-xl font-bold border-2 rounded-lg transition-all
            ${value[index] 
              ? 'border-[#1B5E20] bg-green-50' 
              : 'border-gray-300'
            }
            focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/30
          `}
        />
      ))}
    </div>
  );
}
