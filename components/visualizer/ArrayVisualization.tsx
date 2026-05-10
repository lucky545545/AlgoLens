"use client";
import { motion } from 'framer-motion';

interface ArrayVisualizationProps {
    name: string;
    values: number[];
    highlightIndices?: number[];
}

export function ArrayVisualization({ name, values, highlightIndices = [] }: ArrayVisualizationProps) {
    const maxVal = Math.max(...values, 1); // Avoid division by zero
    
    return (
        <div className="flex flex-col gap-4 bg-[#1e1e1e] p-4 rounded-md w-full">
            {/* Chart Section */}
            <div className="flex flex-col">
                <div className="text-xs text-slate-300 bg-slate-700/50 inline-block px-2 py-1 rounded-sm mb-2 font-mono w-max">
                    {name} (ChartTracer)
                </div>
                <div className="flex items-end gap-1 h-32 border-b border-slate-600 pb-1">
                    {values.map((val, idx) => {
                        const heightPercent = (val / maxVal) * 100;
                        const isHighlighted = highlightIndices.includes(idx);
                        return (
                            <div key={`chart-${idx}`} className="flex flex-col items-center flex-1 group">
                                <motion.div 
                                    className={`w-full ${isHighlighted ? 'bg-yellow-400' : 'bg-[#c0c0c0]'}`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercent}%` }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                />
                                <div className="text-[10px] text-slate-400 mt-1 font-mono">{val}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 1D Array Section */}
            <div className="flex flex-col mt-4">
                <div className="text-xs text-slate-300 bg-slate-700/50 inline-block px-2 py-1 rounded-sm mb-4 font-mono w-max">
                    {name} (Array1DTracer)
                </div>
                <div className="flex flex-wrap gap-0 justify-center">
                    {values.map((val, idx) => {
                        const isHighlighted = highlightIndices.includes(idx);
                        return (
                            <div key={`arr-${idx}`} className="flex flex-col items-center">
                                <div className="text-[10px] text-slate-500 mb-1 font-mono">{idx}</div>
                                <motion.div
                                    layout
                                    className={`
                                        w-8 h-8 flex items-center justify-center text-xs font-mono
                                        border-t border-b border-r first:border-l border-slate-600
                                        ${isHighlighted ? 'bg-yellow-500/20 text-yellow-300 font-bold' : 'bg-transparent text-slate-300'}
                                    `}
                                >
                                    {val}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
