#include <iostream>
#include <unordered_map>
#include "tracer.hpp"
using namespace std;

int main() {
    cout << "{\"type\":\"test_start\"}\n";
    
    unordered_map<int, int> m;
    TRACE_UNORDERED_MAP_CHANGE(m, m);
    
    m[1] = 10;
    TRACE_UNORDERED_MAP_CHANGE(m, m);
    
    m[2] = 20;
    TRACE_UNORDERED_MAP_CHANGE(m, m);
    
    m[1] = 15;
    TRACE_UNORDERED_MAP_CHANGE(m, m);
    
    cout << "{\"type\":\"test_end\"}\n";
    return 0;
}
