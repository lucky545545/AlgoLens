"use client";
import { motion } from 'framer-motion';

interface ArrayVisualizationProps {
    name: string;
    values: number[];
    highlightIndices?: number[];
}

export function ArrayVisualization({ name, values, highlightIndices = [] }: ArrayVisualizationProps) {
    return (
        <div className="space-y-2">
            <div className="text-xs text-slate-400 font-mono">{name}</div>
            <div className="flex gap-1 flex-wrap">
                {values.map((value, index) => (
                    <motion.div
                        key={`${name}-${index}`}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`
                            w-10 h-10 flex items-center justify-center rounded text-xs font-mono font-bold
                            ${
                                highlightIndices.includes(index)
                                    ? 'bg-yellow-500/30 border-2 border-yellow-400 text-yellow-300 shadow-lg shadow-yellow-400/50'
                                    : 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                            }
                        `}
                    >
                        {value}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
