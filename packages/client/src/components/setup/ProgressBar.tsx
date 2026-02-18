import { Check } from 'lucide-react';

interface Step {
    id: number;
    label: string;
}

interface ProgressBarProps {
    currentStep: number;
    steps: Step[];
}

export default function ProgressBar({ currentStep, steps }: ProgressBarProps) {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            {/* Progress line */}
            <div className="relative">
                {/* Background line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-neutral-200" />
                
                {/* Progress line */}
                <div
                    className="absolute top-5 left-0 h-1 bg-primary transition-all duration-500"
                    style={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                />
                
                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step) => {
                        const isPast = step.id < currentStep;
                        const isCurrent = step.id === currentStep;
                        const isFuture = step.id > currentStep;
                        
                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                {/* Circle */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center 
                                               text-sm font-semibold transition-all duration-300 ${
                                                   isPast
                                                       ? 'bg-primary text-white'
                                                       : isCurrent
                                                       ? 'bg-white border-4 border-primary text-primary'
                                                       : 'bg-white border-2 border-neutral-300 text-neutral-400'
                                               }`}
                                >
                                    {isPast ? <Check size={18} /> : step.id}
                                </div>
                                
                                {/* Label */}
                                <span
                                    className={`mt-2 text-xs font-medium text-center max-w-[80px] 
                                               transition-colors duration-300 ${
                                                   isPast || isCurrent
                                                       ? 'text-neutral-900'
                                                       : 'text-neutral-400'
                                               }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
