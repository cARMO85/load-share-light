import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description: string }[];
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ 
  currentStep, 
  totalSteps, 
  steps 
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={stepNumber} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted && "bg-primary border-primary shadow-[0_0_20px_hsl(var(--primary-glow))]",
                  isCurrent && "border-primary bg-primary/10 ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 bg-muted"
                )}>
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <span className={cn(
                      "text-sm font-semibold",
                      isCurrent && "text-primary",
                      !isCurrent && "text-muted-foreground"
                    )}>
                      {stepNumber}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-center max-w-32">
                  <div className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-foreground",
                    !isCurrent && "text-muted-foreground"
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {stepNumber < totalSteps && (
                <div className={cn(
                  "h-0.5 flex-1 mx-4 transition-all duration-300",
                  stepNumber < currentStep && "bg-primary",
                  stepNumber >= currentStep && "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};