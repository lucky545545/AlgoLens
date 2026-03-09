"use client";
import { motion } from 'framer-motion';

interface CallStackPanelProps {
    callStack: string[];
    currentFunction: string;
}

export function CallStackPanel({ callStack, currentFunction }: CallStackPanelProps) {
    return (
        <div className="space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">
                Call Stack
            </div>
            
            {callStack.length === 0 ? (
                <div className="text-slate-500 text-xs italic">No active calls</div>
            ) : (
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                    {callStack.map((func, index) => (
                        <motion.div
                            key={`${func}-${index}`}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-3 border-b border-slate-700 last:border-b-0 text-sm font-mono ${
                                func === currentFunction
                                    ? 'bg-blue-500/20 text-blue-400 border-l-2 border-l-blue-500'
                                    : 'text-slate-400'
                            }`}
                        >
                            <span className="text-slate-500">[{callStack.length - index - 1}] </span>
                            {func}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
