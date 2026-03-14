#include <iostream>
#include "tracer.hpp"
#include <vector>
#include "tracer.hpp"
using namespace std;
int maxArea(vector<int>& height) { TRACK_FUNCTION_ENTRY("maxArea");
    TRACE_INT(area_max, 0);
    int i;
    int j;
    for(i = 0 , j = height.size()-1 ; i!=j ;){
        if(min(height[i],height[j]) == height[i]){
            if((j-i)*height[i] > area_max){
                area_max = (j-i)*height[i];
            }
            i++;
        }
        else{
            if((j-i)*height[j] > area_max){
                area_max = (j-i)*height[j];
            }
            j--;
        }
        
    }
    return area_max;
}
int main() { TRACK_FUNCTION_ENTRY("main");
    vector<int> height = {1,8,6,2,5,4,8,3,7};
    cout<<maxArea(height);
    return 0;
}
