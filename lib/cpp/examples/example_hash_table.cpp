// EXAMPLE: Hash Table with Collision Handling
// Shows how hash functions, collisions, and bucket operations are visualized

#include <iostream>
#include <vector>
#include <string>
#include "tracer.hpp"

using namespace std;

struct HashNode {
    string key;
    int value;
    HashNode* next;
    
    HashNode(string k, int v) : key(k), value(v), next(nullptr) {}
};

class HashTable {
private:
    vector<HashNode*> buckets;
    int size;
    int collisions;
    int total_insertions;
    
    int hash_function(string key) {
        TRACK_FUNCTION_ENTRY("hash_function");
        
        TRACE_INT(hash_value, 0);
        TRACE_INT(key_length, key.length());
        
        for (char c : key) {
            hash_value = (hash_value * 31 + (int)c) % size;
        }
        
        TRACE_LINE();
        cout << "{\"type\":\"hash_computed\",\"key\":\"" << key << "\",\"hash_value\":" 
             << hash_value << "}\n";
        
        TRACK_FUNCTION_EXIT();
        return hash_value;
    }
    
public:
    HashTable(int capacity) : size(capacity), collisions(0), total_insertions(0) {
        TRACK_FUNCTION_ENTRY("HashTable::constructor");
        
        buckets.resize(size, nullptr);
        
        cout << "{\"type\":\"hash_table_created\",\"capacity\":" << size << "}\n";
        
        TRACK_FUNCTION_EXIT();
    }
    
    void insert(string key, int value) {
        TRACK_FUNCTION_ENTRY("insert");
        
        TRACE_INT(bucket_index, hash_function(key));
        total_insertions++;
        
        cout << "{\"type\":\"insert_start\",\"key\":\"" << key << "\",\"value\":" 
             << value << ",\"bucket\":" << bucket_index << "}\n";
        
        HashNode* new_node = new HashNode(key, value);
        
        if (buckets[bucket_index] == nullptr) {
            // Empty bucket
            buckets[bucket_index] = new_node;
            cout << "{\"type\":\"insert_empty_bucket\",\"bucket\":" << bucket_index << "}\n";
        } else {
            // Collision! Add to chain
            collisions++;
            cout << "{\"type\":\"collision_detected\",\"bucket\":" << bucket_index 
                 << ",\"total_collisions\":" << collisions << "}\n";
            
            HashNode* current = buckets[bucket_index];
            TRACE_INT(chain_length, 1);
            
            while (current->next != nullptr) {
                current = current->next;
                chain_length++;
            }
            
            cout << "{\"type\":\"chain_length\",\"bucket\":" << bucket_index 
                 << ",\"length\":" << chain_length << "}\n";
            
            current->next = new_node;
        }
        
        TRACE_INT(load_factor_percent, (total_insertions * 100) / size);
        cout << "{\"type\":\"load_factor\",\"inserted\":" << total_insertions 
             << ",\"capacity\":" << size << ",\"percent\":" << load_factor_percent << "}\n";
        
        TRACK_FUNCTION_EXIT();
    }
    
    int search(string key) {
        TRACK_FUNCTION_ENTRY("search");
        
        TRACE_INT(bucket_index, hash_function(key));
        TRACE_INT(comparisons, 0);
        TRACE_INT(result, -1);
        
        cout << "{\"type\":\"search_start\",\"key\":\"" << key << "\",\"bucket\":" 
             << bucket_index << "}\n";
        
        HashNode* current = buckets[bucket_index];
        
        while (current != nullptr) {
            comparisons++;
            
            cout << "{\"type\":\"compare_keys\",\"searching_for\":\"" << key 
                 << "\",\"current_key\":\"" << current->key << "\"}\n";
            
            if (current->key == key) {
                result = current->value;
                cout << "{\"type\":\"key_found\",\"key\":\"" << key << "\",\"value\":" 
                     << result << ",\"comparisons\":" << comparisons << "}\n";
                TRACK_FUNCTION_EXIT();
                return result;
            }
            
            current = current->next;
        }
        
        cout << "{\"type\":\"key_not_found\",\"key\":\"" << key << "\",\"comparisons\":" 
             << comparisons << "}\n";
        
        TRACK_FUNCTION_EXIT();
        return result;
    }
    
    bool remove(string key) {
        TRACK_FUNCTION_ENTRY("remove");
        
        TRACE_INT(bucket_index, hash_function(key));
        TRACE_INT(found, 0);
        
        cout << "{\"type\":\"remove_start\",\"key\":\"" << key << "\",\"bucket\":" 
             << bucket_index << "}\n";
        
        HashNode* current = buckets[bucket_index];
        HashNode* prev = nullptr;
        
        while (current != nullptr) {
            if (current->key == key) {
                if (prev == nullptr) {
                    buckets[bucket_index] = current->next;
                } else {
                    prev->next = current->next;
                }
                
                delete current;
                total_insertions--;
                found = 1;
                
                cout << "{\"type\":\"key_removed\",\"key\":\"" << key << "\"}\n";
                TRACK_FUNCTION_EXIT();
                return true;
            }
            
            prev = current;
            current = current->next;
        }
        
        cout << "{\"type\":\"remove_failed\",\"key\":\"" << key << "\"}\n";
        
        TRACK_FUNCTION_EXIT();
        return false;
    }
    
    void display_stats() {
        TRACK_FUNCTION_ENTRY("display_stats");
        
        TRACE_INT(empty_buckets, 0);
        TRACE_INT(max_chain_length, 0);
        TRACE_INT(avg_chain_length_x100, 0);
        
        for (int i = 0; i < size; i++) {
            if (buckets[i] == nullptr) {
                empty_buckets++;
            } else {
                int chain_len = 0;
                HashNode* current = buckets[i];
                while (current != nullptr) {
                    chain_len++;
                    current = current->next;
                }
                if (chain_len > max_chain_length) {
                    max_chain_length = chain_len;
                }
            }
        }
        
        if (total_insertions > 0) {
            avg_chain_length_x100 = (total_insertions * 100) / size;
        }
        
        cout << "{\"type\":\"hash_table_stats\",\"capacity\":" << size 
             << ",\"items\":" << total_insertions << ",\"empty_buckets\":" << empty_buckets
             << ",\"collisions\":" << collisions << ",\"max_chain\":" << max_chain_length
             << ",\"load_factor_percent\":" << avg_chain_length_x100 << "}\n";
        
        TRACK_FUNCTION_EXIT();
    }
};

int main() {
    TRACE_INT(hash_table_size, 7);
    HashTable ht(hash_table_size);
    
    cout << "=== Hash Table Visualization ===\n";
    cout << "{\"type\":\"demo_start\",\"algorithm\":\"hash_table\"}\n";
    
    // Insert operations
    TRACE_INT(item1_key, 0);  // for visualization
    cout << "{\"type\":\"operation\",\"name\":\"insert\",\"description\":\"Adding items to hash table\"}\n";
    
    ht.insert("apple", 10);
    ht.insert("banana", 20);
    ht.insert("cherry", 30);
    ht.insert("date", 40);
    ht.insert("grape", 50);  // Likely collision with apple
    ht.insert("elderberry", 60);
    
    cout << "\n";
    ht.display_stats();
    cout << "\n";
    
    // Search operations
    cout << "{\"type\":\"operation\",\"name\":\"search\",\"description\":\"Finding items\"}\n";
    
    int found1 = ht.search("banana");
    cout << "Search for 'banana': " << (found1 != -1 ? "Found (" + to_string(found1) + ")" : "Not Found") << "\n";
    
    int found2 = ht.search("grape");
    cout << "Search for 'grape': " << (found2 != -1 ? "Found (" + to_string(found2) + ")" : "Not Found") << "\n";
    
    int found3 = ht.search("orange");
    cout << "Search for 'orange': " << (found3 != -1 ? "Found (" + to_string(found3) + ")" : "Not Found") << "\n";
    
    cout << "\n";
    
    // Remove operation
    cout << "{\"type\":\"operation\",\"name\":\"remove\",\"description\":\"Removing items\"}\n";
    
    ht.remove("banana");
    cout << "Removed 'banana'\n";
    
    cout << "\n";
    ht.display_stats();
    
    cout << "\n";
    cout << "{\"type\":\"demo_end\",\"algorithm\":\"hash_table\"}\n";
    
    return 0;
}

/*
VISUALIZATION FEATURES DEMONSTRATED:

1. Hash Function:
   - Shows how keys are mapped to bucket indices
   - Demonstrates hash function computation
   - Tracks hash distribution

2. Collision Detection:
   - Identifies when two keys hash to same bucket
   - Shows collision count accumulation
   - Visualizes collision chains (chaining strategy)

3. Operations:
   - Insert: Shows empty bucket vs collision path
   - Search: Visualizes chain traversal and comparisons
   - Remove: Shows deletion from chain

4. Statistics:
   - Load factor (items / capacity)
   - Empty buckets count
   - Maximum chain length
   - Total collisions
   - Average chain traversal cost

5. Performance Insight:
   - Watch how chain length affects search performance
   - See load factor impact on collision frequency
   - Understand collision resolution strategy (chaining)

TEST VARIATIONS:
- Try different hash table sizes
- Add more items to increase collisions
- Insert keys that likely collide (similar characters)
- Observe how chain length grows with load factor
- Experiment with different key distributions
*/
