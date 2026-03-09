"use client";
import { useState } from 'react';
import { ExecutionTrace, getFrameAtStep, getChangedVariables, getMemoryState } from '@/lib/cpp/parser';
import { VariablesPanel } from './VariablesPanel';
import { CallStackPanel } from './CallStackPanel';
import { ArrayVisualization } from './ArrayVisualization';
import { StepPlayer } from './StepPlayer';

interface ExecutionVisualizerProps {
    trace: ExecutionTrace;
}

export function ExecutionVisualizer({ trace }: ExecutionVisualizerProps) {
    const [currentStep, setCurrentStep] = useState(0);

    if (trace.error) {
        return (
            <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded border border-red-500/30">
                {trace.error}
            </div>
        );
    }

    const currentFrame = getFrameAtStep(trace, currentStep);
    const previousFrame = currentStep > 0 ? getFrameAtStep(trace, currentStep - 1) : undefined;
    const changedVars: Set<string> = currentFrame && previousFrame 
        ? new Set(getChangedVariables(currentFrame, previousFrame).map((v) => v.name))
        : new Set<string>();

    const memoryState = currentFrame ? getMemoryState(trace, currentFrame.step_id) : null;

    return (
        <div className="h-full flex flex-col gap-4 overflow-auto">
            {/* Step Player Controls */}
            <StepPlayer trace={trace} currentStep={currentStep} onStepChange={setCurrentStep} />

            {/* Current Frame Info */}
            {currentFrame && (
                <div className="text-xs space-y-1 text-slate-400 bg-slate-900/30 p-2 rounded border border-slate-700">
                    <div>Line: <span className="text-blue-400 font-mono">{currentFrame.line}</span></div>
                    <div>Function: <span className="text-blue-400 font-mono">{currentFrame.function}</span></div>
                    <div>Event: <span className="text-purple-400 font-mono">{currentFrame.eventType}</span></div>
                </div>
            )}

            {/* Main Visualization Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Left: Variables and Call Stack */}
                <div className="space-y-4">
                    {memoryState && (
                        <div className="bg-slate-900/20 p-3 rounded border border-slate-700">
                            <VariablesPanel
                                variables={memoryState.localVariables}
                                changedVariables={changedVars}
                            />
                        </div>
                    )}

                    {currentFrame && (
                        <div className="bg-slate-900/20 p-3 rounded border border-slate-700">
                            <CallStackPanel
                                callStack={currentFrame.callStack}
                                currentFunction={currentFrame.function}
                            />
                        </div>
                    )}
                </div>

                {/* Right: Array Visualizations */}
                <div className="space-y-4">
                    {memoryState && memoryState.arrays.length > 0 ? (
                        <div className="bg-slate-900/20 p-3 rounded border border-slate-700 space-y-3">
                            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                                Array States
                            </div>
                            {memoryState.arrays.map(({ name, values }) => (
                                <ArrayVisualization
                                    key={name}
                                    name={name}
                                    values={values}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-500 text-xs italic p-3 bg-slate-900/20 rounded border border-slate-700">
                            No arrays in scope
                        </div>
                    )}
                </div>
            </div>

            {/* Console Output */}
            {currentFrame && (
                <div className="text-xs text-slate-500 p-2 bg-black/50 rounded border border-slate-700 font-mono">
                    Step {currentFrame.step_id}: {currentFrame.eventType} at line {currentFrame.line}
                </div>
            )}
        </div>
    );
}
