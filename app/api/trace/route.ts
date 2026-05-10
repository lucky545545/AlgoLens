import { NextRequest, NextResponse } from 'next/server';
import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Automatic C++ Tracer API
 * 
 * POST /api/trace
 * Input: { code: "raw C++ code" }
 * Output: { success: true, trace: [...], stdout: "..." }
 * 
 * Automatically converts ANY C++ code to traced version and runs it
 */

interface TraceRequest {
  code: string;
}

interface TraceResponse {
  success: boolean;
  trace?: any[];
  stdout?: string;
  stderr?: string;
  message?: string;
}

async function convertCodeToTracedViaPython(rawCode: string): Promise<string> {
  // Skip Python and use the robust fallback directly
  // (Python has Unicode encoding issues on Windows)
  return convertCodeToTracedFallback(rawCode);
}

function convertCodeToTracedFallback(rawCode: string): string {
  let traced = rawCode.trim();

  if (!traced.includes('#include')) {
    traced = '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n' + traced;
  }

  const lines = traced.split('\n');
  
  const instrumentedLines = lines.map((line, index) => {
      let modified = line;
      const ln = index + 1;

      if (/(if|while|for)\s*\(.*?\)\s*\{/.test(modified)) {
          modified = modified.replace(
              /(if|while|for)\s*\(.*?\)\s*\{/g,
              (match) => `${match} _trace("CONDITION", "line_${ln}", true);`
          );
      }

      if (!line.includes('for') && !line.includes('while') && !line.includes('if')) {
          const isDecl = /(int|float|double|char|bool|long|short)\s+([a-zA-Z_]\w*)\s*=?\s*([^;]*);/.test(modified);
          
          if (isDecl) {
              modified = modified.replace(
                  /(int|float|double|char|bool|long|short)\s+([a-zA-Z_]\w*)\s*=?\s*([^;]*);/g,
                  (match, type, varName) => `${match} _trace("DECLARATION", "${varName}", ${varName});`
              );
          }

          const isVectorDecl = /vector<[a-zA-Z0-9_:]+>\s+([a-zA-Z_]\w*)\s*=?\s*([^;]*);/.test(modified);
          if (isVectorDecl) {
              modified = modified.replace(
                  /vector<[a-zA-Z0-9_:]+>\s+([a-zA-Z_]\w*)\s*=?\s*([^;]*);/g,
                  (match, varName) => `${match} _trace("DECLARATION", "${varName}", ${varName});`
              );
          }

          if (!isDecl && !isVectorDecl && /^\s*([a-zA-Z_]\w*)\s*=\s*([^;]+);/.test(modified)) {
              modified = modified.replace(
                  /^(\s*)([a-zA-Z_]\w*)\s*=\s*([^;]+);/g,
                  (match, indent, varName) => `${match} _trace("ASSIGNMENT", "${varName}", ${varName});`
              );
          }

          if (/^\s*([a-zA-Z_]\w*)\[.*?\]\s*(?:\+|-|\*|\/|%|&|\||\^|<<|>>)?=\s*([^;]+);/.test(modified)) {
              modified = modified.replace(
                  /^(\s*)([a-zA-Z_]\w*)\[.*?\]\s*(?:\+|-|\*|\/|%|&|\||\^|<<|>>)?=\s*([^;]+);/g,
                  (match, indent, varName) => `${match} _trace("ASSIGNMENT", "${varName}", ${varName});`
              );
          }

          if (/^\s*([a-zA-Z_]\w*)\.push_back\(.*?\);/.test(modified)) {
              modified = modified.replace(
                  /^(\s*)([a-zA-Z_]\w*)\.push_back\(.*?\);/g,
                  (match, indent, varName) => `${match} _trace("ASSIGNMENT", "${varName}", ${varName});`
              );
          }

          if (/^\s*([a-zA-Z_]\w*)\((?!.*\)\s*\{).*?\);/.test(modified)) {
              modified = modified.replace(
                  /^(\s*)([a-zA-Z_]\w*)\((?!.*\)\s*\{).*?\);/g,
                  (match, indent, funcName) => `${indent}_trace("CALL", "${funcName}", 0); ${match.trim()}`
              );
          }
      }

      return modified;
  });

  let result = instrumentedLines.join('\n');

  if (!result.includes('#include "bridge.h"')) {
      result = '#include "bridge.h"\n' + result;
  }

  return result;
}

async function compileAndRun(tracedCode: string, libPath: string): Promise<{ stdout: string; stderr: string }> {
  const tmpDir = os.tmpdir();
  const codeFile = path.join(tmpDir, `traced_${Date.now()}.cpp`);
  const outputFile = path.join(tmpDir, `traced_${Date.now()}.exe`);

  try {
    // Write traced code to temp file
    fs.writeFileSync(codeFile, tracedCode);

    // Compile with g++
    const compileCmd = `g++ -std=c++17 -I"${libPath}" -o "${outputFile}" "${codeFile}"`;
    console.log('Compile command:', compileCmd);
    
    try {
      execSync(compileCmd, { encoding: 'utf-8' });
    } catch (compileError: any) {
      // Compilation failed
      const errorMsg = compileError.stderr || compileError.stdout || compileError.message;
      console.error('Compilation error:', errorMsg);
      return { 
        stdout: '', 
        stderr: errorMsg
      };
    }

    // Run the executable
    try {
      const result = execSync(`"${outputFile}"`, { encoding: 'utf-8' });
      return { stdout: result, stderr: '' };
    } catch (runError: any) {
      // Even if execSync throws, we might have gotten stdout (the trace output)
      const stdout = runError.stdout || '';
      const stderr = runError.stderr || '';
      
      // If we have trace output (JSON), it's a successful execution
      if (stdout.includes('{"type"')) {
        console.log('Program executed successfully, produced trace output');
        return { stdout, stderr: '' };
      }
      
      // Otherwise it's a real error
      const errorMsg = stderr || stdout || runError.message;
      console.error('Runtime error:', errorMsg);
      return { 
        stdout: stdout, 
        stderr: errorMsg
      };
    }
  } catch (error: any) {
    console.error('Fatal error in compileAndRun:', error);
    return { 
      stdout: '', 
      stderr: error.message || 'Unknown error'
    };
  } finally {
    // Cleanup temp files
    try {
      if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }
}

function parseTraceOutput(stdout: string): any[] {
  const lines = stdout.split('\n');
  const trace: any[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
      try {
        trace.push(JSON.parse(line));
      } catch (e) {
        // Skip invalid JSON lines
      }
    }
  }

  return trace;
}

export async function POST(request: NextRequest): Promise<NextResponse<TraceResponse>> {
  try {
    const body: TraceRequest = await request.json();
    const { code } = body;

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Code is required' },
        { status: 400 }
      );
    }

    console.log('Received code:', code.slice(0, 100) + '...');

    // Check if code already has tracer macros
    let finalCode = code;
    if (!code.includes('_trace') && !code.includes('#include "bridge.h"')) {
      // Auto-convert to traced version
      console.log('Converting code to traced version...');
      finalCode = await convertCodeToTracedViaPython(code);
    }

    console.log('Final code to compile:', finalCode.slice(0, 150) + '...');

    // Get the lib/cpp directory path
    const libPath = path.join(process.cwd(), 'lib', 'cpp');

    // Check if code has a main function
    if (!finalCode.match(/\bmain\s*\(/)) {
      return NextResponse.json(
        {
          success: false,
          stderr: "Error: No 'main' function found. C++ programs require a main() entry point to execute.",
          message: 'Missing main function'
        },
        { status: 400 }
      );
    }

    // Compile and run
    console.log('Compiling and running...');
    const { stdout, stderr } = await compileAndRun(finalCode, libPath);

    if (stderr) {
      console.error('Compilation/execution error:', stderr);
      return NextResponse.json(
        {
          success: false,
          stderr,
          message: 'Compilation or execution failed'
        },
        { status: 400 }
      );
    }

    // Parse trace output
    console.log('Parsing trace output...');
    const trace = parseTraceOutput(stdout);
    
    console.log(`Generated ${trace.length} trace events`);

    return NextResponse.json({
      success: true,
      trace,
      stdout
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}
