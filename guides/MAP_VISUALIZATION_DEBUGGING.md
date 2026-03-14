# Map Visualization Troubleshooting Guide

## Issue: "No arrays and maps in scope" appears in visualizer

If you're seeing this message instead of your maps/arrays, follow these steps to identify the root cause.

## Step 1: Check Browser Console

Open DevTools (F12) and look for the debug output. You should see:

```javascript
ExecutionVisualizer Debug: {
  currentStep: 0,
  currentFrameExists: true,
  memoryStateExists: true,
  arrays: 0,
  maps: 0,
  localVariables: 3,
  frameMapStates: [["freq", {...}]]
}
```

### What to look for:
- **currentFrameExists: false** → No execution frames captured
- **memoryStateExists: false** → Frame exists but memory not found
- **frameMapStates: []** → Maps not being populated in frame
- **maps: 0** → Parser isn't detecting maps

---

## Step 2: Check Console Output

Verify the C++ program is outputting map_change events:

```bash
./example_map_visualization.exe | findstr map_change
```

Should show:
```json
{"type":"map_change","step_id":2,...,"value":{}}
{"type":"map_change","step_id":3,...,"value":{"1":1}}
```

**If no output**: The tracer macros aren't being called or compilation didn't include tracer.hpp

---

## Step 3: Check Parser Detection

The parser looks for one of these indicators:

1. **Event type is 'map_change'** ← Primary check
2. **Value is object with numeric keys** ← Fallback check
3. **Value is string like "{\"1\":1}"** ← String JSON fallback

```javascript
// In parser.ts, detection logic checks:
if (event.type === 'map_change') {
    // Store as map ✓
} else if (typeof event.value === 'object' && looksLikeMap) {
    // Store as map ✓
} else if (typeof event.value === 'string' && startsWith('{')) {
    // Parse string as JSON ✓
}
```

---

## Common Issues & Solutions

### Issue 1: Maps showing in console debug but "No maps in scope" in UI

**Root Cause**: React component isn't re-rendering or conditional logic is wrong

**Solution**:
```tsx
// Check the condition in ExecutionVisualizer.tsx
{memoryState && (memoryState.arrays.length > 0 || memoryState.maps.length > 0) ? (
    // Show maps
) : (
    // "No arrays or maps in scope" message
)}
```

Verify:
- memoryState is not null
- memoryState.maps.length > 0
- Both conditions are met

### Issue 2: All steps show "No arrays and maps in scope"

**Root Cause**: Frames not being populated with map data

**Debug**:
1. Check console output: `./example_map_visualization.exe | head`
2. Look for `"type":"map_change"` events
3. Verify value field has map object: `"value":{}`

**Fix**:
- Did you call `TRACE_UNORDERED_MAP_CHANGE()` in C++ code?
- Is tracer.hpp being included correctly?
- Check compilation output for warnings

### Issue 3: Maps visible at some steps but not others

**Root Cause**: Map goes out of scope or frame doesn't have mapStates

**Debug**:
1. Step through using the player
2. Open console and look at which frames have maps
3. Maps should persist once created

**Fix**:
- Ensure map variable stays in scope
- Check that getMemoryState gets the right frame

### Issue 4: Parser error or invalid JSON

**Root Cause**: C++ output format is incorrect

**Debug**:
- Save C++ output to file: `./program > output.json`
- Check each line is valid JSON
- Verify map values are numbers: `{"1":10}` not `{"key":"value"}`

**Fix**:
```cpp
// ✓ Correct - numeric key and value
mp[5] = 10;
TRACE_UNORDERED_MAP_CHANGE(mp, mp);
// Outputs: {"type":"map_change",...,"value":{"5":10}}

// ✗ Wrong - string values won't compile correctly
mp["key"] = "value";
TRACE_UNORDERED_MAP_CHANGE(mp, mp);
```

---

## Debugging Checklist

### C++ Side:
- [ ] `#include "tracer.hpp"` is present
- [ ] `TRACK_FUNCTION_ENTRY("functionName")` is called
- [ ] `TRACE_UNORDERED_MAP_CHANGE(name, map)` called after modifications
- [ ] Map keys and values are integers
- [ ] Code compiles with `-std=c++17`

### JavaScript/Parser Side:
- [ ] Parser.ts has map detection logic
- [ ] ExecutionFrame includes mapStates field
- [ ] getMemoryState returns maps array
- [ ] Event type is 'map_change' in output

### React Component:
- [ ] MapVisualization.tsx exists and is imported
- [ ] ExecutionVisualizer imports MapVisualization
- [ ] Conditional rendering checks `memoryState.maps.length`
- [ ] No JavaScript errors in console

### Example Output Format:
```json
{"type":"map_change","step_id":2,"line":12,"function":"main","call_stack":["main"],"var":"freq","value":{"1":1,"2":2}}
```

All required fields present? ✓

---

## Quick Test

### Step 1: Create minimal test file
```cpp
#include <unordered_map>
#include "tracer.hpp"
using namespace std;

int main() {
    unordered_map<int, int> test;
    TRACE_UNORDERED_MAP_CHANGE(test, test);
    
    test[1] = 10;
    TRACE_UNORDERED_MAP_CHANGE(test, test);
    
    test[2] = 20;
    TRACE_UNORDERED_MAP_CHANGE(test, test);
    
    return 0;
}
```

### Step 2: Compile
```bash
cd lib/cpp
g++ -std=c++17 -I. -o test_map test.cpp
```

### Step 3: Run and check output
```bash
./test_map 2>&1 | findstr "map_change"
```

Should see:
```
{"type":"map_change",...,"value":{}}
{"type":"map_change",...,"value":{"1":10}}
{"type":"map_change",...,"value":{"1":10,"2":20}}
```

### Step 4: Paste output to visualizer
Copy the full output and paste into AlgoLens visualizer. Maps should appear.

---

## Console Logging Hints

Check browser console (F12 → Console tab) for:

```javascript
// ✓ Should see this if everything works:
ExecutionVisualizer Debug: {
  currentFrameExists: true,
  memoryStateExists: true,
  arrays: 0,
  maps: 1,  // <-- Should be > 0
  frameMapStates: [["freq", {"1":10}]]
}

// ✗ If you see this, parser isn't detecting maps:
ExecutionVisualizer Debug: {
  frameMapStates: []  // <-- Empty!
}

// ✗ If you see this, no frames captured:
ExecutionVisualizer Debug: {
  currentFrameExists: false
}
```

---

## Next Steps

1. **Run the debug steps above** and tell me what you see
2. **Check browser console** for the debug output
3. **Look at C++ program output** with `| findstr "map_change"`
4. **Share the results** and I can help narrow down the issue

The debug output will pinpoint exactly where the problem is:
- If maps are in frameMapStates → Problem is in React rendering
- If frameMapStates is empty → Problem is in parser
- If only variables show → Parser is treating maps as primitives

---

## Files to Review

- `lib/cpp/parser.ts` - Map detection logic
- `components/visualizer/ExecutionVisualizer.tsx` - Conditional rendering
- `components/visualizer/MapVisualization.tsx` - Map display component
- `lib/cpp/tracer.hpp` - Trace macro definitions
