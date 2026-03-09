"use client";
import { motion } from 'framer-motion';
import { Variable, formatValue } from '@/lib/cpp/parser';

interface VariablesPanelProps {
    variables: Variable[];
    changedVariables?: Set<string>;
}

export function VariablesPanel({ variables, changedVariables }: VariablesPanelProps) {
    return (
        <div className="space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">
                Local Variables
            </div>
            
            {variables.length === 0 ? (
                <div className="text-slate-500 text-xs italic">No variables</div>
            ) : (
                variables.map((variable) => (
                    <motion.div
                        key={variable.name}
                        layout
                        initial={changedVariables?.has(variable.name) ? { scale: 1.05 } : {}}
                        animate={{ scale: 1 }}
                        className={`p-2 rounded bg-slate-800/50 border border-slate-700 ${
                            changedVariables?.has(variable.name)
                                ? 'border-yellow-500 bg-yellow-500/10'
                                : ''
                        }`}
                    >
                        <div className="flex justify-between items-start gap-2">
                            <span className="text-blue-400 font-mono text-sm">{variable.name}</span>
                            <motion.span
                                key={`${variable.name}-${variable.value}`}
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: 1 }}
                                className="text-green-400 font-mono text-sm font-bold"
                            >
                                {formatValue(variable.value)}
                            </motion.span>
                        </div>
                        {variable.type === 'array' && (
                            <div className="text-xs text-slate-500 mt-1">Array</div>
                        )}
                    </motion.div>
                ))
            )}
        </div>
    );
}
