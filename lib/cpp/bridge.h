#pragma once
#include "tracer.hpp"
#include <string>
#include <sstream>
#include <vector>
#include <ostream>

template <typename T>
inline std::ostream& operator<<(std::ostream& os, const std::vector<T>& vec) {
    os << __array_to_string__(vec);
    return os;
}

template <typename T>
inline void _trace(const std::string& eventType, const std::string& identifier, const T& value) {
    std::string emitType = "step";
    int lineNumber = 0;
    
    if (eventType == "DECLARATION") {
        emitType = "var_declare";
    } else if (eventType == "ASSIGNMENT") {
        emitType = "var_change";
    } else if (eventType == "CONDITION") {
        emitType = "line";
        if (identifier.find("line_") == 0) {
            try { lineNumber = std::stoi(identifier.substr(5)); } catch (...) {}
        }
    } else if (eventType == "CALL") {
        emitType = "function_call";
        __tracer__::__current_function__ = identifier;
        __tracer__::__call_stack__.push_back(identifier);
    }
    
    // Convert value to string safely for older compilers (no if constexpr)
    std::ostringstream oss;
    oss << std::boolalpha << value;
    std::string valStr = oss.str();
    
    // For non-numeric strings, we might need quotes, but tracer.hpp handles standard strings.
    // We just pass it down as valStr.
    __emit_event__(emitType, lineNumber, identifier, valStr);
}
