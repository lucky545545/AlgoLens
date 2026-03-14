# AlgoLens - Complete Setup & Integration Guide

## What's New in This Update

This update transforms AlgoLens from a basic code executor to a **comprehensive algorithm visualizer** with:

✅ **Line-by-Line Execution Tracking** - See your code execute one statement at a time  
✅ **Variable State Visualization** - Watch variables change in real-time  
✅ **Function Call Stack** - Understand recursion and function calls  
✅ **Array Visualization** - See array elements and their changes  
✅ **Memory Tracking** - View memory allocations and deallocation  
✅ **Playback Controls** - Play, pause, step, and adjust execution speed  
✅ **Algorithm Animations** - Watch sorting, searching, tree traversals animate  

---

## Architecture Overview

### Before (Basic Executor)
```
Code → Compile to WASM → Execute → Print Output
```

### After (Full Visualizer)
```
Code + Tracer Macros → Compile → Execute with JSON Events
                              ↓
                      Parse Events to Frames
                              ↓
                      Display in React Components
                              ↓
                      User Plays Through Execution
```

---

## Files Added/Modified

### 📝 Files Added

| File | Purpose |
|------|---------|
| `lib/cpp/tracer.hpp` | Core tracing system with macros |
| `components/visualizer/ExecutionVisualizer.tsx` | Main visualization container |
| `components/visualizer/VariablesPanel.tsx` | Variable display |
| `components/visualizer/CallStackPanel.tsx` | Call stack visualization |
| `components/visualizer/ArrayVisualization.tsx` | Array element display |
| `components/visualizer/StepPlayer.tsx` | Playback controls |
| `lib/cpp/example_bubble_sort.cpp` | Bubble sort example |
| `lib/cpp/example_binary_search.cpp` | Binary search example |
| `lib/cpp/example_tree_traversal.cpp` | Tree traversal example |
| `lib/cpp/TRACER_GUIDE.cpp` | Tracer usage guide |
| `README_VISUALIZER.md` | Feature documentation |
| `IMPLEMENTATION_GUIDE.md` | Implementation details |
| `SETUP.md` | This file |

### 📝 Files Modified

| File | Changes |
|------|---------|
| `app/page.tsx` | Integrated ExecutionVisualizer, updated state management |
| `lib/cpp/parser.ts` | Rewrote to parse detailed JSON events into ExecutionFrames |
| `lib/cpp/client-runner.ts` | Enhanced with documentation, better error handling |
| `components/EditorContainer.tsx` | Updated default code to C++ |

---

## How It Works: Data Flow

### Step 1: User Writes Code

```cpp
#include "tracer.hpp"
int main() {
    TRACE_INT(x, 0);
    x = 10;
    return 0;
}
```

### Step 2: Tracer Injects Events

Each line that interacts with tracked variables emits a JSON event on stdout:

```bash
{"type":"var_declare","step_id":1,"line":5,"var":"x","value":0}
{"type":"var_change","step_id":2,"line":6,"var":"x","value":10}
```

### Step 3: Parser Converts to Frames

```typescript
ExecutionTrace {
    frames: [
        ExecutionFrame {
            step_id: 1,
            line: 5,
            variables: { x: 0 },
            eventType: "var_declare"
        },
        ExecutionFrame {
            step_id: 2,
            line: 6,
            variables: { x: 10 },
            eventType: "var_change"
        }
    ]
}
```

### Step 4: Visualizer Displays

The `ExecutionVisualizer` component renders each frame with:
- Current variable values
- Call stack state
- Array contents
- Step player controls

### Step 5: User Controls Playback

Use the step player to:
- Play through automatically
- Step forward/backward manually
- Adjust execution speed
- Reset to beginning

---

## Integration with TraceHpp

The tracer works by:

1. **Wrapping variables** in `TrackedVar<T>` class
2. **Emitting events** when values change via operator overloading
3. **Tracking function calls** with `TRACK_FUNCTION_ENTRY/EXIT` macros
4. **Collecting call stack** for each event

Example:
```cpp
TrackedVar<int> x = 10;  // Emits: {"type":"var_declare","var":"x","value":10}
x = 20;                  // Emits: {"type":"var_change","var":"x","value":20}
                         // Operator assignment is overloaded!
```

---

## Using in Your Code

### Minimal Example

```cpp
#include "tracer.hpp"
using namespace std;

int main() {
    TRACE_INT(sum, 0);
    for (TRACE_INT(i, 0); i < 5; i++) {
        sum = sum + i;
    }
    cout << "Result: " << sum << endl;
    return 0;
}
```

### With Functions

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
```

### With Arrays

```cpp
void bubble_sort(vector<int>& arr) {
    TRACK_FUNCTION_ENTRY("bubble_sort");
    
    for (TRACE_INT(i, 0); i < arr.size(); i++) {
        for (TRACE_INT(j, 0); j < arr.size() - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
                // Emit array state after swap
                cout << "{\"type\":\"array_change\",\"var\":\"arr\",...}\\n";
            }
        }
    }
    
    TRACK_FUNCTION_EXIT();
}
```

---

## Component Architecture

```
ExecutionVisualizer (Main Container)
├── StepPlayer (Play/Pause/Speed Controls)
├── VariablesPanel
│   └── Shows all local variables + their values
├── CallStackPanel
│   └── Displays function call stack
└── ArrayVisualization
    └── Visual representation of arrays
```

### ExecutionVisualizer Props
```typescript
interface ExecutionVisualizerProps {
    trace: ExecutionTrace;  // Full execution trace from parser
}
```

### State Management
```typescript
const [currentStep, setCurrentStep] = useState(0);

// Get current frame
const currentFrame = getFrameAtStep(trace, currentStep);

// Get memory state (variables + arrays) at current step
const memoryState = getMemoryState(trace, currentFrame?.step_id);

// Find which variables changed from previous frame
const changedVars = getChangedVariables(currentFrame, previousFrame);
```

---

## Parser Functions

### parseExecutionTrace(stdout)

Converts raw JSON output into structured frames.

```typescript
// Input: Multiple JSON lines
`{"type":"var_declare",...}
 {"type":"var_change",...}
 {"type":"array_change",...}`

// Output:
{
    frames: [ExecutionFrame, ExecutionFrame, ...],
    totalSteps: 42,
    error: null
}
```

### getFrameAtStep(trace, stepId)

Get state at specific step.

```typescript
const frame = getFrameAtStep(trace, 5);
console.log(frame.variables);  // Map<string, Variable>
```

### getMemoryState(trace, stepId)

Get all variables and arrays at step.

```typescript
const memory = getMemoryState(trace, 5);
// {
//   localVariables: [Variable, Variable, ...],
//   arrays: [{name: "arr", values: [1,2,3]}]
// }
```

### getChangedVariables(current, previous)

Find what changed between frames.

```typescript
const changed = getChangedVariables(frame2, frame1);
// Returns only variables that changed value
```

---

## Test Examples Included

Three complete working examples are provided:

### 1. Bubble Sort (`example_bubble_sort.cpp`)

Shows:
- Loop execution
- Variable tracking (i, j, swaps counter)
- Array state changes
- Algorithm metrics

Test with: `{5, 2, 8, 1}` → `{1, 2, 5, 8}`

### 2. Binary Search (`example_binary_search.cpp`)

Shows:
- Recursive function calls
- Call stack growth and shrinkage
- Narrowing search space
- Found/not found states

Test with: Find 23 in `[2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78]`

### 3. Tree Traversal (`example_tree_traversal.cpp`)

Shows:
- Tree structure visualization
- In-order traversal
- Level-order (BFS) traversal
- Node visitation order

Test with the included binary tree structure.

---

## Event Types

The tracer can emit these JSON event types:

### var_declare
```json
{"type":"var_declare","step_id":1,"line":5,"var":"x","value":0}
```
- New variable created

### var_change
```json
{"type":"var_change","step_id":2,"line":6,"var":"x","value":10}
```
- Variable value changed

### array_change
```json
{"type":"array_change","step_id":3,"line":12,"var":"arr","value":"[1,2,3]"}
```
- Array modified

### function_call
```json
{"type":"function_call","step_id":4,"line":20,"function":"factorial"}
```
- Function entered

### function_return
```json
{"type":"function_return","step_id":5,"line":25,"function":"factorial"}
```
- Function exited

### line
```json
{"type":"line","step_id":6,"line":30}
```
- Line execution marker

### Custom
```json
{"type":"custom_event","data":"custom"}
```
- User-defined events

---

## Quick Reference: Macros

```cpp
// Variable declarations and tracking
TRACE_INT(x, 0)                    // Track integer
TRACE_VAR(type, name, val)         // Track any type

// Function tracking
TRACK_FUNCTION_ENTRY("func_name")  // Mark function start
TRACK_FUNCTION_EXIT()              // Mark function end

// Line tracking  
TRACE_LINE()                       // Mark important line

// Event emission
__emit_event__(type, line, var, val)  // Emit event

// Array utilities
__array_to_string__(arr)           // Format array for JSON
```

---

## Common Patterns

### Pattern 1: Simple Loop Animation

```cpp
for (TRACE_INT(i, 0); i < n; i++) {
    TRACE_INT(current_value, arr[i]);
    // Process...
}
```

Visualization: Watch `i` and `current_value` change each iteration

### Pattern 2: Recursion Tracking

```cpp
int recursive_func(int n) {
    TRACK_FUNCTION_ENTRY("recursive_func");
    
    TRACE_INT(param, n);
    if (n <= 0) {
        TRACK_FUNCTION_EXIT();
        return 0;
    }
    
    TRACE_INT(result, recursive_func(n-1));
    TRACK_FUNCTION_EXIT();
    return result;
}
```

Visualization: See call stack grow and shrink

### Pattern 3: Array Sorting

```cpp
void sort_algo(int arr[], int n) {
    TRACK_FUNCTION_ENTRY("sort_algo");
    
    // Emit initial array
    cout << "{\"type\":\"array\",\"var\":\"arr\",...}\\n";
    
    for (TRACE_INT(i, 0); i < n; i++) {
        // Perform swaps...
        // Emit updated array after each swap
        cout << "{\"type\":\"array_change\",...}\\n";
    }
    
    TRACK_FUNCTION_EXIT();
}
```

Visualization: Watch array sort in real-time

### Pattern 4: Tree Traversal

```cpp
void traverse(TreeNode* node) {
    if (!node) return;
    
    cout << "{\"type\":\"visit_node\",\"id\":" << node->id << "}\\n";
    traverse(node->left);
    traverse(node->right);
}
```

Visualization: See traversal order and tree structure

---

## Performance Notes

- Each traced variable adds a JSON event to output
- Large arrays = many events (may slow visualization)
- Deep recursion = large call stack visualization
- Solution: Only trace essential variables

Example - Trace fewer variables:
```cpp
// DON'T do this for every variable
TRACE_INT(temp1, 0);
TRACE_INT(temp2, 0);
TRACE_INT(temp3, 0);

// DO this - only track important ones
TRACE_INT(iterations, 0);
TRACE_INT(swaps, 0);
```

---

## Troubleshooting

### Problem: No visualization appears

**Solution:** 
1. Check if JSON events are in stdout
2. Look for parse errors in ExecutionTrace
3. Verify all events have required fields

### Problem: Variables showing wrong values

**Solution:**
1. Verify you're using TRACE_VAR or TRACE_INT
2. Check event value matches actual variable
3. Ensure event is emitted AFTER change

### Problem: Call stack doesn't match code

**Solution:**
1. Check TRACK_FUNCTION_ENTRY/EXIT are balanced
2. Verify they wrap the entire function body
3. Look for missing or extra function entries

### Problem: Array visualization shows wrong values

**Solution:**
1. Emit array state after ALL modifications
2. Use proper JSON array format: `"[1,2,3]"`
3. Update on EVERY array change, not just some

---

## Integration Checklist

- [x] Tracer system implemented (`tracer.hpp`)
- [x] Parser handles new event format (`parser.ts`)
- [x] Visualization components created
- [x] Main page integrated
- [x] Examples provided
- [x] Documentation complete

Ready to use! ✅

---

## Next Steps

1. **Try an example**: Copy bubble sort, binary search, or tree traversal
2. **Modify** with your own code
3. **Add trace macros** to instrument your algorithm
4. **Run** and watch visualization
5. **Play with controls**: speed up, slow down, step through
6. **Experiment** with different inputs

---

## Support Resources

| Resource | Location |
|----------|----------|
| Feature overview | `README_VISUALIZER.md` |
| Implementation details | `IMPLEMENTATION_GUIDE.md` |
| Tracer reference | `lib/cpp/TRACER_GUIDE.cpp` |
| Bubble sort example | `lib/cpp/example_bubble_sort.cpp` |
| Binary search example | `lib/cpp/example_binary_search.cpp` |
| Tree traversal example | `lib/cpp/example_tree_traversal.cpp` |

---

## Questions?

Refer to:
1. **"What can I trace?"** → `lib/cpp/TRACER_GUIDE.cpp`
2. **"How does it work?"** → `IMPLEMENTATION_GUIDE.md`
3. **"What event types exist?"** → `README_VISUALIZER.md`
4. **"Example please!"** → `lib/cpp/example_*.cpp`

Good luck visualizing! 🎉
