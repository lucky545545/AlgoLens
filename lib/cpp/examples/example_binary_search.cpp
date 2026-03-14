// EXAMPLE: Binary Search with Recursion Tracing
// Shows how function calls and recursion are visualized

#include <iostream>
#include <vector>
#include "tracer.hpp"

using namespace std;

int binary_search_recursive(vector<int>& arr, int target, int left, int right) {
    TRACK_FUNCTION_ENTRY("binary_search_recursive");
    
    TRACE_INT(mid, 0);
    TRACE_INT(comparisons, 0);
    
    cout << "{\"type\":\"search_step\",\"left\":" << left << ",\"right\":" << right 
         << ",\"target\":" << target << "}\n";
    
    if (left > right) {
        cout << "{\"type\":\"search_not_found\"}\n";
        TRACK_FUNCTION_EXIT();
        return -1;
    }
    
    mid = left + (right - left) / 2;
    comparisons++;
    
    TRACE_LINE();
    cout << "{\"type\":\"compare\",\"mid\":" << mid << ",\"value\":" << arr[mid] 
         << ",\"target\":" << target << "}\n";
    
    if (arr[mid] == target) {
        cout << "{\"type\":\"search_found\",\"index\":" << mid << ",\"comparisons\":" 
             << comparisons << "}\n";
        TRACK_FUNCTION_EXIT();
        return mid;
    } else if (arr[mid] > target) {
        cout << "{\"type\":\"search_narrowed\",\"direction\":\"left\"}\n";
        TRACK_FUNCTION_EXIT();
        return binary_search_recursive(arr, target, left, mid - 1);
    } else {
        cout << "{\"type\":\"search_narrowed\",\"direction\":\"right\"}\n";
        TRACK_FUNCTION_EXIT();
        return binary_search_recursive(arr, target, mid + 1, right);
    }
}

int binary_search(vector<int>& arr, int target) {
    TRACK_FUNCTION_ENTRY("binary_search");
    
    TRACE_INT(result, 0);
    result = binary_search_recursive(arr, target, 0, arr.size() - 1);
    
    TRACK_FUNCTION_EXIT();
    return result;
}

int main() {
    // Sorted array (required for binary search)
    vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78};
    
    cout << "Array: ";
    for (int x : arr) cout << x << " ";
    cout << "\n";
    
    // Search cases
    TRACE_INT(target1, 23);
    TRACE_INT(found1, binary_search(arr, target1));
    
    TRACE_INT(target2, 100);
    TRACE_INT(found2, binary_search(arr, target2));
    
    cout << "Search for " << target1 << " -> " << found1 << "\n";
    cout << "Search for " << target2 << " -> " << found2 << "\n";
    
    return 0;
}

/*
VISUALIZATION FEATURES DEMONSTRATED:

1. Recursion Tracking:
   - Call stack grows as you recurse deeper
   - Call stack shrinks on return
   - Visualize the recursion tree

2. Variable State:
   - left, right, mid change at each level
   - target remains constant
   - comparisons could be tracked globally

3. Algorithm Flow:
   - Binary search narrows search space
   - Each recursive call halves the search space
   - Found or not found terminal state

4. Test Cases:
   - Finding existing element (23)
   - Finding non-existent element (100)
   - Watch how call stack differs based on target location

TRY MODIFYING:
- Change target values
- Add more test cases
- Track comparison count globally
- Visualize the eliminated regions
*/
