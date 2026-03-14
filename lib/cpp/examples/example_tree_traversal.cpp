// EXAMPLE: Binary Tree Traversal Visualization
// Shows how to visualize tree data structures and traversals

#include <iostream>
#include <vector>
#include <queue>
#include "tracer.hpp"

using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    int nodeId;  // For visualization
    
    TreeNode(int v, int id) : val(v), nodeId(id), left(nullptr), right(nullptr) {}
};

// In-order traversal: Left -> Root -> Right
vector<int> inorder_traversal(TreeNode* root) {
    TRACK_FUNCTION_ENTRY("inorder_traversal");
    
    vector<int> result;
    TRACE_INT(visited, 0);
    
    function<void(TreeNode*)> traverse = [&](TreeNode* node) {
        if (!node) return;
        
        // Go left
        cout << "{\"type\":\"tree_go_left\",\"from_node\":" << (node ? node->nodeId : -1) << "}\n";
        traverse(node->left);
        
        // Visit current
        visited++;
        result.push_back(node->val);
        cout << "{\"type\":\"tree_visit\",\"node_id\":" << node->nodeId << ",\"value\":" << node->val 
             << ",\"visit_order\":" << visited << "}\n";
        
        // Go right
        cout << "{\"type\":\"tree_go_right\",\"from_node\":" << node->nodeId << "}\n";
        traverse(node->right);
    };
    
    traverse(root);
    TRACK_FUNCTION_EXIT();
    return result;
}

// Level-order traversal (BFS)
vector<vector<int>> levelorder_traversal(TreeNode* root) {
    TRACK_FUNCTION_ENTRY("levelorder_traversal");
    
    vector<vector<int>> result;
    TRACE_INT(level, 0);
    TRACE_INT(node_count, 0);
    
    if (!root) {
        TRACK_FUNCTION_EXIT();
        return result;
    }
    
    queue<TreeNode*> q;
    q.push(root);
    
    cout << "{\"type\":\"tree_bfs_start\",\"root_value\":" << root->val << "}\n";
    
    while (!q.empty()) {
        TRACE_LINE();
        TRACE_INT(level_size, q.size());
        vector<int> currentLevel;
        
        cout << "{\"type\":\"tree_level_start\",\"level\":" << level << ",\"size\":" << level_size << "}\n";
        
        for (TRACE_INT(i, 0); i < level_size; i++) {
            TreeNode* node = q.front();
            q.pop();
            node_count++;
            
            cout << "{\"type\":\"tree_level_visit\",\"level\":" << level << ",\"node_id\":" << node->nodeId 
                 << ",\"value\":" << node->val << "}\n";
            
            currentLevel.push_back(node->val);
            
            if (node->left) {
                cout << "{\"type\":\"tree_enqueue\",\"from\":" << node->nodeId 
                     << ",\"to\":" << node->left->nodeId << "}\n";
                q.push(node->left);
            }
            
            if (node->right) {
                cout << "{\"type\":\"tree_enqueue\",\"from\":" << node->nodeId 
                     << ",\"to\":" << node->right->nodeId << "}\n";
                q.push(node->right);
            }
        }
        
        result.push_back(currentLevel);
        level++;
    }
    
    cout << "{\"type\":\"tree_bfs_complete\",\"total_nodes\":" << node_count << "}\n";
    TRACK_FUNCTION_EXIT();
    return result;
}

int main() {
    // Build binary tree
    /*
            1
           / \\
          2   3
         / \\
        4   5
    */
    
    cout << "{\"type\":\"tree_create\",\"structure\":\"binary_tree\"}\n";
    
    TreeNode* root = new TreeNode(1, 1);
    root->left = new TreeNode(2, 2);
    root->right = new TreeNode(3, 3);
    root->left->left = new TreeNode(4, 4);
    root->left->right = new TreeNode(5, 5);
    
    cout << "{\"type\":\"tree_complete\",\"nodes\":5,\"height\":3}\n";
    
    // In-order traversal
    cout << "{\"type\":\"traversal_start\",\"type\":\"inorder\"}\n";
    vector<int> inorder = inorder_traversal(root);
    cout << "{\"type\":\"traversal_result\",\"value\":\"[";
    for (int i = 0; i < inorder.size(); i++) {
        cout << inorder[i];
        if (i < inorder.size() - 1) cout << ",";
    }
    cout << "]\"}\n";
    
    // Level-order traversal
    cout << "{\"type\":\"traversal_start\",\"type\":\"levelorder\"}\n";
    vector<vector<int>> levelorder = levelorder_traversal(root);
    cout << "{\"type\":\"traversal_result\",\"structure\":\"[[";
    for (int i = 0; i < levelorder.size(); i++) {
        for (int j = 0; j < levelorder[i].size(); j++) {
            cout << levelorder[i][j];
            if (j < levelorder[i].size() - 1) cout << ",";
        }
        if (i < levelorder.size() - 1) cout << "],[";
    }
    cout << "]]\"}\n";
    
    return 0;
}

/*
VISUALIZATION FEATURES:

1. Tree Structure:
   - Node IDs for reference
   - Parent-child relationships
   - Visual tree layout

2. Traversal Methods:
   - In-order: Left -> Node -> Right (sorted for BST)
   - Level-order: Top to bottom, left to right (breadth-first)

3. Execution Flow:
   - Which node is visited at each step
   - Visit order numbering
   - Direction of traversal (go left, go right)

4. Queue Operations (BFS):
   - Elements added to queue
   - Elements removed from queue
   - Level progression
   - Children enqueued

5. Test Cases:
   - Current tree: balanced
   - Try left-skewed tree
   - Try right-skewed tree
   - Try single node
   - Try more complex tree structures

ENHANCEMENTS TO TRY:
- Post-order traversal
- Pre-order traversal
- Depth-first search (DFS)
- Find operations
- Insert/delete operations
- Height calculation with animation
*/
