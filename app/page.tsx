"use client";

import Link from "next/link";
import { questions } from "@/lib/questions";
import { Navbar } from "@/components/ui/Navbar";
import { motion } from "framer-motion";
import { Code2, ChevronRight, BarChart2, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
              Visualize Algorithms <br/> in Real-time
            </h1>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              Master data structures and algorithms by seeing exactly how they execute line by line. 
              Write C++ code, hit run, and watch your logic come to life.
            </p>
          </motion.div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            {[
              { icon: <Code2 className="text-blue-400" size={24}/>, title: "Write C++ Code", desc: "Full-featured editor with syntax highlighting" },
              { icon: <BarChart2 className="text-purple-400" size={24}/>, title: "Visual Execution", desc: "Watch arrays, pointers, and variables update" },
              { icon: <Zap className="text-amber-400" size={24}/>, title: "Instant Feedback", desc: "No compiling required, runs in your browser" }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Available Problems</h2>
          <div className="text-sm text-slate-400">{questions.length} problems</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link href={`/problem/${q.id}`} className="block h-full">
                <div className="h-full bg-[#111111] border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded">
                      {q.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors relative z-10">
                    {q.title}
                  </h3>
                  
                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 relative z-10">
                    {q.description}
                  </p>
                  
                  <div className="flex items-center text-blue-400 text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform relative z-10">
                    Solve Problem <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
