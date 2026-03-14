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
        TRACE_LINE();  // Mark loop iteration
        
        TRACE_INT(current_height, min(height[i], height[j]));
        TRACE_INT(current_width, j - i);
        TRACE_INT(current_area, current_width * current_height);
        
        if(current_height == height[i]) {
            if(current_area > area_max) {
                area_max = current_area;
                TRACE_INT(updated_max, area_max);  // Track when max updates
            }
            i++;
        }
        else {
            if(current_area > area_max) {
                area_max = current_area;
                TRACE_INT(updated_max, area_max);  // Track when max updates
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
