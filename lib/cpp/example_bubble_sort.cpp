// EXAMPLE: Bubble Sort with Full Tracing
// This is a complete working example you can run in AlgoLens

#include <iostream>
#include <vector>
#include "tracer.hpp"

using namespace std;

void bubble_sort(vector<int>& arr) {
    TRACK_FUNCTION_ENTRY("bubble_sort");
    
    int n = arr.size();
    TRACE_INT(comparisons, 0);
    TRACE_INT(swaps, 0);
    
    // Emit initial array state
    cout << "{\"type\":\"array_declare\",\"step_id\":0,\"line\":" << __LINE__ 
         << ",\"var\":\"arr\",\"value\":\"[";
    for (int i = 0; i < arr.size(); i++) {
        cout << arr[i];
        if (i < arr.size() - 1) cout << ",";
    }
    cout << "]\"}\n";
    
    // Outer loop - number of passes
    for (TRACE_INT(i, 0); i < n - 1; i++) {
        TRACE_LINE();
        TRACE_INT(swapped, 0);
        
        // Inner loop - comparisons in current pass
        for (TRACE_INT(j, 0); j < n - i - 1; j++) {
            TRACE_LINE();
            comparisons++;
            
            // Compare adjacent elements
            if (arr[j] > arr[j + 1]) {
                swaps++;
                TRACE_LINE();
                
                // Swap
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = 1;
                
                // Emit array state after swap
                cout << "{\"type\":\"array_change\",\"step_id\":" << (__LINE__) 
                     << ",\"line\":" << __LINE__ 
                     << ",\"function\":\"bubble_sort\",\"var\":\"arr\",\"swap\":{\"i\":" << j 
                     << ",\"j\":" << (j + 1) << "},\"value\":\"[";
                for (int k = 0; k < arr.size(); k++) {
                    cout << arr[k];
                    if (k < arr.size() - 1) cout << ",";
                }
                cout << "]\"}\n";
            }
        }
        
        // Early exit if no swaps occurred
        if (!swapped) break;
    }
    
    cout << "{\"type\":\"sort_complete\",\"comparisons\":" << comparisons 
         << ",\"swaps\":" << swaps << "}\n";
    
    TRACK_FUNCTION_EXIT();
}

int main() {
    // Input array - modify this to test different cases
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    
    bubble_sort(arr);
    
    // Print sorted array
    cout << "Sorted: ";
    for (int x : arr) {
        cout << x << " ";
    }
    cout << endl;
    
    return 0;
}

/*
TEST CASES:

1. Basic: {5, 2, 8, 1}
   Expected: {1, 2, 5, 8}

2. Already sorted: {1, 2, 3, 4, 5}
   Expected: {1, 2, 3, 4, 5} (fast, early exit)

3. Reverse sorted: {5, 4, 3, 2, 1}
   Expected: {1, 2, 3, 4, 5} (worst case)

4. Duplicates: {3, 1, 3, 1}
   Expected: {1, 1, 3, 3}

When you run this:
1. Watch the array elements swap positions
2. See comparisons and swaps counters increment
3. Use the step player to slow down and see each operation
4. Try different inputs to see performance differences
*/
