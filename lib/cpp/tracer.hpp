// tracer.hpp (Injected automatically)
#include <iostream>
#include <string>
#include <map>

template <typename T>
class Observed {
    T value;
    std::string name;
public:
    Observed(T v, std::string n) : value(v), name(n) { record(); }
    
    // Overload the assignment operator to "catch" changes
    void operator=(T newValue) {
        value = newValue;
        record(); // Every time the value changes, tell the website
    }

    void record() {
        std::cout << "{\"type\": \"change\", \"var\": \"" << name << "\", \"val\": " << value << "}" << std::endl;
    }
};