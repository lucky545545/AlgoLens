# AlgoLens - C++ Algorithm Visualizer

A comprehensive IDE for visualizing C++ algorithm execution step-by-step with variable tracking, call stack visualization, memory state, and array animations.

## Features

✅ **Step-by-Step Execution** - Execute code line-by-line and visualize each step  
✅ **Variable Tracking** - See all variables and their values change in real-time  
✅ **Call Stack Visualization** - Track function calls and returns  
✅ **Array/Data Structure Visualization** - Visual representation of arrays and their state changes  
✅ **Memory Visualization** - See heap allocations and pointer relationships  
✅ **Algorithm Animation** - Watch sorting, searching, tree traversals animate  
✅ **Playback Controls** - Play, pause, step through, adjust speed  
✅ **Browser-Based Execution** - WebAssembly compilation runs in the browser  

## Architecture

```
User Writes C++ Code
        ↓
Code Injected with Tracer.hpp Macros
        ↓
Compiled to WebAssembly (Browser)
        ↓
Execution Emits JSON Events (stdout)
        ↓
Parser Converts Events to Execution Frames
        ↓
Visualization Components Display Each Frame
```

## How It Works

### 1. Code Instrumentation

When user code runs, it uses tracer macros to emit JSON events:

```cpp
#include "tracer.hpp"

int main() {
    TRACE_INT(x, 10);      // Emits: {"type":"var_declare","var":"x","value":10}
    x = 20;                // Emits: {"type":"var_change","var":"x","value":20}
    return 0;
}
```

### 2. Event Types Emitted

The tracer can emit these event types:

- **var_declare** - Variable declaration
- **var_change** - Variable value changed
- **array_change** - Array element(s) modified
- **function_call** - Function entry
- **function_return** - Function exit
- **line** - Line execution marker
- **step** - General execution step

Each event includes:
```json
{
  "type": "var_change",
  "step_id": 5,
  "line": 12,
  "function": "main",
  "call_stack": ["main"],
  "var": "x",
  "value": 20
}
```

### 3. Parsing

The `parseExecutionTrace()` function converts JSON lines to structured `ExecutionFrame` objects:

```typescript
interface ExecutionFrame {
    step_id: number;
    line: number;
    function: string;
    callStack: string[];
    variables: Map<string, Variable>;
    arrayStates: Map<string, number[]>;
    eventType: string;
}
```

### 4. Visualization

React components display the execution state:

- **VariablesPanel** - All local variables with current values
- **CallStackPanel** - Function call stack depth visualization  
- **ArrayVisualization** - Visual boxes showing array elements
- **StepPlayer** - Playback controls (play, pause, step, speed)
- **ExecutionVisualizer** - Main component combining all views

## Using the Tracer

### Basic Usage

```cpp
#include "tracer.hpp"
using namespace std;

int main() {
    TRACE_INT(sum, 0);           // Track integer
    
    for (TRACE_INT(i, 0); i < 5; i++) {
        TRACE_LINE();            // Mark important line
        sum = sum + i;           // Auto-tracked
    }
    
    cout << sum << endl;
    return 0;
}
```

### Function Tracking

```cpp
int fibonacci(int n) {
    TRACK_FUNCTION_ENTRY("fibonacci");  // Enter function
    
    if (n <= 1) {
        TRACK_FUNCTION_EXIT();           // Exit function
        return n;
    }
    
    TRACE_INT(result, fibonacci(n-1) + fibonacci(n-2));
    TRACK_FUNCTION_EXIT();
    return result;
}
```

### Array Operations

```cpp
void bubble_sort(int arr[], int n) {
    TRACK_FUNCTION_ENTRY("bubble_sort");
    
    // Emit initial array state
    cout << "{\"type\":\"array_declare\",\"var\":\"arr\",\"value\":\"[...]\"}\\n";
    
    for (TRACE_INT(i, 0); i < n; i++) {
        for (TRACE_INT(j, 0); j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
                // Emit swap event
                cout << "{\"type\":\"array_change\",\"var\":\"arr\",...}\\n";
            }
        }
    }
    
    TRACK_FUNCTION_EXIT();
}
```

### Custom Events

```cpp
// For complex structures not caught by basic tracing:
__emit_event__("custom_event", __LINE__, "var_name", "value");

// Example: Tree node visit
cout << "{\"type\":\"visit_node\",\"node_id\":1,\"value\":42}\\n";
```

## File Structure

```
AlgoLens/
├── lib/cpp/
│   ├── tracer.hpp           # Core tracing macros and classes
│   ├── client-runner.ts     # Executes C++ in browser via WebAssembly
│   ├── parser.ts            # Parses JSON events into execution frames
│   └── TRACER_GUIDE.cpp     # Examples and reference
│
├── components/visualizer/
│   ├── ExecutionVisualizer.tsx    # Main visualization container
│   ├── VariablesPanel.tsx         # Shows variables and values
│   ├── CallStackPanel.tsx         # Shows function call stack
│   ├── ArrayVisualization.tsx     # Visualizes arrays
│   ├── StepPlayer.tsx             # Playback controls
│   └── StepGrid.tsx               # (deprecated, use ExecutionVisualizer)
│
├── app/
│   └── page.tsx             # Main page component
│
└── components/
    └── editor/
        └── CodeEditor.tsx   # Monaco editor for C++ code
```

## API Reference

### Tracer Types & Macros

```cpp
// Variable tracking
TRACE_INT(name, value)              // int variable
TRACE_VAR(type, name, value)        // any type

// Function tracking
TRACK_FUNCTION_ENTRY("name")        // Mark function entry
TRACK_FUNCTION_EXIT()               // Mark function exit

// Line tracking
TRACE_LINE()                        // Mark line for execution

// Array operations
__array_to_string__(vector)         // Convert array to JSON string

// Custom events
__emit_event__(type, line, var, val)  // Emit arbitrary event
```

### Parser Functions

```typescript
parseExecutionTrace(stdout: string): ExecutionTrace
  // Convert JSON lines to execution frames

getFrameAtStep(trace, stepId): ExecutionFrame
  // Get state at specific step

getChangedVariables(current, previous): Variable[]
  // Find which variables changed

getMemoryState(trace, stepId): MemoryState
  // Get all variables and arrays at step

formatValue(value): string
  // Format value for display
```

### React Components

```tsx
<ExecutionVisualizer trace={trace} />
  // Main visualization - shows all panels + playback

<VariablesPanel variables={vars} changedVariables={set} />
  // Show local variables

<CallStackPanel callStack={stack} currentFunction={func} />
  // Show function call hierarchy

<ArrayVisualization name="arr" values={[1,2,3]} />
  // Show array as boxes

<StepPlayer trace={trace} currentStep={0} onStepChange={fn} />
  // Playback controls
```

## Example: Merge Sort Visualization

Here's a complete example showing how to visualize merge sort:

```cpp
#include "tracer.hpp"
#include <vector>

void merge(vector<int>& arr, int left, int mid, int right) {
    TRACK_FUNCTION_ENTRY("merge");
    
    vector<int> temp;
    TRACE_INT(i, left);
    TRACE_INT(j, mid + 1);
    
    while (i <= mid && j <= right) {
        TRACE_LINE();
        if (arr[i] <= arr[j]) {
            temp.push_back(arr[i++]);
        } else {
            temp.push_back(arr[j++]);
        }
    }
    
    // Copy remaining
    while (i <= mid) temp.push_back(arr[i++]);
    while (j <= right) temp.push_back(arr[j++]);
    
    // Copy back to main array
    for (TRACE_INT(k, 0); k < temp.size(); k++) {
        arr[left + k] = temp[k];
    }
    
    cout << "{\"type\":\"array_change\",\"var\":\"arr\",...}\\n";  // Emit merged state
    TRACK_FUNCTION_EXIT();
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    // Visualize merge sort...
    return 0;
}
```

## Performance Considerations

- Tracing adds overhead - consider only tracing essential variables
- Use `IF_TRACE(x)` macro for debug-only tracing:
  ```cpp
  #define TRACE_ENABLED
  IF_TRACE(TRACE_INT(debug_var, 0));  // Only if TRACE_ENABLED
  ```

## Future Enhancements

- [ ] Memory graph visualization (pointer visualization)
- [ ] Custom data structure templates (Node, Graph, etc.)
- [ ] Breakpoint support
- [ ] Test case runner integration
- [ ] Performance metrics (time/space complexity)
- [ ] Support for Python, JavaScript visualization
- [ ] Data structure templates for common structures
- [ ] Code annotation suggestions

## Contributing

Contributions welcome! Areas to improve:
- Additional tracer macros for common patterns
- Performance optimizations
- More visualization types (graphs, heaps, etc.)
- Integration with online judge APIs

## License

MIT License - Feel free to use and modify for educational purposes.
