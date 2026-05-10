import { Play, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function Navbar({ onRun, isLoading, problemTitle }: { onRun?: () => void; isLoading?: boolean; problemTitle?: string }) {
  return (
    <nav className="h-14 border-b border-white/10 flex items-center px-6 justify-between bg-[#111111]">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">V</div>
          <h1 className="font-semibold text-lg tracking-tight text-white hidden sm:block">AlgoLens</h1>
        </Link>
        {problemTitle && (
          <>
            <div className="w-px h-6 bg-white/20 mx-2"></div>
            <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft size={14} /> Back to Problems
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {onRun && (
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
        )}
        <button className="p-2 hover:bg-white/5 rounded-md text-slate-400"><Share2 size={18} /></button>
      </div>
    </nav>
  );
}
