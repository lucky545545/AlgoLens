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
  // Robust fallback tracer macro injection for C++
  let traced = rawCode.trim();

  // 1. Add necessary includes
  if (!traced.includes('#include')) {
    traced = '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n' + traced;
  }
  
  if (!traced.includes('#include "tracer.hpp"')) {
    // Add after other includes
    const lastIncludeMatch = traced.match(/.*#include[^\n]*\n/s);
    if (lastIncludeMatch) {
      const lastIncludePos = lastIncludeMatch[0].length;
      traced = traced.slice(0, lastIncludePos) + '#include "tracer.hpp"\n' + traced.slice(lastIncludePos);
    } else {
      traced = '#include "tracer.hpp"\n' + traced;
    }
  }

  // 2. Replace variable declarations with TRACE_INT macros
  // But ONLY if the variable is being declared (has 'int' or 'long' keyword before it)
  // Match: type varname = value;
  traced = traced.replace(
    /\b(int|long|short|float|double|bool|char|unsigned)\s+(\w+)\s*=\s*([^;{,]+);/gm,
    (match, type, varName, value) => {
      // Skip keywords and special identifiers
      if (['main', 'true', 'false', 'nullptr', 'null'].includes(varName)) return match;
      const trimmedVal = value.trim();
      return `TRACE_INT(${varName}, ${trimmedVal});`;
    }
  );

  // 3. Handle simple for loops with new declarations
  // ONLY match: for (int i = 0; i < n; i++)
  // DON'T match: for (i = 0, j = ...; ...)
  traced = traced.replace(
    /for\s*\(\s*(int|long)\s+(\w+)\s*=\s*([^;]+);\s*([^;]+);\s*([^)]+)\)/gm,
    (match, type, varName, init, condition, increment) => {
      // Make sure this is a simple for loop, not one with comma-separated inits
      if (init.includes(',')) {
        return match; // Skip complex loop initializations
      }
      return `for( TRACE_INT(${varName}, ${init.trim()}) ; ${condition.trim()} ; ${increment.trim()} )`;
    }
  );

  // 4. Add function entry tracking
  // Find all function definitions and add TRACK_FUNCTION_ENTRY
  traced = traced.replace(
    /(\w+)\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*\{/gm,
    (match, returnType, funcName, params) => {
      if (['if', 'while', 'for'].includes(returnType) || funcName.startsWith('TRACE')) {
        return match;
      }
      // Add tracking after opening brace
      return `${returnType} ${funcName}(${params}) {\n    TRACK_FUNCTION_ENTRY("${funcName}");`;
    }
  );

  // 5. Add function exit before returns
  traced = traced.replace(
    /\breturn\s+([^;]*);/gm,
    (match, returnVal) => {
      if (match.includes('TRACK_FUNCTION_EXIT')) return match;
      const val = returnVal.trim();
      return `TRACK_FUNCTION_EXIT();\n    return ${val};`;
    }
  );

  // 6. Track simple variable assignments (x = value;)
  // Skip complex cases
  traced = traced.replace(
    /^(\s*)(\w+)\s*=\s*([^;{]+);(?![\s]*TRACE)/gm,
    (match, indent, varName, value) => {
      // Skip if already traced
      if (match.includes('TRACE_INT') || match.includes('TRACK_')) return match;
      // Skip special cases
      if (['cout', 'cin', 'return', 'if', 'while', 'for'].includes(varName)) return match;
      // Skip if value is complex (contains parentheses or other operators)
      if (value.includes('(') || value.includes('[') || value.includes('*') || value.includes('/')) return match;
      
      const trimmedVal = value.trim();
      return `${indent}TRACE_INT(${varName}, ${trimmedVal});`;
    }
  );

  return traced;
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
    if (!code.includes('TRACE_INT') && !code.includes('#include "tracer.hpp"')) {
      // Auto-convert to traced version
      console.log('Converting code to traced version...');
      finalCode = await convertCodeToTracedViaPython(code);
    }

    console.log('Final code to compile:', finalCode.slice(0, 150) + '...');

    // Get the lib/cpp directory path
    const libPath = path.join(process.cwd(), 'lib', 'cpp');

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
