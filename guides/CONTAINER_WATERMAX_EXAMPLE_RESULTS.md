# Container with Most Water - Before & After Comparison

## 📊 Results

### Original Code
- **Steps generated:** 1
- **Trace events:** None
- **Visualization:** ❌ Not visible
- **Understanding:** ❌ Black box

### Traced Code
- **Steps generated:** 39
- **Trace events:** ✅ Emitted for every important operation
- **Visualization:** ✅ Fully visualized in AlgoLens
- **Understanding:** ✅ See every decision point

---

## 🔍 What You Can See in Traced Version

### Step 1: Function Entry
```json
{"type":"function_call","step_id":1,"var":"maxArea"}
```
Function `maxArea` starts executing.

### Step 2-4: Initialization
```json
{"type":"var_declare","step_id":2,"var":"area_max","value":0}
{"type":"var_declare","step_id":3,"var":"i","value":0}
{"type":"var_declare","step_id":4,"var":"j","value":8}
```
All initial variables set up and visible.

### Step 5: First Iteration
```json
{"type":"line","step_id":5,"line":14}
```
Entering loop body.

### Step 6-8: Calculate Current State
```json
{"type":"var_declare","step_id":6,"var":"current_height","value":1}
{"type":"var_declare","step_id":7,"var":"current_width","value":8}
{"type":"var_declare","step_id":8,"var":"current_area","value":8}
```
**Visualize:** See width=8, height=1, area=8 calculated.

### Step 9: Max Update
```json
{"type":"var_declare","step_id":9,"var":"updated_max","value":8}
```
**Visualize:** area_max gets updated to 8.

### Steps 10-14: Second Iteration
```json
{"type":"var_declare","step_id":11,"var":"current_height","value":7}
{"type":"var_declare","step_id":12,"var":"current_width","value":7}
{"type":"var_declare","step_id":13,"var":"current_area","value":49}
{"type":"var_declare","step_id":14,"var":"updated_max","value":49}
```
**Visualize:** See it find a BETTER area (49)!

### ... (Continue through all iterations)

### Final: Function Return
```json
{"type":"function_return","step_id":39,"line":36}
```
Function exits with result = 49.

---

## 🎬 What the Visualizer Shows

### Variable Panel (Left Side)
```
Local Variables
─────────────────────────
area_max:        49 ✨
i:               4
j:               4
current_height:  4
current_width:   1
current_area:    4
updated_max:     49
```

All variables shown in real-time, highlighted when changed!

### Step Player (Top)
```
⏮ ⏭ ▶︎ ⏸
Step 15 / 39 [==========→     ] 38%
```

Scrub through all 39 steps to see algorithm progression!

---

## 💡 Key Insights You Can Learn

From the trace, you can see:

1. **Two pointers converge:** Watch `i` go 0→1→2→3→4 and `j` go 8→7→6→5→4
2. **Area calculations:** See each width × height calculation
3. **When max updates:** Exactly when area_max changes from 8 → 49
4. **Algorithm logic:** Understand why it picks left or right pointer to move
5. **Convergence:** Both pointers meet at i=4, j=4

---

## 🚀 Usage in AlgoLens

### Copy the traced code:
```cpp
// From: example_11_traced.cpp
#include <iostream>
#include <vector>
#include "tracer.hpp"
using namespace std;

int maxArea(vector<int>& height) {
    TRACK_FUNCTION_ENTRY("maxArea");
    
    TRACE_INT(area_max, 0);
    TRACE_INT(i, 0);
    TRACE_INT(j, height.size() - 1);
    
    for(; i != j ;) {
        TRACE_LINE();
        
        TRACE_INT(current_height, min(height[i], height[j]));
        TRACE_INT(current_width, j - i);
        TRACE_INT(current_area, current_width * current_height);
        
        if(current_height == height[i]) {
            if(current_area > area_max) {
                area_max = current_area;
                TRACE_INT(updated_max, area_max);
            }
            i++;
        }
        else {
            if(current_area > area_max) {
                area_max = current_area;
                TRACE_INT(updated_max, area_max);
            }
            j--;
        }
    }
    
    TRACK_FUNCTION_EXIT();
    return area_max;
}

int main() {
    vector<int> height = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    cout << maxArea(height) << endl;
    return 0;
}
```

### Paste into AlgoLens Editor
1. Go to http://localhost:3000
2. Clear the default code
3. Paste the traced code above
4. Click **"Run & Visualize"**
5. Use step player to walk through algorithm

---

## 📈 Conversion Pattern Applied

This is the **Two-Pointer Pattern** conversion:

```
┌─ Original Code
│  └─ Hidden calculations with complex expressions
│
├─ Add Tracer Header
│  └─ #include "tracer.hpp"
│
├─ Track Pointers
│  └─ TRACE_INT(i, 0), TRACE_INT(j, end)
│
├─ Mark Loop Iterations
│  └─ TRACE_LINE() at start of loop
│
├─ Break Expressions
│  └─ Extract height, width, area into separate traced variables
│
└─ Track State Changes
   └─ TRACE_INT(updated_max, area_max) when max updates
```

---

## ✨ Key Changes Made

| Section | Before | After |
|---------|--------|-------|
| **Header** | None | + `#include "tracer.hpp"` |
| **Function** | None | + `TRACK_FUNCTION_ENTRY/EXIT` |
| **Pointers** | `int i; int j;` | `TRACE_INT(i, 0); TRACE_INT(j, ...);` |
| **Loop** | Hidden logic | + `TRACE_LINE()` to mark iterations |
| **Calculations** | One-liners | Broken into: height, width, area |
| **Updates** | Silent | + `TRACE_INT(updated_max, ...)` on change |

---

## 🎯 Steps Breakdown

```
Step 1:     Function entry
Step 2-4:   Initialize i, j, area_max
Step 5:     Loop iteration 1 starts
Step 6-8:   Calculate height=1, width=8, area=8
Step 9:     Update max to 8
Step 10:    Advance i to 1
Step 11:    Loop iteration 2 starts
Step 12-14: Calculate height=7, width=7, area=49
Step 15:    Update max to 49 ← BEST AREA FOUND!
Step 16:    Advance j to 7
... (continue for each iteration)
Step 37-39: Final iteration, function exit
```

---

## 🔧 How to Create This for Your Own Code

### Three methods:

#### Method 1: Use Templates
```bash
python tracer-converter.py template searching
```
(Two-pointer problems are similar to searching)

#### Method 2: Use Automated Script
```bash
python tracer-converter.py convert your_code.cpp
```

#### Method 3: Follow the Pattern Manually
Apply the rules in `AUTOMATED_CONVERSION_GUIDE.md`

---

## 🎓 Learning Outcomes

After visualizing this traced version, you understand:

✅ How two-pointer algorithm moves pointers  
✅ When and why the maximum is updated  
✅ The convergence behavior (both pointers meet)  
✅ Time complexity: O(n) single pass through array  
✅ Space complexity: O(1) only a few variables  

---

## 📂 Files

- **Original:** `examples/example_11.cpp` (1 step, not useful)
- **Traced:** `examples/example_11_traced.cpp` (39 steps, fully visualized)
- **Comparison:** `guides/CONVERSION_EXAMPLE_Container_with_Most_Water.md`

---

## 💬 Next Steps

1. **Test it:** Paste the traced code into AlgoLens
2. **Explore:** Step through and watch the algorithm work
3. **Apply pattern:** Convert your own two-pointer problems
4. **Automate:** Use `tracer-converter.py` to speed up process

---

**Result:** From a black-box 1-step trace to a fully visualized 39-step walkthrough! 🚀
