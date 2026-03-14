# Container with Most Water - Conversion Example

## Problem
Given an array of heights, find two lines that together with the x-axis form a container such that the container holds the most water.

## Original (Non-Traced) Code
```cpp
#include <iostream>
#include <vector>
using namespace std;

int maxArea(vector<int>& height) {
    int area_max = 0;
    int i;
    int j;
    for(i = 0 , j = height.size()-1 ; i!=j ;){
        if(min(height[i],height[j]) == height[i]){
            if((j-i)*height[i] > area_max){
                area_max = (j-i)*height[i];
            }
            i++;
        }
        else{
            if((j-i)*height[j] > area_max){
                area_max = (j-i)*height[j];
            }
            j--;
        }
    }
    return area_max;
}

int main(){
    vector<int> height = {1,8,6,2,5,4,8,3,7};
    cout<<maxArea(height);
    return 0;
}
```

**Problem with this code:** Only produces 1 step in visualization because no tracer macros are used.

---

## Traced Version (With Tracer Macros)
```cpp
#include <iostream>
#include <vector>
#include "tracer.hpp"        // ← Add this
using namespace std;

int maxArea(vector<int>& height) {
    TRACK_FUNCTION_ENTRY("maxArea");      // ← Add this at function start
    
    // Convert variable declarations to TRACE_INT
    TRACE_INT(area_max, 0);               // ← Was: int area_max = 0;
    TRACE_INT(i, 0);                      // ← Was: int i;
    TRACE_INT(j, height.size() - 1);      // ← Was: int j;
    
    for(; i != j ;) {
        TRACE_LINE();  // Mark each loop iteration      ← Add this
        
        // Break down complex expressions into traced variables
        TRACE_INT(current_height, min(height[i], height[j]));
        TRACE_INT(current_width, j - i);
        TRACE_INT(current_area, current_width * current_height);
        
        if(current_height == height[i]) {
            if(current_area > area_max) {
                area_max = current_area;
                TRACE_INT(updated_max, area_max);  // ← Track when max updates
            }
            i++;
        }
        else {
            if(current_area > area_max) {
                area_max = current_area;
                TRACE_INT(updated_max, area_max);  // ← Track when max updates
            }
            j--;
        }
    }
    
    TRACK_FUNCTION_EXIT();                 // ← Add this before return
    return area_max;
}

int main() {
    vector<int> height = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    cout << maxArea(height) << endl;
    return 0;
}
```

---

## What Changed?

### 1. **Added Header**
```cpp
#include "tracer.hpp"
```

### 2. **Function Entry/Exit**
```cpp
TRACK_FUNCTION_ENTRY("maxArea");
// ... function body ...
TRACK_FUNCTION_EXIT();
```

### 3. **Variable Declarations → Traced Variables**
```cpp
// Before
int area_max = 0;
int i;
int j;

// After
TRACE_INT(area_max, 0);
TRACE_INT(i, 0);
TRACE_INT(j, height.size() - 1);
```

### 4. **Loop Iteration Tracking**
```cpp
// Add at start of loop body
TRACE_LINE();
```

### 5. **Break Down Complex Expressions**
```cpp
// Before (hidden calculation)
if((j-i)*height[i] > area_max){
    area_max = (j-i)*height[i];
}

// After (visible steps)
TRACE_INT(current_height, min(height[i], height[j]));
TRACE_INT(current_width, j - i);
TRACE_INT(current_area, current_width * current_height);

if(current_area > area_max) {
    area_max = current_area;
    TRACE_INT(updated_max, area_max);  // Track update
}
```

---

## Visualization Comparison

### Original Code
```
Step 1: return area_max
↑
Only 1 step - internal calculations hidden
```

### Traced Code
```
Step 1: area_max = 0, i = 0, j = 8
Step 2: current_height = 1, current_width = 8, current_area = 8
Step 3: area_max = 8 (updated)
Step 4: i = 1
Step 5: current_height = 8, current_width = 7, current_area = 56
Step 6: area_max = 56 (updated)
Step 7: j = 7
Step 8: current_height = 3, current_width = 6, current_area = 18
... (continues for each iteration)
```

**Result:** 20+ steps showing the algorithm's progression!

---

## How Many Steps?

Input: `{1,8,6,2,5,4,8,3,7}` with size 9

**Expected iterations:** 8-9 comparisons (until i meets j)

**Steps with tracing:**
- 1 step: initialization (area_max=0, i=0, j=8)
- ~3 steps per iteration (height, width, area calculation + update if needed)
- 8-9 iterations = ~24-27 steps total

**Original:** 1 step  
**Traced:** ~25 steps ✅

---

## Compilation & Testing

### Compile
```bash
cd lib/cpp
g++ -std=c++17 -I. -o example_11_traced examples/example_11_traced.cpp
```

### Run
```bash
./example_11_traced
```

### Expected Output
```
49
```
(Plus JSON trace events on stdout that get parsed by visualizer)

### Run with Console Output
```bash
./example_11_traced 2>&1 | head -20
```

See the JSON events emitted:
```json
{"type":"var_declare","step_id":1,"line":7,"function":"maxArea","var":"area_max","value":0}
{"type":"var_declare","step_id":2,"line":8,"function":"maxArea","var":"i","value":0}
{"type":"var_declare","step_id":3,"line":9,"function":"maxArea","var":"j","value":8}
{"type":"var_declare","step_id":4,"line":13,"function":"maxArea","var":"current_height","value":1}
...
```

---

## Key Insights from This Conversion

✅ **Original was "black box"** - calculations hidden inside expressions  
✅ **Traced version shows work** - each calculation visible  
✅ **Loop is visible** - watch i and j converge  
✅ **Decisions are visible** - see when area_max updates  
✅ **Algorithm logic clear** - understand why i or j moves  

---

## Conversion Pattern Applied Here

This is a **two-pointer algorithm** - the conversion pattern:

1. **Extract loop variables** → `TRACE_INT(i, 0)`, `TRACE_INT(j, end)`
2. **Mark loop iterations** → `TRACE_LINE()`
3. **Break complex expressions** → Separate width, height, area calculations
4. **Track state changes** → Log when max updates
5. **Add function tracking** → Entry/exit markers

Same pattern works for:
- ✅ Two-sum (map-based)
- ✅ Sliding window
- ✅ Binary search
- ✅ Sorting (with array tracking)

---

## Try It Yourself

### In AlgoLens:
```bash
# Navigate to workspace
cd e:\leetvisuals\AlgoLens

# Paste the traced code into AlgoLens visualizer OR

# Compile locally
cd lib/cpp
g++ -std=c++17 -I. -o example_11_traced examples/example_11_traced.cpp
./example_11_traced
```

### Compare:
- **Original:** 1 step (uninteresting)
- **Traced:** 25+ steps (fully visualized)

---

## Next: Automate This Process

Use the converter tool:

```bash
python tracer-converter.py convert original_example_11.cpp
```

The script will:
1. ✅ Add `#include "tracer.hpp"`
2. ✅ Add TRACK_FUNCTION_ENTRY/EXIT
3. ✅ Convert int declarations to TRACE_INT
4. ✅ Mark loop iterations with TRACE_LINE
5. ⚠️ **Manual step**: Add complex expression breakdown (like we did above)

---

## Summary

| Aspect | Original | Traced |
|--------|----------|--------|
| Steps | 1 | ~25 |
| Visibility | None | Full |
| Visualization | Useless | Great! |
| Effort | Minimal | Added 15 lines |
| Understanding | Hard | Easy |

**Result:** The traced version shows exactly what the algorithm is doing at each step! 🎉
