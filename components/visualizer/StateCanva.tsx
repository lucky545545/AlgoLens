"use client";
import { motion } from 'framer-motion';

export function StateCanvas({ snapshots }: { snapshots: any[] }) {
  // snapshots = [{ var: "x", val: 10 }, { var: "i", val: 0 }]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-8">
      {snapshots.map((data, index) => (
        <motion.div 
          key={data.var}
          layout
          className="bg-slate-800 border border-blue-500/30 p-4 rounded-xl shadow-lg"
        >
          <div className="text-[10px] text-blue-400 font-mono uppercase tracking-widest mb-2">
            Variable: {data.var}
          </div>
          <motion.div 
            key={data.val} // Triggers animation on value change
            initial={{ scale: 1.2, color: "#3b82f6" }}
            animate={{ scale: 1, color: "#ffffff" }}
            className="text-3xl font-bold"
          >
            {data.val}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}