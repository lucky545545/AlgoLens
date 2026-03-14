"use client";
import { motion } from 'framer-motion';

interface MapVisualizationProps {
    name: string;
    entries: Record<string | number, number>;
    highlightKeys?: (string | number)[];
}

export function MapVisualization({ name, entries, highlightKeys = [] }: MapVisualizationProps) {
    const sortedEntries = Object.entries(entries).sort(([keyA], [keyB]) => {
        const numA = parseInt(keyA as string);
        const numB = parseInt(keyB as string);
        return (isNaN(numA) ? 0 : numA) - (isNaN(numB) ? 0 : numB);
    });

    return (
        <div className="space-y-2">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-widest">{name}</div>
            <div className="border border-blue-500/30 rounded overflow-hidden bg-slate-900/20">
                <div className="grid grid-cols-2 gap-0">
                    {/* Header */}
                    <div className="bg-slate-800/50 p-2 border-b border-r border-blue-500/20 text-xs font-mono font-bold text-blue-400">
                        Key
                    </div>
                    <div className="bg-slate-800/50 p-2 border-b border-blue-500/20 text-xs font-mono font-bold text-blue-400">
                        Value
                    </div>

                    {/* Entries */}
                    {sortedEntries.length === 0 ? (
                        <div className="col-span-2 p-3 text-xs text-slate-500 italic">Empty map</div>
                    ) : (
                        sortedEntries.map(([key, value], idx) => {
                            const isHighlighted = highlightKeys.includes(key) || highlightKeys.includes(parseInt(key));
                            return (
                                <motion.div
                                    key={`${name}-${key}-${idx}`}
                                    layout
                                    initial={isHighlighted ? { backgroundColor: 'rgba(234, 179, 8, 0.2)' } : {}}
                                    animate={{
                                        backgroundColor: isHighlighted
                                            ? 'rgba(234, 179, 8, 0.2)'
                                            : 'transparent'
                                    }}
                                    className={`col-span-2 grid grid-cols-2 gap-0 ${
                                        idx < sortedEntries.length - 1
                                            ? 'border-b border-slate-700'
                                            : ''
                                    }`}
                                >
                                    {/* Key */}
                                    <motion.div
                                        initial={{ opacity: 0.7 }}
                                        animate={{ opacity: 1 }}
                                        className={`p-2 border-r border-slate-700 text-xs font-mono ${
                                            isHighlighted
                                                ? 'bg-yellow-500/20 text-yellow-300 font-bold'
                                                : 'bg-slate-800/30 text-slate-400'
                                        }`}
                                    >
                                        {key}
                                    </motion.div>

                                    {/* Value */}
                                    <motion.div
                                        key={`value-${value}`}
                                        initial={{ scale: isHighlighted ? 1.1 : 1 }}
                                        animate={{ scale: 1 }}
                                        className={`p-2 text-xs font-mono font-bold ${
                                            isHighlighted
                                                ? 'bg-yellow-500/20 text-yellow-300'
                                                : 'text-green-400'
                                        }`}
                                    >
                                        {value}
                                    </motion.div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
            <div className="text-xs text-slate-500">Size: {sortedEntries.length}</div>
        </div>
    );
}
