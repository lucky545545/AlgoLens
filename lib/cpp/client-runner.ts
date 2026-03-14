// src/lib/client-runner.ts
// Executes C++ code compiled to WebAssembly directly in the browser

export interface RunResult {
    stdout: string;      // All output including JSON trace events + regular output
    stderr: string;      // Compilation and runtime errors
    exitCode: number;    // 0 = success, non-zero = failure
    error?: string;      // Internal execution errors
}

// Inline tracer header - automatically injected into user code
const TRACER_HEADER = `
#pragma once
#include <iostream>
#include <vector>
#include <map>
#include <unordered_map>
#include <string>

namespace __tracer__ {
    static int __step_id__ = 0;
    static std::string __current_function__ = "main";
    static std::vector<std::string> __call_stack__ = {"main"};
}

inline void __emit_event__(const std::string& type, int line, const std::string& var = "", const std::string& val = "") {
    __tracer__::__step_id__++;
    std::cout << "{";
    std::cout << "\\"type\\":\\"" << type << "\\"";
    std::cout << ",\\"step_id\\":" << __tracer__::__step_id__;
    std::cout << ",\\"line\\":" << line;
    std::cout << ",\\"function\\":\\"" << __tracer__::__current_function__ << "\\"";
    std::cout << ",\\"call_stack\\":[";
    for (size_t i = 0; i < __tracer__::__call_stack__.size(); i++) {
        std::cout << "\\"" << __tracer__::__call_stack__[i] << "\\"";
        if (i < __tracer__::__call_stack__.size() - 1) std::cout << ",";
    }
    std::cout << "]";
    if (!var.empty()) {
        std::cout << ",\\"var\\":\\"" << var << "\\",\\"value\\":" << val;
    }
    std::cout << "}" << std::endl;
}

template <typename T>
class TrackedVar {
    T value;
    std::string name;
    
public:
    TrackedVar(T v, const std::string& n, int line = 0) : value(v), name(n) {
        __emit_event__("var_declare", line, n, std::to_string(v));
    }
    
    TrackedVar& operator=(T newValue) {
        value = newValue;
        __emit_event__("var_change", 0, name, std::to_string(value));
        return *this;
    }
    
    operator T() const { return value; }
    T operator++(int) { T temp = value; value++; return temp; }
    T operator++() { ++value; return value; }
    T operator--(int) { T temp = value; value--; return temp; }
    T operator--() { --value; return value; }
};

template <typename K, typename V>
inline std::string __map_to_json__(const std::map<K, V>& m) {
    std::string result = "{";
    bool first = true;
    for (auto it = m.begin(); it != m.end(); ++it) {
        if (!first) result += ",";
        result += "\\"" + std::to_string(it->first) + "\\":" + std::to_string(it->second);
        first = false;
    }
    result += "}";
    return result;
}

template <typename K, typename V>
inline std::string __unordered_map_to_json__(const std::unordered_map<K, V>& m) {
    std::string result = "{";
    bool first = true;
    for (auto it = m.begin(); it != m.end(); ++it) {
        if (!first) result += ",";
        result += "\\"" + std::to_string(it->first) + "\\":" + std::to_string(it->second);
        first = false;
    }
    result += "}";
    return result;
}

inline void __emit_map_change__(const std::string& var, const std::string& map_json) {
    __tracer__::__step_id__++;
    std::cout << "{";
    std::cout << "\\"type\\":\\"map_change\\"";
    std::cout << ",\\"step_id\\":" << __tracer__::__step_id__;
    std::cout << ",\\"line\\":" << __LINE__;
    std::cout << ",\\"function\\":\\"" << __tracer__::__current_function__ << "\\"";
    std::cout << ",\\"call_stack\\":[";
    for (size_t i = 0; i < __tracer__::__call_stack__.size(); i++) {
        std::cout << "\\"" << __tracer__::__call_stack__[i] << "\\"";
        if (i < __tracer__::__call_stack__.size() - 1) std::cout << ",";
    }
    std::cout << "],\\"var\\":\\"" << var << "\\",\\"value\\":" << map_json << "}" << std::endl;
}

#define TRACE_MAP_CHANGE(var_name, map_obj) \\
    __emit_map_change__(#var_name, __map_to_json__(map_obj))

#define TRACE_UNORDERED_MAP_CHANGE(var_name, map_obj) \\
    __emit_map_change__(#var_name, __unordered_map_to_json__(map_obj))

#define TRACE_MAP_INSERT(var_name, map_obj, key, value) \\
    map_obj[key] = value; \\
    TRACE_MAP_CHANGE(var_name, map_obj)

#define TRACE_MAP_ERASE(var_name, map_obj, key) \\
    map_obj.erase(key); \\
    TRACE_MAP_CHANGE(var_name, map_obj)

#define TRACE_UNORDERED_MAP_INSERT(var_name, map_obj, key, value) \\
    map_obj[key] = value; \\
    TRACE_UNORDERED_MAP_CHANGE(var_name, map_obj)

#define TRACE_UNORDERED_MAP_ERASE(var_name, map_obj, key) \\
    map_obj.erase(key); \\
    TRACE_UNORDERED_MAP_CHANGE(var_name, map_obj)

#define TRACK_FUNCTION_ENTRY(f) \\
    __tracer__::__current_function__ = f; \\
    __tracer__::__call_stack__.push_back(f); \\
    __emit_event__("function_call", __LINE__, f)

#define TRACK_FUNCTION_EXIT() \\
    __emit_event__("function_return", __LINE__); \\
    __tracer__::__call_stack__.pop_back(); \\
    __tracer__::__current_function__ = __tracer__::__call_stack__.back()

#define TRACE_LINE() __emit_event__("line", __LINE__)

#define TRACE_VAR(type, name, value) TrackedVar<type> name(value, #name, __LINE__)

#define TRACE_INT(name, value) TRACE_VAR(int, name, value)
`;

/**
 * Runs C++ code in the browser using WebAssembly
 * Automatically injects tracer.hpp if #include "tracer.hpp" is found
 * 
 * JSON events in stdout will be parsed by parseExecutionTrace()
 * 
 * Example:
 * \`\`\`cpp
 * #include "tracer.hpp"
 * int main() {
 *     TRACE_INT(x, 0);
 *     x = 10;
 *     return 0;
 * }
 * \`\`\`
 */
export async function runCppInBrowser(code: string): Promise<RunResult> {
    // Auto-inject tracer header if user includes it
    let processedCode = code;
    if (code.includes('#include "tracer.hpp"')) {
        // Replace the include with the actual header content
        processedCode = code.replace(
            '#include "tracer.hpp"',
            TRACER_HEADER
        );
    }

    return new Promise((resolve) => {
        const worker = new Worker('/worker/clang-worker.js');
        let fullStdout = '';

        // Handle worker initialization errors
        worker.onerror = (err) => {
            resolve({ 
                stdout: "", 
                stderr: `Worker failed to load: ${err.message}`, 
                exitCode: 1 
            });
            worker.terminate();
        };

        // Send processed code to worker for compilation and execution
        worker.postMessage({ code: processedCode });

        // Handle messages from worker
        worker.onmessage = (e) => {
            const data = e.data;
            
            // Handle different message types
            if (data.type === 'STATUS') {
                // Status updates (e.g., "Compiling...", "Running...")
                return;
            }
            
            if (data.type === 'stdout') {
                // Accumulate stdout output
                fullStdout += data.message;
                return;
            }
            
            if (data.type === 'ERROR') {
                resolve({
                    stdout: fullStdout || data.stdout || "",
                    stderr: data.stderr || data.message || "Unknown error",
                    exitCode: 1
                });
                worker.terminate();
                return;
            }
            
            if (data.type === 'SUCCESS') {
                resolve({
                    stdout: data.stdout || fullStdout,
                    stderr: "",
                    exitCode: 0
                });
                worker.terminate();
                return;
            }
        };
    });
}

