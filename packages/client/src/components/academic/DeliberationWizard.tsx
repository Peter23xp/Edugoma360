import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Step {
    number: number;
    label: string;
    status: 'completed' | 'active' | 'pending';
}

interface DeliberationWizardProps {
    currentStep: number;
    steps: Step[];
}

export default function DeliberationWizard({ currentStep, steps }: DeliberationWizardProps) {
    return (
        <div className="bg-white border-b border-neutral-200 px-6 py-4">
            <div className="max-w-4xl mx-auto">
                {/* Progress bar */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center 
                                                   justify-center font-semibold text-sm transition-colors
                                                   ${
                                                       step.status === 'completed'
                                                           ? 'bg-green-600 text-white'
                                                           : step.status === 'active'
                                                           ? 'bg-primary text-white'
                                                           : 'bg-neutral-200 text-neutral-600'
                                                   }`}
                                    >
                                        {step.status === 'completed' ? (
                                            <CheckCircle size={20} />
                                        ) : (
                                            step.number
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs mt-2 font-medium
                                                   ${
                                                       step.status === 'active'
                                                           ? 'text-primary'
                                                           : 'text-neutral-600'
                                                   }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 mx-2 rounded transition-colors
                                                   ${
                                                       step.status === 'completed'
                                                           ? 'bg-green-600'
                                                           : 'bg-neutral-200'
                                                   }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

