import { Play, Share2, Settings } from 'lucide-react';

export function Navbar({ onRun, isLoading }: { onRun: () => void; isLoading?: boolean }) {
  return (
    <nav className="h-14 border-b border-white/10 flex items-center px-6 justify-between bg-[#111111]">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">V</div>
        <h1 className="font-semibold text-lg tracking-tight">AlgoLens</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRun}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isLoading
              ? "bg-blue-600/50 text-white/50 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">Running...</span>
          ) : (
            <>
              <Play size={16} fill="currentColor" /> Run & Visualize
            </>
          )}
        </button>
        <button className="p-2 hover:bg-white/5 rounded-md text-slate-400"><Share2 size={18} /></button>
      </div>
    </nav>
  );
}