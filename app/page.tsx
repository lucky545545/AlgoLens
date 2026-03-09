"use client";
import { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { CodeEditor } from '@/components/editor/CodeEditor';

import { runCppInBrowser, RunResult } from '@/lib/cpp/client-runner';
import { parseExecutionTrace, ExecutionTrace } from '@/lib/cpp/parser';
import { ExecutionVisualizer } from '@/components/visualizer/ExecutionVisualizer';

export default function HomePage() {
  const [code, setCode] = useState(`#include<iostream>
#include "tracer.hpp"
using namespace std;

int main(){
    TRACE_INT(red, 10);
    
    for(TRACE_INT(i, 0); i < 5; i++){
        TRACE_LINE();
        
        if(i % 2 == 0){
            red = 20;
        }
        else{
            red = 30;
        }
    }
    
    return 0;
}`);
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    setExecutionTrace(null);
    setOutput("Running code in browser...");

    try {
      const result: RunResult = await runCppInBrowser(code);

      if (result.stderr && result.exitCode !== 0) {
        setOutput(`❌ COMPILATION ERROR:\n${result.stderr}`);
      } else if (result.error) {
        setOutput(`❌ ERROR: ${result.error}`);
      } else if (result.stdout) {
        setOutput(result.stdout);
        
        // Parse the execution trace
        const trace = parseExecutionTrace(result.stdout);
        setExecutionTrace(trace);
      } else {
        setOutput("No output");
      }
    } catch (err) {
      setOutput(`❌ Execution failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          
          {/* Visualization Area */}
          {executionTrace ? (
            <div className="flex-1 bg-slate-900/30 rounded-xl overflow-y-auto border border-white/5 p-4">
              <ExecutionVisualizer trace={executionTrace} />
            </div>
          ) : (
            /* Terminal Console - shown when no trace */
            <div className="flex-1 bg-black rounded-xl p-6 font-mono text-sm border border-white/5 overflow-auto shadow-2xl">
              <div className="text-slate-500 mb-4 border-b border-white/10 pb-2 flex justify-between items-center uppercase text-[10px] tracking-widest">
                <span>Terminal Output</span>
                {isLoading && <span className="animate-pulse text-blue-400">Processing...</span>}
              </div>

              <pre className={`whitespace-pre-wrap text-xs ${output.includes('ERROR') ? 'text-red-400' : 'text-green-500'}`}>
                {output || "Click 'Run' to see output..."}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
