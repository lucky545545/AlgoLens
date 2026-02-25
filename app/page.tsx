"use client";
import { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { CodeEditor } from '@/components/editor/CodeEditor';

// 1. Ensure these imports point to the correct files we created
import { runCppInBrowser, RunResult } from '@/lib/cpp/client-runner';
import { parseStdoutToSteps, VisualStep } from '@/lib/cpp/parser';
import { StepGrid } from '@/components/visualizer/StepGrid';

export default function HomePage() {
  const [code, setCode] = useState('#include<iostream>\nusing namespace std;\n\nint main(){\n\n}');
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. MISSING STATE: You need this to store the parsed steps
  const [visualSteps, setVisualSteps] = useState<VisualStep[]>([]);

  const handleRun = async () => {
    setIsLoading(true);
    setVisualSteps([]); // Reset visualizer grid
    setOutput("Running code in browser...");

    try {
      const result: RunResult = await runCppInBrowser(code);

      if (result.stdout) {
        setOutput(result.stdout);

        // 3. PARSING: Convert the string "Step 0..." into an array of objects
        const steps = parseStdoutToSteps(result.stdout);
        setVisualSteps(steps);
      } else if (result.error) {
        setOutput(`❌ ERROR: ${result.error}`);
      } else if (result.stderr) {
        setOutput(`⚠️ RUNTIME ERROR:\n${result.stderr}`);
      }
    } catch (err) {
      setOutput("❌ Execution failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
      <Navbar onRun={handleRun} isLoading={isLoading} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Editor */}
        <div className="w-1/2 border-r border-white/10">
          <CodeEditor code={code} onChange={setCode} language="cpp" />
        </div>

        {/* Right Side: Output / Visualization Canvas */}
        <div className="w-1/2 bg-[#0d0d0d] p-6 flex flex-col gap-4">

          {/* Terminal Console */}
          <div className="flex-1 bg-black rounded-xl p-6 font-mono text-sm border border-white/5 overflow-auto shadow-2xl">
            <div className="text-slate-500 mb-4 border-b border-white/10 pb-2 flex justify-between items-center uppercase text-[10px] tracking-widest">
              <span>Terminal Output</span>
              {isLoading && <span className="animate-pulse text-blue-400">Processing...</span>}
            </div>

            <pre className={`whitespace-pre-wrap ${output.includes('ERROR') ? 'text-red-400' : 'text-green-500'}`}>
              {output || "Click 'Run' to see output..."}
            </pre>
          </div>

          {/* Visualization Canvas */}
          <div className="h-1/3 bg-slate-900/50 rounded-xl overflow-y-auto border border-white/5 p-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Visual State</div>
            {/* 4. RENDER: The StepGrid now receives the state */}
            <StepGrid steps={visualSteps} />
          </div>

        </div>
      </div>
    </div>
  );
}