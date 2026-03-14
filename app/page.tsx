"use client";
import { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { CodeEditor } from '@/components/editor/CodeEditor';

import { runCppInBrowser, RunResult } from '@/lib/cpp/client-runner';
import { parseExecutionTrace, ExecutionTrace } from '@/lib/cpp/parser';
import { ExecutionVisualizer } from '@/components/visualizer/ExecutionVisualizer';

export default function HomePage() {
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
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(null);
  const [autoTrace, setAutoTrace] = useState(true);

  const handleRun = async () => {
    setIsLoading(true);
    setExecutionTrace(null);
    setOutput("Converting and tracing your code...");

    try {
      // Send to automatic tracer API
      const response = await fetch('/api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!data.success) {
        setOutput(`❌ ERROR: ${data.message}\n${data.stderr || ''}`);
      } else if (data.trace && Array.isArray(data.trace)) {
        setOutput(`✅ Successfully traced! Generated ${data.trace.length} trace events\n\n${data.stdout?.slice(0, 500) || ''}`);
        
        // Convert raw trace events to ExecutionFrame objects
        const frames: any[] = data.trace.map((event: any, idx: number) => ({
          step_id: event.step_id || idx,
          line: event.line || 0,
          function: event.function || 'main',
          callStack: event.call_stack || ['main'],
          variables: new Map([[event.var || '', event.value || 0]]),
          arrayStates: new Map(),
          mapStates: new Map(),
          eventType: event.type || 'step'
        }));
        
        // Create ExecutionTrace with frames property
        const trace: ExecutionTrace = {
          frames,
          totalSteps: frames.length
        };
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
