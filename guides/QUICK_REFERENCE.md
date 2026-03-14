# AlgoLens - Quick Reference Card

## Macro Cheat Sheet

### Variables
```cpp
TRACE_INT(name, value)           // Track an integer
TRACE_VAR(type, name, value)     // Track any type
```

### Functions
```cpp
TRACK_FUNCTION_ENTRY("name")     // Mark function start
TRACK_FUNCTION_EXIT()            // Mark function end
```

### Execution
```cpp
TRACE_LINE()                     // Mark important line
__emit_event__(type, ln, v, val) // Custom event
```

---

## Complete Minimal Example

```cpp
#include "tracer.hpp"
using namespace std;

int main() {
    TRACE_INT(x, 0);
    x = 10;
    cout << x << endl;
    return 0;
}
```

**Visualizes:** x changes from 0 → 10

---

## Common Patterns

### Loop with Counter
```cpp
TRACE_INT(sum, 0);
for (TRACE_INT(i, 0); i < 5; i++) {
    sum = sum + i;
}
```

### Function Recursion
```cpp
int fib(int n) {
    TRACK_FUNCTION_ENTRY("fib");
    if (n <= 1) {
        TRACK_FUNCTION_EXIT();
        return n;
    }
    TRACE_INT(r, fib(n-1) + fib(n-2));
    TRACK_FUNCTION_EXIT();
    return r;
}
```

### Sorting Algorithm
```cpp
void bubble_sort(vector<int>& arr) {
    TRACK_FUNCTION_ENTRY("bubble_sort");
    
    for (TRACE_INT(i, 0); i < arr.size(); i++) {
        for (TRACE_INT(j, 0); j < arr.size()-1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
                cout << "{\"type\":\"array_change\"}\\n";
            }
        }
    }
    
    TRACK_FUNCTION_EXIT();
}
```

---

## What You'll See

### Variables Panel
```
Local Variables
─────────────────
x: 10 ✨
i: 3
sum: 30
```

### Call Stack
```
Call Stack
──────────
[2] fibonacci
[1] main
```

### Arrays Panel
```
arr: [1] [2] [5] [8]
```

### Step Player
```
⏮ ⏭ ▶︎ ⏸
Step 15 / 42 [==========→     ] 35%
```

---

## Event Types

| Event | Triggered By |
|-------|--------------|
| var_declare | TRACE_INT/VAR |
| var_change | Variable assignment |
| array_change | Array element change |
| function_call | TRACK_FUNCTION_ENTRY |
| function_return | TRACK_FUNCTION_EXIT |
| line | TRACE_LINE() |

---

## Tips

✅ **DO** trace important variables  
✅ **DO** use TRACK_FUNCTION_ENTRY/EXIT  
✅ **DO** mark loops with TRACE_INT  

❌ **DON'T** trace every variable  
❌ **DON'T** forget TRACK_FUNCTION_EXIT  
❌ **DON'T** use massive arrays (>100 elements)

---

## Workflow

1. **Write** code with TRACE macros
2. **Click** "Run & Visualize"
3. **Watch** step-by-step execution
4. **Play/Pause** to control speed
5. **Step** forward/backward
6. **Reset** to start over

---

## Common Issues

| Issue | Solution |
|-------|----------|
| No visualization | Check JSON in output |
| Wrong values | Ensure TRACE before assignment |
| Call stack missing | Add TRACK_FUNCTION_ENTRY/EXIT |
| Array not showing | Manually emit array_change event |

---

## Resources

- **Full Guide:** [SETUP.md](SETUP.md)
- **Examples:** [lib/cpp/example_*.cpp](lib/cpp/)
- **Reference:** [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- **Tracer API:** [lib/cpp/TRACER_GUIDE.cpp](lib/cpp/TRACER_GUIDE.cpp)

---

## Example Outputs

### Input
```cpp
TRACE_INT(x, 0);
for (TRACE_INT(i, 0); i < 3; i++) {
    x = x + 10;
}
```

### Visualization
```
Step 0: x = 0, i = 0
Step 1: i = 1, x = 10
Step 2: i = 2, x = 20
Step 3: i = 3, x = 30
Step 4: loop ends
```

---

## Try These Examples

1. **Fibonacci** - See recursion tree
2. **Bubble Sort** - Watch array swap
3. **Binary Search** - See search space narrow
4. **Merge Sort** - Complex recursion
5. **Tree Traversal** - Data structure ops

---

**AlgoLens v1.0 - March 2026** 🎉
