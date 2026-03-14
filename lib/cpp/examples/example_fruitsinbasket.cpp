#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>
#include "tracer.hpp"
using namespace std;

int totalFruit(vector<int>& fruits) {
    TRACK_FUNCTION_ENTRY("totalFruit");
    
    unordered_map<int, int> mp;
    TRACE_UNORDERED_MAP_CHANGE(mp, mp);  // Track initial empty map
    
    TRACE_INT(j, 0);              // Left pointer of our window
    TRACE_INT(out, 0);            // Stores the max fruits found
    TRACE_INT(window_size, 0);    // Track current window size
    
    for(TRACE_INT(i, 0); i < fruits.size(); i++){
        TRACE_LINE();
        
        // 1. Always add the current fruit to our baskets
        mp[fruits[i]]++;
        TRACE_UNORDERED_MAP_CHANGE(mp, mp);  // Track map change
        
        TRACE_INT(fruit_type, fruits[i]);
        TRACE_INT(fruit_count, mp[fruits[i]]);
        
        // 2. If we have MORE than 2 types of fruit, we must shrink the window
        while(mp.size() > 2) {
            TRACE_LINE();
            
            // Remove the fruit at the left pointer
            mp[fruits[j]]--;
            
            // If we dropped all fruits of this type, completely remove it from the map
            if(mp[fruits[j]] == 0) {
                mp.erase(fruits[j]);
            }
            TRACE_UNORDERED_MAP_CHANGE(mp, mp);  // Track map change after removal
            
            // Shrink window
            j++;
        }
        
        // 3. Update the max length (current index - left index + 1)
        window_size = i - j + 1;
        out = max(out, window_size);
        
        cout << "{\"type\":\"window_state\",\"i\":" << i << ",\"j\":" << j 
             << ",\"window_size\":" << window_size << ",\"fruit_types\":" << mp.size() << "}\n";
    }
    
    cout << "{\"type\":\"result\",\"max_fruits\":" << out << "}\n";
    TRACK_FUNCTION_EXIT();
    return out;
}

int main(){
    cout << "{\"type\":\"test_start\",\"array\":[1,2,3,2,2]}\n";
    
    vector<int> fruits = {1, 2, 3, 2, 2};
    TRACE_INT(result, totalFruit(fruits));
    
    cout << "Result: " << result << endl;
    cout << "{\"type\":\"test_complete\"}\n";
    
    return 0;
}
