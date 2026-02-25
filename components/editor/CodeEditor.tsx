import Editor from '@monaco-editor/react';

interface Props {
  code: string;
  onChange: (val: string) => void;
  language?: string;
}

export function CodeEditor({ code, onChange, language = "python" }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center px-4 py-2 bg-[#1a1a1a] border-b border-white/5 justify-between">
        <span className="text-xs font-mono text-blue-400 uppercase">
          {language === "cpp" ? "main.cpp" : "solution.py"}
        </span>
      </div>
      <Editor
        height="100%"
        theme="vs-dark"
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={(v) => onChange(v || "")}
        options={{ fontSize: 15, minimap: { enabled: false } }}
      />
    </div>
  );
}