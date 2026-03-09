"use client";
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { ExecutionTrace } from '@/lib/cpp/parser';
import { useState, useEffect } from 'react';

interface StepPlayerProps {
    trace: ExecutionTrace;
    currentStep: number;
    onStepChange: (step: number) => void;
}

export function StepPlayer({ trace, currentStep, onStepChange }: StepPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(500); // ms per step

    useEffect(() => {
        if (!isPlaying) return;
        
        const timer = setTimeout(() => {
            if (currentStep < trace.totalSteps - 1) {
                onStepChange(currentStep + 1);
            } else {
                setIsPlaying(false); // Stop at end
            }
        }, speed);
        
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, trace.totalSteps, onStepChange, speed]);

    const handlePrevious = () => {
        if (currentStep > 0) {
            onStepChange(currentStep - 1);
        }
    };

    const handleNext = () => {
        if (currentStep < trace.totalSteps - 1) {
            onStepChange(currentStep + 1);
        }
    };

    const handleReset = () => {
        setIsPlaying(false);
        onStepChange(0);
    };

    return (
        <div className="space-y-3">
            {/* Controls */}
            <div className="flex gap-2 items-center bg-slate-800/50 p-3 rounded-lg">
                <button
                    onClick={handleReset}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                    title="Reset"
                >
                    <RotateCcw size={16} className="text-slate-400" />
                </button>

                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous step"
                >
                    <ChevronLeft size={16} className="text-slate-400" />
                </button>

                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors bg-blue-500/20 border border-blue-500/50"
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        <Pause size={16} className="text-blue-400" />
                    ) : (
                        <Play size={16} className="text-blue-400" />
                    )}
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentStep === trace.totalSteps - 1}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next step"
                >
                    <ChevronRight size={16} className="text-slate-400" />
                </button>

                {/* Speed control */}
                <div className="ml-auto flex items-center gap-2">
                    <label className="text-xs text-slate-400">Speed:</label>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={speed}
                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                        className="w-24"
                    />
                </div>
            </div>

            {/* Progress bar and step info */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">
                        Step {currentStep + 1} / {trace.totalSteps}
                    </span>
                    <span className="text-slate-500">
                        {Math.round((currentStep / trace.totalSteps) * 100)}%
                    </span>
                </div>

                {/* Progress bar */}
                <motion.div
                    className="w-full h-2 bg-slate-700 rounded-full overflow-hidden"
                >
                    <motion.div
                        layout
                        initial={false}
                        animate={{
                            width: `${(currentStep / trace.totalSteps) * 100}%`
                        }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                </motion.div>
            </div>
        </div>
    );
}
