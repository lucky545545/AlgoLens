"use client";
import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Play } from "lucide-react";

export default function EditorContainer({ onRun }: { onRun: (code: string) => void }) {
  const [code, setCode] = useState(`int maxArea(vector<int>& height) {
    int area_max = 0;
    int i = 0;
    int j = height.size() - 1;

    while (i < j) {
        int current_height = min(height[i], height[j]);
        int current_width = j - i;
        int current_area = current_height * current_width;
        
        if (current_area > area_max) {
            int updated_max = current_area;
            area_max = updated_max;
        }
        
        if (height[i] < height[j]) {
            i++;
        } else {
            j--;
        }
    }

    return area_max;
}`);

  return (
    <div className="flex flex-col h-full border-r border-slate-700 bg-[#1e1e1e]">
      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
        <div>
          <span className="text-sm font-mono text-slate-300 block">solution.cpp</span>
          <span className="text-[10px] text-slate-500 opacity-75">Auto-traces your code • No macros needed</span>
        </div>
        <button 
          onClick={() => onRun(code)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold transition-colors"
        >
          <Play size={16} /> Auto-Trace & Visualize
        </button>
      </div>
      <Editor
        height="90vh"
        theme="vs-dark"
        defaultLanguage="cpp"
        value={code}
        onChange={(val) => setCode(val || "")}
        options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }}
      />
    </div>
  );
}