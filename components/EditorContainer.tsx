"use client";
import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Play } from "lucide-react";

export default function EditorContainer({ onRun }: { onRun: (code: string) => void }) {
  const [code, setCode] = useState("# Write your algorithm here\n\nclass Solution:\n    def solve(self, head):\n        curr = head\n        while curr:\n            print(curr.val)\n            curr = curr.next");

  return (
    <div className="flex flex-col h-full border-r border-slate-700 bg-[#1e1e1e]">
      <div className="flex justify-between items-center p-2 bg-slate-800">
        <span className="text-sm font-mono text-slate-300">solution.py</span>
        <button 
          onClick={() => onRun(code)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-1 rounded text-sm font-bold"
        >
          <Play size={14} /> Run & Visualize
        </button>
      </div>
      <Editor
        height="90vh"
        theme="vs-dark"
        defaultLanguage="python"
        value={code}
        onChange={(val) => setCode(val || "")}
        options={{ fontSize: 14, minimap: { enabled: false } }}
      />
    </div>
  );
}