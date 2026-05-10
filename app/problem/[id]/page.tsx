"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { Navbar } from "@/components/ui/Navbar";
import { ExecutionVisualizer } from "@/components/visualizer/ExecutionVisualizer";
import { ExecutionTrace, parseTraceEvents } from "@/lib/cpp/parser";
import { TraceApiResponse } from "@/lib/trace-events";
import { getQuestionById } from "@/lib/questions";
import { Eye, Code2, Terminal } from "lucide-react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";

type ViewMode = 'solve' | 'visualize';

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const question = getQuestionById(id);

  const [code, setCode] = useState(question?.starterCode || "// Problem not found");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('solve');

  // If the user navigates directly without matching a question
  useEffect(() => {
    if (!question) {
      setCode("// 404: Problem not found\n// Please return to the home page.");
    }
  }, [question]);

  const handleRun = async () => {
    if (!question) return;
    
    setIsLoading(true);
    setExecutionTrace(null);
    setOutput("Converting and tracing your code...");

    try {
      const response = await fetch("/api/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = (await response.json()) as TraceApiResponse;

      if (!data.success) {
        setOutput(`ERROR: ${data.message}\n${data.stderr || ""}`);
        setViewMode('solve');
      } else if (data.trace) {
        setOutput(
          `Successfully traced. Generated ${data.trace.length} trace events\n\n${data.stdout?.slice(0, 500) || ""}`,
        );
        setExecutionTrace(parseTraceEvents(data.trace));
        setViewMode('visualize');
      } else {
        setOutput("No output");
      }
    } catch (err) {
      setOutput(`Execution failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setViewMode('solve');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
      <Navbar onRun={handleRun} isLoading={isLoading} problemTitle={question?.title} />

      {/* Toolbar for Mode Switching */}
      <div className="h-12 border-b border-white/10 flex items-center px-6 bg-[#0d0d0d] gap-3 shrink-0">
        <button 
          onClick={() => setViewMode('solve')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'solve' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Code2 size={16} /> Problem & Editor
        </button>
        <button 
          onClick={() => setViewMode('visualize')}
          disabled={!executionTrace}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'visualize' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${!executionTrace ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Eye size={16} /> Visualize Trace
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {viewMode === 'solve' ? (
          // SOLVE MODE LAYOUT
          <PanelGroup direction="horizontal">
            {/* Left Pane: Description */}
            <Panel defaultSize={45} minSize={20} className="border-r border-white/10 flex flex-col bg-[#0d0d0d] overflow-y-auto custom-scrollbar">
              {question ? (
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-3">{question.title}</h1>
                  <div className="flex gap-3 mb-8">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      question.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      question.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {question.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 font-mono bg-white/5 px-2.5 py-1 rounded border border-white/10">
                      {question.category}
                    </span>
                  </div>

                  <div className="prose prose-invert max-w-none text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap mb-10">
                    {question.description}
                  </div>

                  {question.examples && question.examples.length > 0 && (
                    <>
                      <h3 className="font-semibold text-lg text-white mb-4">Examples</h3>
                      <div className="space-y-6 mb-10">
                        {question.examples.map((ex, i) => (
                          <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 text-[14px]">
                            <p className="mb-3"><span className="font-semibold text-slate-300">Input:</span> <span className="font-mono text-blue-300">{ex.input}</span></p>
                            <p className="mb-3"><span className="font-semibold text-slate-300">Output:</span> <span className="font-mono text-green-300">{ex.output}</span></p>
                            {ex.explanation && (
                              <p className="text-slate-400 mt-3 pt-3 border-t border-white/10"><span className="font-semibold text-slate-300">Explanation:</span> {ex.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {question.constraints && question.constraints.length > 0 && (
                    <>
                      <h3 className="font-semibold text-lg text-white mb-4">Constraints</h3>
                      <ul className="list-disc pl-5 space-y-2 text-[14px] text-slate-300 font-mono bg-white/5 p-5 rounded-xl border border-white/10">
                        {question.constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-8 text-slate-500">Problem not found.</div>
              )}
            </Panel>

            <PanelResizeHandle className="w-1 bg-white/5 hover:bg-blue-500/50 transition-colors cursor-col-resize z-10" />

            {/* Right Pane: Code Editor + Terminal */}
            <Panel defaultSize={55} minSize={30} className="flex flex-col">
              <PanelGroup direction="vertical">
                <Panel defaultSize={70} minSize={20} className="relative border-b border-white/10">
                   <CodeEditor code={code} onChange={setCode} language="cpp" />
                </Panel>
                
                <PanelResizeHandle className="h-1 bg-white/5 hover:bg-blue-500/50 transition-colors cursor-row-resize z-10" />

                <Panel defaultSize={30} minSize={10} className="bg-[#050505] p-5 font-mono text-sm overflow-auto flex flex-col relative">
                  <div className="text-slate-500 mb-4 pb-3 border-b border-white/10 flex items-center gap-2 uppercase text-[11px] tracking-widest sticky top-0 bg-[#050505] z-10 font-bold">
                  <Terminal size={14} /> Terminal Output
                  {isLoading && <span className="animate-pulse text-blue-400 ml-auto">Executing...</span>}
                </div>
                <pre className={`whitespace-pre-wrap text-[13px] leading-relaxed flex-1 ${output.includes("ERROR") ? "text-red-400" : "text-green-500"}`}>
                  {output || "Click 'Run & Visualize' to compile your code and see the output..."}
                </pre>
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        ) : (
          // VISUALIZE MODE LAYOUT
          <PanelGroup direction="horizontal">
            {/* Left Pane: Small Editor */}
            <Panel defaultSize={25} minSize={15} className="border-r border-white/10 bg-[#0d0d0d] flex flex-col">
              <div className="p-3 border-b border-white/10 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest bg-black/40">
                 <Code2 size={14} /> Source Code <span className="text-[10px] lowercase opacity-50 ml-auto">(Read-only)</span>
              </div>
              <div className="flex-1 opacity-80 pointer-events-none custom-scrollbar">
                 <CodeEditor code={code} onChange={() => {}} language="cpp" />
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-white/5 hover:bg-blue-500/50 transition-colors cursor-col-resize z-10" />

            {/* Right Pane: Large Visualizer */}
            <Panel defaultSize={75} minSize={40} className="bg-[#0d0d0d] p-6 flex flex-col">
              {executionTrace ? (
                <div className="flex-1 bg-[#111111] rounded-2xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_-15px_rgba(59,130,246,0.1)] flex flex-col">
                  <div className="h-10 bg-black/50 border-b border-white/10 flex items-center px-4 shrink-0 text-sm font-semibold text-blue-400">
                     Execution Trace Viewer
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <ExecutionVisualizer trace={executionTrace} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  No trace available. Please run the code first.
                </div>
              )}
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
}
