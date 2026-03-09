// tracer.hpp - Enhanced C++ tracer for AlgoLens visualizer
#pragma once
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <sstream>
#include <typeinfo>
#include <cxxabi.h>

// Global state for tracing
namespace __tracer__ {
    static int __line_number__ = 0;
    static int __step_id__ = 0;
    static std::string __current_function__ = "main";
    static std::vector<std::string> __call_stack__ = {"main"};
    static std::map<std::string, std::string> __variables__;
    static std::map<std::string, std::vector<int>> __arrays__;
}

// Tracer events
struct TracerEvent {
    std::string type; // "step", "var_change", "array_change", "call", "return"
    int step_id;
    int line_number;
    std::string function_name;
    std::string variable_name;
    std::string value;
    std::vector<int> array_values;
};

// Emit event as JSON
inline void __emit_event__(const std::string& type, int line, const std::string& var = "", const std::string& val = "") {
    __tracer__::__step_id__++;
    std::cout << "{"
        << "\"type\":\"" << type << "\","
        << "\"step_id\":" << __tracer__::__step_id__ << ","
        << "\"line\":" << line << ","
        << "\"function\":\"" << __tracer__::__current_function__ << "\","
        << "\"call_stack\":[";
    
    for (size_t i = 0; i < __tracer__::__call_stack__.size(); i++) {
        std::cout << "\"" << __tracer__::__call_stack__[i] << "\"";
        if (i < __tracer__::__call_stack__.size() - 1) std::cout << ",";
    }
    std::cout << "]";
    
    if (!var.empty()) {
        std::cout << ",\"var\":\"" << var << "\",\"value\":" << val;
        __tracer__::__variables__[var] = val;
    }
    std::cout << "}\n";
    std::cout.flush();
}

// Track variable changes
template <typename T>
class TrackedVar {
    T value;
    std::string name;
    int line_number;
    
public:
    TrackedVar(T v, const std::string& n, int line = 0) 
        : value(v), name(n), line_number(line) {
        __emit_event__("var_declare", line, n, std::to_string(v));
    }
    
    TrackedVar& operator=(T newValue) {
        value = newValue;
        __emit_event__("var_change", line_number, name, std::to_string(value));
        return *this;
    }
    
    operator T() const { return value; }
    T operator++(int) { T temp = value; value++; return temp; }
    T operator++() { ++value; return value; }
    T operator--(int) { T temp = value; value--; return temp; }
    T operator--() { --value; return value; }
};

// Track array operations
template <typename T, size_t N>
class TrackedArray {
    T arr[N];
    std::string name;
    
public:
    TrackedArray(const std::string& n) : name(n) {
        for (size_t i = 0; i < N; i++) arr[i] = 0;
        __emit_event__("array_declare", 0, n, std::to_string(N));
    }
    
    T& operator[](size_t i) {
        class ArrayElement {
        public:
            T& ref;
            TrackedArray& parent;
            size_t index;
            
            ArrayElement(T& r, TrackedArray& p, size_t idx) 
                : ref(r), parent(p), index(idx) {}
            
            ArrayElement& operator=(T val) {
                ref = val;
                std::string array_str = "[";
                for (size_t j = 0; j < N; j++) {
                    array_str += std::to_string(parent.arr[j]);
                    if (j < N - 1) array_str += ",";
                }
                array_str += "]";
                __emit_event__("array_change", 0, parent.name, array_str);
                return *this;
            }
        };
        return arr[i];
    }
    
    T operator[](size_t i) const { return arr[i]; }
};

// Track function calls
#define TRACK_FUNCTION_ENTRY(func_name) \
    __tracer__::__current_function__ = func_name; \
    __tracer__::__call_stack__.push_back(func_name); \
    __emit_event__("function_call", __LINE__, func_name)

#define TRACK_FUNCTION_EXIT() \
    __emit_event__("function_return", __LINE__); \
    __tracer__::__call_stack__.pop_back(); \
    __tracer__::__current_function__ = __tracer__::__call_stack__.back()

// Track line execution
#define TRACE_LINE() __emit_event__("line", __LINE__)

// Macro to inject tracing into variable declarations
#define TRACE_VAR(type, name, value) \
    TrackedVar<type> name(value, #name, __LINE__)

#define TRACE_INT(name, value) TRACE_VAR(int, name, value)
#define TRACE_STRING(name, value) TrackedVar<std::string> name(value, #name, __LINE__)

// Helper to print array state (for debugging)
template <typename T>
inline std::string __array_to_string__(const std::vector<T>& arr) {
    std::string result = "[";
    for (size_t i = 0; i < arr.size(); i++) {
        result += std::to_string(arr[i]);
        if (i < arr.size() - 1) result += ",";
    }
    result += "]";
    return result;
}

// Performance optimizations - only trace in debug mode
#ifdef TRACE_ENABLED
    #define IF_TRACE(x) x
#else
    #define IF_TRACE(x)
#endif