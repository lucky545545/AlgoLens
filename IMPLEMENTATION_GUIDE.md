# AlgoLens Implementation Guide

## Quick Start

1. **Write C++ Code** - Use the tracer macros for automatic variable tracking
2. **Run** - Click "Run & Visualize" to compile and execute in browser
3. **Watch** - See your algorithm execute step-by-step with full visualization
4. **Control** - Use playback controls to pause, step, or adjust speed

---

## System Components

### 1. Tracer System (`tracer.hpp`)

Instruments your C++ code to emit JSON events for each state change.

**Key Classes:**
- `TrackedVar<T>` - Wraps variables to track changes
- `TrackedArray<T, N>` - Wraps arrays to track element changes

**Key Macros:**
```cpp
TRACE_INT(name, value)              // Create tracked integer
TRACE_VAR(type, name, value)        // Create tracked variable of any type
TRACK_FUNCTION_ENTRY("name")        // Mark function entry point
TRACK_FUNCTION_EXIT()               // Mark function return
TRACE_LINE()                        // Mark important line for visualization
__emit_event__(type, line, var, val) // Emit custom event
```

**Event Output:**
```json
{"type":"var_declare","step_id":1,"line":10,"function":"main","call_stack":["main"],"var":"x","value":0}
{"type":"var_change","step_id":2,"line":11,"function":"main","call_stack":["main"],"var":"x","value":10}
```

### 2. Execution Engine (`client-runner.ts`)

Runs C++ code compiled to WebAssembly directly in the browser.

```typescript
interface RunResult {
    stdout: string;      // All output (includes JSON trace + regular output)
    stderr: string;      // Compilation/runtime errors
    exitCode: number;    // 0 = success
    error?: string;      // Internal errors
}

// Usage:
const result = await runCppInBrowser(cppCode);
```

### 3. Parser (`parser.ts`)

Converts JSON output into structured execution frames.

```typescript
interface ExecutionFrame {
    step_id: number;                      // Unique step identifier
    line: number;                         // Source line number
    function: string;                     // Current function name
    callStack: string[];                  // Full call stack
    variables: Map<string, Variable>;     // All local variables
    arrayStates: Map<string, number[]>;   // All arrays and their values
    eventType: string;                    // 'var_change', 'array_change', etc.
}

interface ExecutionTrace {
    frames: ExecutionFrame[];             // All execution frames
    totalSteps: number;                   // Total frame count
    error?: string;                       // Parse errors
}

// Usage:
const trace = parseExecutionTrace(result.stdout);
```

### 4. Visualization Components

#### StateCanvas / VariablesPanel
Shows all local variables with their current values.
- Highlights recently changed variables in yellow
- Animates value changes
- Shows variable type

#### CallStackPanel
Displays the function call hierarchy.
- Shows which function is currently executing
- Displays stack depth
- Enables understanding of recursion

#### ArrayVisualization
Visual representation of arrays as boxes.
- Each element in its own box
- Highlight indices during operations
- Shows array state evolution

#### StepPlayer
Playback controls for stepping through execution.
- Play/Pause button
- Step forward/backward
- Reset to beginning
- Speed control (100ms to 2000ms per step)
- Progress bar showing position in trace

#### ExecutionVisualizer
Main container combining all visualization panels.
- Responsive grid layout
- Synchronized step updates
- Current frame info display

---

## Data Flow

```
┌─────────────────────────┐
│   User Writes C++       │
│   with TRACE macros     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Compile to WebAssembly     │
│  (Browser-side, no server)  │
└────────────┬────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Execute and Emit JSON Events    │
│  Each event on new line (stdout) │
└────────────┬─────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Parser Converts to ExecutionFrames│
│  Each frame = state snapshot       │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ React Components Display Frames    │
│ User Controls Playback             │
└────────────────────────────────────┘
```

---

## Writing Visualizable Code

### Example 1: Simple Variable Tracking

```cpp
#include "tracer.hpp"
using namespace std;

int main() {
    TRACE_INT(x, 0);          // Creates tracked x = 0
    TRACE_INT(y, 5);          // Creates tracked y = 5
    
    for (TRACE_INT(i, 0); i < 3; i++) {
        x = x + y;            // Automatically tracked
        TRACE_LINE();         // Mark important lines
    }
    
    cout << "Result: " << x << endl;
    return 0;
}
```

**Visualization:** See x increment from 0 → 5 → 10 → 15

---

### Example 2: Function Calls

```cpp
int factorial(int n) {
    TRACK_FUNCTION_ENTRY("factorial");
    
    if (n <= 1) {
        TRACK_FUNCTION_EXIT();
        return 1;
    }
    
    TRACE_INT(result, n * factorial(n - 1));
    TRACK_FUNCTION_EXIT();
    return result;
}

int main() {
    TRACE_INT(answer, factorial(5));
    return 0;
}
```

**Visualization:**
- Call stack grows as you recurse
- Stack shrinks on returns
- Watch how n changes at each level

---

### Example 3: Array Operations

```cpp
void bubble_sort(int arr[], int n) {
    TRACK_FUNCTION_ENTRY("bubble_sort");
    
    // Emit initial array state
    cout << "{\"type\":\"array_declare\",\"var\":\"arr\",\"value\":\"[";
    for (int i = 0; i < n; i++) {
        cout << arr[i];
        if (i < n-1) cout << ",";
    }
    cout << "]\"}\n";
    
    for (TRACE_INT(i, 0); i < n - 1; i++) {
        for (TRACE_INT(j, 0); j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                // Emit new array state
                cout << "{\"type\":\"array_change\",\"var\":\"arr\",\"value\":\"[...]}\\n";
            }
        }
    }
    
    TRACK_FUNCTION_EXIT();
}
```

**Visualization:** See array elements swap positions in real-time

---

## Advanced Features

### Custom Event Emission

For data structures not handled by basic tracking:

```cpp
// Emit custom event
__emit_event__("my_event", __LINE__, "optional_var", "optional_value");

// Or directly to stdout:
cout << "{\"type\":\"custom\",\"data\":\"value\"}\n";
```

### Global State Tracking

For tracking metrics across functions:

```cpp
int global_comparisons = 0;

void compare_and_swap(int& a, int& b) {
    global_comparisons++;
    if (a > b) swap(a, b);
    __emit_event__("comparison", __LINE__, "comparisons", to_string(global_comparisons));
}
```

### Conditional Tracing

Only trace in debug mode:

```cpp
#ifdef TRACE_DEBUG
    TRACE_INT(debug_var, 0);
#endif
```

---

## Test Case Format

Test cases can be embedded as JSON in events:

```cpp
int main() {
    // Test case 1
    vector<int> arr = {5, 2, 8, 1};
    cout << "{\"type\":\"test_case\",\"input\":[5,2,8,1],\"name\":\"unsorted\"}\n";
    bubble_sort(arr);
    cout << "{\"type\":\"test_result\",\"output\":[1,2,5,8],\"passed\":true}\n";
    
    return 0;
}
```

---

## Integration with LeetCode

To import LeetCode problems:

1. **Get Problem Template** (not yet automated)
2. **Add Tracing** using macro templates
3. **Run Test Cases** against all examples

Example for "Two Sum":

```cpp
#include "tracer.hpp"
#include <vector>
#include <map>

vector<int> twoSum(vector<int>& nums, int target) {
    TRACK_FUNCTION_ENTRY("twoSum");
    
    map<int, int> seen;
    TRACE_INT(comparisons, 0);
    
    for (TRACE_INT(i, 0); i < nums.size(); i++) {
        TRACE_INT(complement, target - nums[i]);
        comparisons++;
        
        if (seen.count(complement)) {
            cout << "{\"type\":\"pair_found\",...}\n";
            TRACK_FUNCTION_EXIT();
            return {seen[complement], i};
        }
        
        seen[nums[i]] = i;
    }
    
    TRACK_FUNCTION_EXIT();
    return {};
}
```

---

## Performance Tips

1. **Only trace necessary variables** - Each trace adds a JSON event
2. **Batch updates** - Emit fewer events for large arrays
3. **Use early exit** - Mark when algorithm terminates early
4. **Limit recursion depth** - Very deep recursion creates many frames

Example - Limited recursion tracing:

```cpp
int fibonacci(int n, int depth = 0) {
    if (depth < 5) {  // Only emit events for first 5 levels
        TRACK_FUNCTION_ENTRY("fibonacci");
    }
    
    // ...
    
    if (depth < 5) {
        TRACK_FUNCTION_EXIT();
    }
    return result;
}
```

---

## Debugging Tips

### Check Raw Output

If visualization doesn't work, check the raw stdout:
1. Look for JSON parsing errors
2. Verify all events have required fields
3. Check event format is valid JSON

### Common Issues

**No visualization appears:**
- Make sure you're emitting events (check for JSON in output)
- Verify parser isn't returning error
- Check browser console for React errors

**Wrong values displayed:**
- Verify values in JSON match variable state
- Check variable is being updated before emitting event

**Call stack wrong:**
- Ensure TRACK_FUNCTION_ENTRY/EXIT are balanced
- Check order of function tracking vs actual calls

---

## File Reference

| File | Purpose |
|------|---------|
| `tracer.hpp` | Core tracing macros and classes |
| `client-runner.ts` | WASM execution engine |
| `parser.ts` | JSON to ExecutionFrame conversion |
| `ExecutionVisualizer.tsx` | Main visualization container |
| `VariablesPanel.tsx` | Variable display component |
| `CallStackPanel.tsx` | Call stack visualization |
| `ArrayVisualization.tsx` | Array element display |
| `StepPlayer.tsx` | Playback controls |
| `page.tsx` | Main application page |

---

## Next Steps

1. ✅ Write your C++ algorithm with TRACE macros
2. ✅ Click "Run & Visualize"
3. ✅ Use step player to control execution
4. ✅ Experiment with different inputs
5. ⏳ (Future) Import from LeetCode
6. ⏳ (Future) Save/share visualizations
7. ⏳ (Future) Compare solutions

---

## API Cheat Sheet

```cpp
// Variables
TRACE_INT(name, value);                    // int
TRACE_VAR(type, name, value);              // any type

// Functions
TRACK_FUNCTION_ENTRY("name");              // Start
TRACK_FUNCTION_EXIT();                     // End

// Execution
TRACE_LINE();                              // Mark line
__emit_event__(type, line, var, val);      // Custom event

// Arrays
__array_to_string__(vector);               // Format array for display
cout << "{\"type\":\"array_change\"...}\\n"; // Manual emit
```

```typescript
// Parser
parseExecutionTrace(stdout);               // Convert to trace
getFrameAtStep(trace, id);                 // Get frame at step
getChangedVariables(current, prev);        // Find changes
getMemoryState(trace, id);                 // Get all variables
formatValue(value);                        // Format for display
```

---

Created: 2024
Version: 1.0 - Initial Release
