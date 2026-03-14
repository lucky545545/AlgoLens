# Map/Unordered_Map Visualization Guide

This guide explains how to use the new map and unordered_map visualization features in AlgoLens.

## Overview

The AlgoLens visualization system now supports real-time tracking and visualization of `std::map` and `std::unordered_map` changes. Each modification to your maps (insertion, deletion, value updates) is automatically captured and displayed as an interactive table in the visualizer.

## Quick Start

### Step 1: Include the tracer header
```cpp
#include "tracer.hpp"
```

### Step 2: Declare your map
```cpp
unordered_map<int, int> freq;
```

### Step 3: Track map changes
```cpp
// After any map modification, call:
TRACE_UNORDERED_MAP_CHANGE(freq, freq);
```

## Available Macros

### For unordered_map:

**Basic change tracking:**
```cpp
TRACE_UNORDERED_MAP_CHANGE(variable_name, map_object)
```
- Call this after any map modification (insert, erase, update)
- Example: `TRACE_UNORDERED_MAP_CHANGE(freq, freq);`

**Convenience macros for common operations:**
```cpp
TRACE_UNORDERED_MAP_INSERT(variable_name, map_obj, key, value)
// Automatically inserts and traces
// Example: TRACE_UNORDERED_MAP_INSERT(freq, freq_map, 5, 10);

TRACE_UNORDERED_MAP_ERASE(variable_name, map_obj, key)
// Automatically erases and traces
// Example: TRACE_UNORDERED_MAP_ERASE(freq, freq_map, 5);
```

### For std::map:

**Basic change tracking:**
```cpp
TRACE_MAP_CHANGE(variable_name, map_object)
```
- Same behavior as unordered_map but for ordered maps

**Convenience macros:**
```cpp
TRACE_MAP_INSERT(variable_name, map_obj, key, value)
TRACE_MAP_ERASE(variable_name, map_obj, key)
```

## Complete Examples

### Example 1: Frequency Counter
```cpp
#include <iostream>
#include <unordered_map>
#include <vector>
#include "tracer.hpp"
using namespace std;

int frequencyCounter(vector<int>& nums) {
    TRACK_FUNCTION_ENTRY("frequencyCounter");
    
    unordered_map<int, int> freq;
    TRACE_UNORDERED_MAP_CHANGE(freq, freq);  // Track initial empty map
    
    TRACE_INT(maxFreq, 0);
    TRACE_INT(maxNum, 0);
    
    for (TRACE_INT(i, 0); i < nums.size(); i++) {
        TRACE_LINE();
        
        freq[nums[i]]++;
        TRACE_UNORDERED_MAP_CHANGE(freq, freq);  // Track after increment
        
        if (freq[nums[i]] > maxFreq) {
            maxFreq = freq[nums[i]];
            maxNum = nums[i];
        }
    }
    
    TRACK_FUNCTION_EXIT();
    return maxFreq;
}

int main() {
    vector<int> nums = {1, 1, 1, 2, 2, 3};
    frequencyCounter(nums);
    return 0;
}
```

**What you'll see in the visualizer:**
- A table showing the `freq` map
- Each row represents a number and its count
- Animation when values change
- Highlighting of recently modified entries

### Example 2: Two Sum with Map
```cpp
bool twoSum(vector<int>& nums, int target) {
    TRACK_FUNCTION_ENTRY("twoSum");
    
    unordered_map<int, int> seen;
    TRACE_UNORDERED_MAP_CHANGE(seen, seen);
    
    for (TRACE_INT(i, 0); i < nums.size(); i++) {
        TRACE_LINE();
        
        int complement = target - nums[i];
        
        if (seen.find(complement) != seen.end()) {
            cout << "Found pair: " << complement << " + " << nums[i] << endl;
            TRACK_FUNCTION_EXIT();
            return true;
        }
        
        seen[nums[i]]++;
        TRACE_UNORDERED_MAP_CHANGE(seen, seen);  // Track after addition
    }
    
    TRACK_FUNCTION_EXIT();
    return false;
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    twoSum(nums, 9);
    return 0;
}
```

### Example 3: Sliding Window with Map
```cpp
int maxConsecutiveWithKDistinct(vector<int>& arr, int k) {
    TRACK_FUNCTION_ENTRY("maxConsecutiveWithKDistinct");
    
    unordered_map<int, int> window;
    TRACE_UNORDERED_MAP_CHANGE(window, window);
    
    TRACE_INT(maxLen, 0);
    TRACE_INT(left, 0);
    
    for (TRACE_INT(right, 0); right < arr.size(); right++) {
        TRACE_LINE();
        
        window[arr[right]]++;
        TRACE_UNORDERED_MAP_CHANGE(window, window);
        
        // Shrink window if we have more than k distinct elements
        while ((int)window.size() > k) {
            TRACE_LINE();
            
            window[arr[left]]--;
            if (window[arr[left]] == 0) {
                window.erase(arr[left]);
            }
            TRACE_UNORDERED_MAP_CHANGE(window, window);
            
            left++;
        }
        
        int windowSize = right - left + 1;
        maxLen = max(maxLen, windowSize);
    }
    
    TRACK_FUNCTION_EXIT();
    return maxLen;
}
```

## Visualization Features

### Map Display Table
- **Key Column**: Shows all keys in the map (sorted numerically)
- **Value Column**: Shows the corresponding values
- **Size Indicator**: Displays total number of entries
- **Highlighting**: Recently modified entries are highlighted in yellow
- **Animation**: Values scale and fade to indicate changes

### Timeline Stepping
- Use the step player to move through each map modification
- Each step shows the exact state of all maps/arrays/variables
- Navigate one step at a time to see the algorithm's behavior

### Integration with Other Visualization Elements
- Maps appear alongside arrays in the "Memory State" section
- Local variables panel shows primitive values
- Call stack remains visible for context
- All elements update synchronously

## Best Practices

### 1. Track every modification
```cpp
// ❌ Wrong - changes not tracked
mp[key]++;

// ✅ Correct - changes tracked
mp[key]++;
TRACE_UNORDERED_MAP_CHANGE(mp, mp);
```

### 2. Use convenience macros for clarity
```cpp
// ❌ More verbose
mp[key] = value;
TRACE_UNORDERED_MAP_CHANGE(mp, mp);

// ✅ Clearer intent
TRACE_UNORDERED_MAP_INSERT(mp, mp, key, value);
```

### 3. Track at algorithm checkpoints
```cpp
for (int i = 0; i < n; i++) {
    mp[nums[i]]++;
    
    // Only trace after meaningful operation
    TRACE_UNORDERED_MAP_CHANGE(mp, mp);
    
    if (mp.size() > k) {
        mp[nums[j]]--;
        if (mp[nums[j]] == 0) {
            mp.erase(nums[j]);
        }
        TRACE_UNORDERED_MAP_CHANGE(mp, mp);
    }
}
```

### 4. Combine with function tracking
```cpp
int algorithm(vector<int>& nums) {
    TRACK_FUNCTION_ENTRY("algorithm");
    
    unordered_map<int, int> freq;
    TRACE_UNORDERED_MAP_CHANGE(freq, freq);
    
    // Your code here
    
    TRACK_FUNCTION_EXIT();
    return result;
}
```

## Supported Key/Value Types

Currently, the visualization supports:
- **Keys**: `int`, and `char` (converted to int internally)
- **Values**: `int`

For other types, you can:
1. Cast them to int for visualization
2. Emit custom JSON events manually
3. Create custom tracer macros for your types

## Limitations & Workarounds

### Limitation 1: String keys visualization
```cpp
// Currently not well-supported in visualization
unordered_map<string, int> wordCount;

// Workaround: Use numeric keys with a separate mapping
unordered_map<int, int> freq;  // Use this for visualization
TRACE_UNORDERED_MAP_CHANGE(freq, freq);
```

### Limitation 2: Complex nested structures
```cpp
// Not supported: nested maps
map<int, map<int, int>> complex;

// Workaround: Track separately or emit custom events
cout << "{\"type\":\"custom_event\",\"data\":...}\n";
```

### Limitation 3: Memory-intensive operations
```cpp
// Large maps (>1000 entries) may impact performance
// Workaround: Sample or batch trace operations
if (iterations % 100 == 0) {
    TRACE_UNORDERED_MAP_CHANGE(largemap, largemap);
}
```

## Common Patterns

### Pattern 1: Frequency Counting
```cpp
unordered_map<int, int> freq;
for (int num : nums) {
    freq[num]++;
    TRACE_UNORDERED_MAP_CHANGE(freq, freq);
}
```

### Pattern 2: Sliding Window
```cpp
unordered_map<int, int> window;
int left = 0;

for (int right = 0; right < n; right++) {
    window[arr[right]]++;
    TRACE_UNORDERED_MAP_CHANGE(window, window);
    
    while (window.size() > k) {
        window[arr[left]]--;
        if (window[arr[left]] == 0) {
            window.erase(arr[left]);
        }
        TRACE_UNORDERED_MAP_CHANGE(window, window);
        left++;
    }
}
```

### Pattern 3: Complement Lookup
```cpp
unordered_map<int, int> seen;
for (int num : nums) {
    int complement = target - num;
    if (seen.find(complement) != seen.end()) {
        // Found pair
    }
    seen[num]++;
    TRACE_UNORDERED_MAP_CHANGE(seen, seen);
}
```

## Troubleshooting

### Maps not appearing in visualizer
- Ensure you called `TRACE_UNORDERED_MAP_CHANGE()` at least once
- Check that the map has at least one entry before the step you're viewing
- Verify JSON output is valid (check console for parsing errors)

### Changes not showing up
- Make sure to call trace macro after the modification
- Check that the map object is not going out of scope
- Verify the map variable name matches in all trace calls

### Highlighting not working
- This is a visualization-only feature
- The highlighting shows which keys/values changed most recently
- It should activate automatically when comparing steps

## Performance Considerations

- **Tracing overhead**: Minimal (JSON serialization of map)
- **Memory usage**: Proportional to map size
- **Latency**: Negligible for maps up to 10,000 entries
- **Best for**: Algorithms with frequent but focused map operations

## Example Algorithms

The `example_map_visualization.cpp` file includes complete working examples of:
1. Frequency Counter
2. Two Sum
3. Sliding Window with K Distinct Elements
4. Character Frequency Analysis

Run any of these examples to see the map visualization in action!
