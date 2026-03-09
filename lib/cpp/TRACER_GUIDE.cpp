// AlgoLens C++ Tracer - Complete Guide
// This guide shows how to use the tracing macros in your algorithm code

#include <iostream>
#include <vector>
#include "tracer.hpp"  // Automatically injected

using namespace std;

// Example 1: Simple variable tracking
void example_simple_variables() {
    TRACE_INT(x, 0);           // Declare x as 0, auto-tracked
    TRACE_INT(y, 5);           // Declare y as 5, auto-tracked
    
    x = 10;                     // Change tracked automatically
    y = x + 5;                 // Change tracked automatically
}

// Example 2: Function call tracking with macros
int fibonacci(int n) {
    TRACK_FUNCTION_ENTRY("fibonacci");
    
    if (n <= 1) {
        TRACK_FUNCTION_EXIT();
        return n;
    }
    
    TRACE_INT(result, fibonacci(n - 1) + fibonacci(n - 2));
    TRACK_FUNCTION_EXIT();
    return result;
}

// Example 3: Array operations
void example_array_operations() {
    TRACK_FUNCTION_ENTRY("bubble_sort");
    
    int arr[] = {5, 2, 8, 1, 9};
    int n = 5;
    
    // Emit array declaration
    std::cout << "{\"type\":\"array_declare\",\"line\":" << __LINE__ << ",\"var\":\"arr\",\"value\":\"[5,2,8,1,9]\"}\n";
    
    for (TRACE_INT(i, 0); i < n - 1; i++) {
        for (TRACE_INT(j, 0); j < n - i - 1; j++) {
            TRACE_LINE();  // Track line execution
            
            if (arr[j] > arr[j + 1]) {
                // Emit swap event
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                std::cout << "{\"type\":\"array_change\",\"line\":" << __LINE__ << ",\"var\":\"arr\",\"swap\":{\"i\":" << j << ",\"j\":" << (j+1) << "}}\n";
            }
        }
    }
    
    TRACK_FUNCTION_EXIT();
}

// Example 4: Complex data structures
void example_tree_traversal() {
    struct Node {
        int val;
        Node* left;
        Node* right;
        Node(int v) : val(v), left(nullptr), right(nullptr) {}
    };
    
    TRACK_FUNCTION_ENTRY("tree_traversal");
    
    // Build tree
    Node* root = new Node(1);
    root->left = new Node(2);
    root->right = new Node(3);
    
    // Emit tree structure
    std::cout << "{\"type\":\"structure_created\",\"line\":" << __LINE__ << ",\"structure\":\"tree\",\"root_value\":1}\n";
    
    // Simulate traversal
    TRACE_INT(visited_count, 0);
    
    // In-order traversal
    std::cout << "{\"type\":\"visit_node\",\"line\":" << __LINE__ << ",\"node_id\":1,\"value\":1}\n";
    visited_count = 1;
    
    std::cout << "{\"type\":\"visit_node\",\"line\":" << __LINE__ << ",\"node_id\":2,\"value\":2}\n";
    visited_count = 2;
    
    std::cout << "{\"type\":\"visit_node\",\"line\":" << __LINE__ << ",\"node_id\":3,\"value\":3}\n";
    visited_count = 3;
    
    TRACK_FUNCTION_EXIT();
}

// Example 5: LinkedList operations
void example_linked_list() {
    struct ListNode {
        int val;
        ListNode* next;
        ListNode(int v) : val(v), next(nullptr) {}
    };
    
    TRACK_FUNCTION_ENTRY("linkedlist_operations");
    
    // Create list
    ListNode* head = new ListNode(1);
    head->next = new ListNode(2);
    head->next->next = new ListNode(3);
    
    std::cout << "{\"type\":\"list_created\",\"line\":" << __LINE__ << ",\"values\":[1,2,3]}\n";
    
    // Traverse
    TRACE_INT(count, 0);
    ListNode* curr = head;
    
    while (curr != nullptr) {
        TRACE_LINE();
        std::cout << "{\"type\":\"list_traverse\",\"line\":" << __LINE__ << ",\"current_value\":" << curr->val << "}\n";
        count++;
        curr = curr->next;
    }
    
    TRACK_FUNCTION_EXIT();
}

// Example 6: User code template (what to modify)
int main() {
    // TODO: Write your algorithm here
    // Use TRACE_INT(name, value) for integer variables
    // Use TRACK_FUNCTION_ENTRY/EXIT for function tracking
    // Use TRACE_LINE() to mark important lines
    
    TRACE_INT(result, 0);
    
    // Your code here
    result = 42;
    
    cout << "Result: " << result << endl;
    
    return 0;
}

/*
QUICK REFERENCE:

1. Integer Variables:
   TRACE_INT(x, 10);    // Declares and tracks int x = 10

2. Function Tracking:
   TRACK_FUNCTION_ENTRY("functionName");
   // function body
   TRACK_FUNCTION_EXIT();

3. Line Tracking:
   TRACE_LINE();        // Mark important line for visualization

4. Arrays:
   Manually emit: std::cout << "{\"type\":\"array_change\",\"var\":\"arr\",...}\n";

5. Custom Events:
   __emit_event__("event_type", __LINE__, "optional_var", "optional_value");

EXPECTED OUTPUT FORMAT (JSON Lines):
{"type":"var_declare","step_id":1,"line":12,"function":"main","call_stack":["main"],"var":"x","value":10}
{"type":"var_change","step_id":2,"line":13,"function":"main","call_stack":["main"],"var":"x","value":20}
{"type":"array_change","step_id":3,"line":14,"function":"bubble_sort","call_stack":["main","bubble_sort"],"var":"arr","value":"[2,5,8,1,9]"}

Each line is a JSON object that the visualizer parses to show the state at each step.
*/
