# 🚀 AlgoLens Auto-Trace Quickstart

Get your algorithms visualized in **30 seconds** - no macro knowledge needed!

## Installation

### 1. Start the Server

From the `AlgoLens` directory:

```bash
npm install
npm run dev
```

Server will start at `http://localhost:3000`

### 2. Open AlgoLens in Browser

Go to: **http://localhost:3000**

## Usage - Three Simple Steps

### Step 1: Paste Your Algorithm

Any raw C++ code works. Example:

```cpp
int maxArea(vector<int>& height) {
    int area_max = 0;
    int i = 0;
    int j = height.size() - 1;

    while (i < j) {
        int current_height = min(height[i], height[j]);
        int current_width = j - i;
        int current_area = current_height * current_width;
        
        if (current_area > area_max) {
            int updated_max = current_area;
            area_max = updated_max;
        }
        
        if (height[i] < height[j]) {
            i++;
        } else {
            j--;
        }
    }

    return area_max;
}
```

### Step 2: Click "Auto-Trace & Visualize"

The system automatically:
- ✅ Detects if code needs tracing
- ✅ Adds tracer macros behind the scenes
- ✅ Compiles with g++
- ✅ Executes and captures trace

### Step 3: Watch the Visualization

See:
- 📊 All algorithm steps animated
- 📋 Variables with live values
- 🔄 Play/pause/step through execution

##  What You DO NOT Need

❌ **No tracer macros**  
❌ **No `#include "tracer.hpp"`**  
❌ **No TRACE_INT() calls**  
❌ **No compilation knowledge**  
❌ **No setup complexity**  

Just paste and visualize!

## Supported Algorithms

Works great for:
- ✅ Two-pointer problems (sliding window, container with most water)
- ✅ Array sorting and searching
- ✅ Hash maps and frequency counting
- ✅ Simple recursion
- ✅ Dynamic programming basics
- ✅ Graph traversal (BFS/DFS)

## Features

| Feature | Status |
|---------|--------|
| Auto-detection of trace requirements | ✅ Working |
| Automatic macro injection | ✅ Working |
| Compilation from browser | ✅ Working |
| Step-by-step visualization | ✅ Working |
| Variable value tracking | ✅ Working |
| Array visualization | ✅ Working |
| Map visualization | ✅ Working |

## Architecture

```
User Code (no macros)
        ↓
    Backend API
        ↓
    Auto-Convert to Traced C++
        ↓
    Compile with g++
        ↓
    Execute & Capture Trace JSON
        ↓
    Visualizer displays all steps
```

## Backend Components

- **API**: `app/api/trace/route.ts` - Handles conversion & compilation
- **Tracer System**: `lib/cpp/tracer.hpp` - Macro definitions
- **Frontend**: `app/page.tsx` - Main UI orchestration
- **Visualizer**: `components/visualizer/ExecutionVisualizer.tsx` - Animation

## Troubleshooting

### "Compilation Error"
- Check your C++ syntax
- Ensure headers are included correctly
- Try a simpler algorithm first

### "No Variables Showing"
- Variables must be declared with type: `int x`, not `x = ...`
- Avoid advanced C++ features (templates, lambda functions)
- Check browser console for errors

### Server Won't Start
```bash
# Kill existing processes
npx kill-port 3000
# Start fresh
npm run dev
```

## Technical Details

### Conversion Rules

The system intelligently:

1. **Detects** raw C++ vs already-traced code
2. **Adds** `#include "tracer.hpp"` if missing
3. **Wraps** `int x = value;` → `TRACE_INT(x, value);`
4. **Tracks** loop iterations with TRACE_INT
5. **Monitors** function entry/exit with TRACK_FUNCTION_ENTRY/EXIT

### API Endpoint

```
POST /api/trace
Content-Type: application/json

{
  "code": "your C++ algorithm here"
}

Response:
{
  "success": true,
  "trace": [
    {"type":"var_declare","step_id":1,...},
    {"type":"line","step_id":2,...},
    ...
  ]
}
```

### Trace Output Format

```json
{"type":"var_declare","step_id":1,"var":"area_max","value":0}
{"type":"var_declare","step_id":2,"var":"i","value":0}
{"type":"line","step_id":3,"line":14}
{"type":"var_declare","step_id":4,"var":"current_height","value":1}
```

## For Power Users

### Manual Conversion

If auto-conversion doesn't work perfectly:

```bash
python lib/cpp/tracer-converter.py convert your_code.cpp output.cpp
```

### Use Templates

Pre-built templates for common algorithms:

```bash
python lib/cpp/tracer-converter.py template searching
python lib/cpp/tracer-converter.py template sorting
python lib/cpp/tracer-converter.py template map
python lib/cpp/tracer-converter.py template recursion
```

### Interactive Mode

```bash
python lib/cpp/tracer-converter.py interactive
```

## Performance

- **Conversion**: < 200ms
- **Compilation**: < 500ms
- **Execution**: < 100ms (typical)
- **Total**: < 1 second end-to-end

## Examples

Try these LeetCode problems:

1. **Container with Most Water** - Two pointer
2. **Two Sum** - Hash map
3. **Merge Sorted Array** - Array manipulation
4. **Valid Parentheses** - Stack simulation
5. **Binary Search** - Searching

## Next Steps

1. ✅ Open http://localhost:3000
2. ✅ Paste your favorite algorithm
3. ✅ Click "Auto-Trace & Visualize"
4. ✅ Watch it animate!

---

**That's it!** No complicated setups. Just code + visualization.

