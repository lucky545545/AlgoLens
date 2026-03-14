# Automating C++ Solution to Tracer Conversion

Guide to converting normal C++ solutions into traced versions automatically.

---

## Quick Start

### Option 1: Use the Python Converter Tool

```bash
# Navigate to lib/cpp directory
cd lib/cpp

# Convert a file
python tracer-converter.py convert solution.cpp traced_solution.cpp

# View template for your algorithm type
python tracer-converter.py template sorting
python tracer-converter.py template map
python tracer-converter.py template recursion

# Interactive mode
python tracer-converter.py interactive
```

### Option 2: Use Templates

Copy a template that matches your algorithm type and modify it:

```bash
python tracer-converter.py template <type>
```

Available types: `sorting`, `searching`, `map`, `recursion`

### Option 3: Manual Conversion (Best for Understanding)

Follow the checklist in section "Manual Conversion Guide"

---

## Approach 1: Automated Script Conversion

### What the Script Does

✅ Adds `#include "tracer.hpp"` automatically  
✅ Converts `for` loops to use `TRACE_INT` counters  
✅ Wraps function bodies with `TRACK_FUNCTION_ENTRY/EXIT`  
✅ Converts variable declarations to `TRACE_INT`/`TRACE_VAR`  
✅ Identifi variable dependencies  

### Usage Examples

#### Convert a single file:
```bash
python tracer-converter.py convert my_solution.cpp
```

Output shows converted code. To save:
```bash
python tracer-converter.py convert my_solution.cpp traced_solution.cpp
```

#### View template for your algorithm type:
```bash
# For sorting algorithm
python tracer-converter.py template sorting

# For map-based algorithm (frequency counter)
python tracer-converter.py template map

# For recursion
python tracer-converter.py template recursion
```

#### Interactive mode (guided steps):
```bash
python tracer-converter.py interactive
```

---

## Approach 2: Template-Based Conversion

### Pre-built Templates Available

Each template is a complete working example you can modify.

#### 1. Sorting Template
```cpp
#include <vector>
#include "tracer.hpp"
using namespace std;

void bubble_sort(vector<int>& arr) {
    TRACK_FUNCTION_ENTRY("bubble_sort");
    
    for (TRACE_INT(i, 0); i < arr.size() - 1; i++) {
        for (TRACE_INT(j, 0); j < arr.size() - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
    
    TRACK_FUNCTION_EXIT();
}
```

#### 2. Map-Based Template
```cpp
#include <unordered_map>
#include <vector>
#include "tracer.hpp"
using namespace std;

int frequency_counter(vector<int>& nums) {
    TRACK_FUNCTION_ENTRY("frequency_counter");
    
    unordered_map<int, int> freq;
    TRACE_UNORDERED_MAP_CHANGE(freq, freq);
    
    for (TRACE_INT(i, 0); i < nums.size(); i++) {
        freq[nums[i]]++;
        TRACE_UNORDERED_MAP_CHANGE(freq, freq);
    }
    
    TRACK_FUNCTION_EXIT();
    return 0;
}
```

#### 3. Recursion Template
```cpp
#include "tracer.hpp"
using namespace std;

int fibonacci(int n) {
    TRACK_FUNCTION_ENTRY("fibonacci");
    
    if (n <= 1) {
        TRACK_FUNCTION_EXIT();
        return n;
    }
    
    TRACE_INT(result, fibonacci(n-1) + fibonacci(n-2));
    TRACK_FUNCTION_EXIT();
    return result;
}
```

### How to Use Templates

1. **Get the template:**
   ```bash
   python tracer-converter.py template map > template.cpp
   ```

2. **Replace the core algorithm:**
   - Keep the tracer macros structure
   - Replace the algorithm logic with your code

3. **Add extra traces** for:
   - Important variables
   - Array modifications
   - Map operations

---

## Approach 3: Pattern-Based Rules

Apply these rules to convert your code manually.

### Rule 1: Function Entry/Exit
```cpp
// Before
int fibonacci(int n) {
    if (n <= 1) return 1;
    return fibonacci(n-1) + fibonacci(n-2);
}

// After
int fibonacci(int n) {
    TRACK_FUNCTION_ENTRY("fibonacci");  // ← Add this
    if (n <= 1) {
        TRACK_FUNCTION_EXIT();          // ← Add this before return
        return 1;
    }
    TRACE_INT(result, fibonacci(n-1) + fibonacci(n-2));
    TRACK_FUNCTION_EXIT();              // ← Add this before return
    return result;
}
```

### Rule 2: Variable Declarations
```cpp
// Before
int sum = 0;
vector<int> arr;

// After
TRACE_INT(sum, 0);                    // ← Trace integers
TRACE_UNORDERED_MAP_CHANGE(mp, mp);   // ← Trace maps
```

### Rule 3: Loop Counters
```cpp
// Before
for (int i = 0; i < n; i++) {

// After
for (TRACE_INT(i, 0); i < n; i++) {
```

### Rule 4: Map Operations
```cpp
// Before
freq[num]++;

// After
freq[num]++;
TRACE_UNORDERED_MAP_CHANGE(freq, freq);  // ← Add after modification
```

### Rule 5: Array Operations
```cpp
// Before
swap(arr[j], arr[j+1]);

// After
swap(arr[j], arr[j+1]);
TRACE_LINE();  // Mark array operation
// Or emit: cout << "{\"type\":\"array_change\",...}\n";
```

---

## Workflow: Step-by-Step Process

### Step 1: Prepare Your Code
```cpp
// Input: solution.cpp
int solution(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return i;
        }
        seen[nums[i]] = i;
    }
    
    return -1;
}
```

### Step 2: Run Converter
```bash
python tracer-converter.py convert solution.cpp traced.cpp
```

### Step 3: Review & Enhance
The converter creates a basic version. Now add:
- Array state emissions if needed
- Important trace points
- Specific variable tracking

### Step 4: Compile & Test
```bash
g++ -std=c++17 -I. -o traced traced.cpp
./traced < test_input.txt
```

---

## Decision Tree: Which Approach?

```
┌─ Do you want full automation?
│  ├─ YES → Use Python script (Approach 1)
│  └─ NO → Continue below
│
├─ Do you have similar code before?
│  ├─ YES → Use template as base (Approach 2)
│  └─ NO → Continue below
│
├─ Is your code simple (<50 lines)?
│  ├─ YES → Manual rules (Approach 3)
│  └─ NO → Use Python script
│
└─ Default: Start with template + script
```

---

## Common Patterns & Their Traces

### Pattern 1: Two Sum (Map-based)
```cpp
// Input code
unordered_map<int, int> seen;
for (int i = 0; i < nums.size(); i++) {
    if (seen.count(target - nums[i])) {
        return {seen[target - nums[i]], i};
    }
    seen[nums[i]] = i;
}

// Traced version
unordered_map<int, int> seen;
TRACE_UNORDERED_MAP_CHANGE(seen, seen);  // Track empty map

for (TRACE_INT(i, 0); i < nums.size(); i++) {
    TRACE_INT(complement, target - nums[i]);
    if (seen.count(complement)) {
        return {seen[complement], i};
    }
    seen[nums[i]] = i;
    TRACE_UNORDERED_MAP_CHANGE(seen, seen);  // After each insert
}
```

### Pattern 2: Sorting (Array)
```cpp
// Input code
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            swap(arr[j], arr[j + 1]);
        }
    }
}

// Traced version
for (TRACE_INT(i, 0); i < n; i++) {
    for (TRACE_INT(j, 0); j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            swap(arr[j], arr[j + 1]);
            // Emit array state
            cout << "{\"type\":\"array_change\",\"var\":\"arr\"}\n";
        }
    }
}
```

### Pattern 3: Recursion
```cpp
// Input code
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

// Traced version
int fibonacci(int n) {
    TRACK_FUNCTION_ENTRY("fibonacci");
    
    if (n <= 1) {
        TRACK_FUNCTION_EXIT();
        return n;
    }
    
    TRACE_INT(result, fibonacci(n-1) + fibonacci(n-2));
    TRACK_FUNCTION_EXIT();
    return result;
}
```

### Pattern 4: Sliding Window
```cpp
// Input code
int left = 0;
for (int right = 0; right < n; right++) {
    window[arr[right]]++;
    
    while (window.size() > k) {
        window[arr[left]]--;
        if (window[arr[left]] == 0) window.erase(arr[left]);
        left++;
    }
}

// Traced version
TRACE_INT(left, 0);
for (TRACE_INT(right, 0); right < n; right++) {
    window[arr[right]]++;
    TRACE_UNORDERED_MAP_CHANGE(window, window);
    
    while (window.size() > k) {
        window[arr[left]]--;
        if (window[arr[left]] == 0) window.erase(arr[left]);
        TRACE_UNORDERED_MAP_CHANGE(window, window);
        left++;
    }
}
```

---

## Manual Conversion Checklist

Use this if you need full control:

- [ ] Add `#include "tracer.hpp"` at top
- [ ] Declare function name constant
- [ ] Add `TRACK_FUNCTION_ENTRY("func_name");` at start
- [ ] Replace `int i` with `TRACE_INT(i, init_val)` in loops
- [ ] Add `TRACE_INT(var, init)` for important variables
- [ ] Add `TRACE_UNORDERED_MAP_CHANGE(name, name)` after map ops
- [ ] Add `TRACE_MAP_CHANGE(name, name)` for std::map
- [ ] Add `TRACE_LINE();` for key points
- [ ] Add `TRACK_FUNCTION_EXIT();` before each return
- [ ] Handle recursive calls with `TRACK_FUNCTION_ENTRY/EXIT`
- [ ] Test: `g++ -std=c++17 -I. -o output code.cpp`
- [ ] Run and check JSON output

---

## Troubleshooting

### Issue: Script converts but code doesn't compile
**Solution:**
1. Check that `tracer.hpp` is in the path
2. Verify macro syntax
3. Run: `g++ -std=c++17 -I. -o test test.cpp`
4. Fix errors in generated code

### Issue: Some variables not traced
**Solution:**
1. Add manual `TRACE_VAR()` calls
2. Check variable declaration pattern
3. Use template as reference

### Issue: Map operations not showing
**Solution:**
1. Verify `TRACE_UNORDERED_MAP_CHANGE()` added after each operation
2. Check map is still in scope
3. Verify JSON output has `"type":"map_change"`

### Issue: Too many trace points
**Solution:**
1. Comment out less important traces
2. Trace only key variables
3. Use selective tracing

---

## Best Practices

### ✅ DO
- Use templates as starting point for similar algorithms
- Trace before and after key operations
- Keep trace macros on separate lines (easier to remove)
- Test incrementally (compile after each change)

### ❌ DON'T
- Trace every single variable (creates clutter)
- Put trace macros inside complex expressions
- Forget `TRACK_FUNCTION_EXIT()` before returns
- Mix traced and non-traced functions in the same file

---

## Advanced: Creating Custom Conversion Rules

To extend the Python script:

```python
# Add new pattern in TracerConverter class
def _convert_sliding_window(self, line: str) -> str:
    """Custom conversion for sliding window pattern."""
    if 'left' in line and 'right' in line:
        # Add sliding window trace logic
        return self._add_window_traces(line)
    return line
```

---

## Quick Reference: Tracer Macros

```cpp
// Variables
TRACE_INT(name, value);              // int variable
TRACE_VAR(type, name, value);        // any type

// Functions
TRACK_FUNCTION_ENTRY("name");        // At function start
TRACK_FUNCTION_EXIT();               // Before return

// Maps
TRACE_UNORDERED_MAP_CHANGE(n, m);    // After map modification
TRACE_MAP_CHANGE(n, m);              // For std::map

// Lines
TRACE_LINE();                        // Mark important line
__emit_event__(type, line, var, val); // Custom event
```

---

## Example: Converting LeetCode Solution

### Original (LeetCode)
```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (mp.count(complement)) {
                return {mp[complement], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};
```

### Converted (Traced)
```cpp
#include "tracer.hpp"

vector<int> twoSum(vector<int>& nums, int target) {
    TRACK_FUNCTION_ENTRY("twoSum");
    
    unordered_map<int, int> mp;
    TRACE_UNORDERED_MAP_CHANGE(mp, mp);
    
    for (TRACE_INT(i, 0); i < nums.size(); i++) {
        TRACE_INT(complement, target - nums[i]);
        
        if (mp.count(complement)) {
            TRACK_FUNCTION_EXIT();
            return {mp[complement], i};
        }
        
        mp[nums[i]] = i;
        TRACE_UNORDERED_MAP_CHANGE(mp, mp);
    }
    
    TRACK_FUNCTION_EXIT();
    return {};
}
```

---

## Next Steps

1. **Try the converter:**
   ```bash
   python tracer-converter.py interactive
   ```

2. **Pick a template:** Get one matching your algorithm type

3. **Start with a small example:** Convert a simple 20-line solution first

4. **Test & verify:** Compile and check JSON output

5. **Enhance manually:** Add extra traces as needed

**Happy tracing!** 🎉
