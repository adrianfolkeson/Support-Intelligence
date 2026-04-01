"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export function SuccessAnimation({
  show,
  message = "Success!",
  duration = 2000,
  onComplete,
  className,
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center pointer-events-none",
        className
      )}
    >
      <div className="scale-in flex flex-col items-center justify-center bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
        </div>
        <p className="text-xl font-semibold text-neutral-900">{message}</p>
      </div>
    </div>
  );
}

export function SuccessCheckmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-emerald-100 flex items-center justify-center",
        "fade-in"
      )}
    >
      <CheckCircle2
        className={cn(
          {
            "w-5 h-5": size === "sm",
            "w-7 h-7": size === "md",
            "w-10 h-10": size === "lg",
          },
          "text-emerald-600"
        )}
      />
    </div>
  );
}

export function ProgressSteps({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300",
                index < currentStep
                  ? "bg-emerald-600 text-white"
                  : index === currentStep
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-200 text-neutral-500"
              )}
            >
              {index < currentStep ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <p
              className={cn(
                "text-xs mt-2 text-center transition-all duration-300",
                index <= currentStep ? "text-neutral-900" : "text-neutral-400"
              )}
            >
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-2 transition-all duration-300",
                index < currentStep ? "bg-emerald-600" : "bg-neutral-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
