"use client";
import { motion } from 'framer-motion';
import { VisualStep } from '@/lib/cpp/parser';

export function StepGrid({ steps }: { steps: VisualStep[] }) {
    return (
        <div className="flex flex-wrap gap-3 p-4 justify-center">
            {steps.map((step) => (
                <motion.div
                    key={step.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: step.id * 0.1 }}
                    className="w-16 h-16 bg-blue-600/20 border border-blue-500 rounded-lg flex flex-col items-center justify-center"
                >
                    <span className="text-[10px] text-blue-300 uppercase font-bold">Step</span>
                    <span className="text-xl font-mono text-white">{step.value}</span>
                </motion.div>
            ))}
        </div>
    );
}