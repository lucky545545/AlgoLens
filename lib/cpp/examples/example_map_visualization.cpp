#include <iostream>
#include <unordered_map>
#include <vector>
#include "tracer.hpp"
using namespace std;

// Example 1: Frequency counter using unordered_map
int frequencyCounter(vector<int>& nums) {
    TRACK_FUNCTION_ENTRY("frequencyCounter");
    
    unordered_map<int, int> freq;
    TRACE_UNORDERED_MAP_CHANGE(freq, freq);  // Initial empty map
    
    TRACE_INT(maxFreq, 0);
    TRACE_INT(maxNum, 0);
    
    for (TRACE_INT(i, 0); i < nums.size(); i++) {
        TRACE_LINE();
        
        // Add/update the frequency
        TRACE_INT(currentNum, nums[i]);
        freq[currentNum]++;
        TRACE_UNORDERED_MAP_CHANGE(freq, freq);
        
        // Track the max frequency
        TRACE_INT(currentFreq, freq[currentNum]);
        if (currentFreq > maxFreq) {
            maxFreq = currentFreq;
            maxNum = currentNum;
            TRACE_INT(newMaxFreq, maxFreq);
            TRACE_INT(newMaxNum, maxNum);
        }
    }
    
    cout << "{\"type\":\"result\",\"max_num\":" << maxNum << ",\"max_freq\":" << maxFreq << "}\n";
    TRACK_FUNCTION_EXIT();
    return maxFreq;
}

// Example 2: Two Sum using unordered_map
bool twoSum(vector<int>& nums, int target) {
    TRACK_FUNCTION_ENTRY("twoSum");
    
    unordered_map<int, int> seen;
    TRACE_UNORDERED_MAP_CHANGE(seen, seen);
    
    TRACE_INT(found, 0);
    
    for (TRACE_INT(i, 0); i < nums.size(); i++) {
        TRACE_LINE();
        
        TRACE_INT(currentNum, nums[i]);
        TRACE_INT(complement, target - currentNum);
        
        // Check if complement exists
        if (seen.find(complement) != seen.end()) {
            found = 1;
            cout << "{\"type\":\"pair_found\",\"num1\":" << complement << ",\"num2\":" << currentNum << "}\n";
            TRACK_FUNCTION_EXIT();
            return true;
        }
        
        // Add current number to map
        seen[currentNum]++;
        TRACE_UNORDERED_MAP_CHANGE(seen, seen);
    }
    
    cout << "{\"type\":\"no_pair_found\"}\n";
    TRACK_FUNCTION_EXIT();
    return false;
}

// Example 3: Group anagrams (simplified - counting character frequency)
void analyzeWord(string word) {
    TRACK_FUNCTION_ENTRY("analyzeWord");
    
    unordered_map<char, int> charCount;
    
    cout << "{\"type\":\"analyzing_word\",\"word\":\"" << word << "\"}\n";
    
    for (TRACE_INT(i, 0); i < word.length(); i++) {
        TRACE_LINE();
        
        char c = word[i];
        // Note: char to int conversion for JSON output
        charCount[c]++;
        
        // For visualization, we output numeric version
        cout << "{\"type\":\"char_processed\",\"char\":\"" << c << "\",\"position\":" << i << "}\n";
    }
    
    // Output the character frequencies
    cout << "{\"type\":\"char_frequency\",\"word\":\"" << word << "\",\"unique_chars\":" << charCount.size() << "}\n";
    
    TRACK_FUNCTION_EXIT();
}

// Example 4: Sliding window with map (like fruit in basket but more general)
int maxConsecutive(vector<int>& arr, int k) {
    TRACK_FUNCTION_ENTRY("maxConsecutive");
    
    unordered_map<int, int> window;
    TRACE_UNORDERED_MAP_CHANGE(window, window);
    
    TRACE_INT(maxLen, 0);
    TRACE_INT(left, 0);
    
    for (TRACE_INT(right, 0); right < arr.size(); right++) {
        TRACE_LINE();
        
        // Add current element
        window[arr[right]]++;
        TRACE_UNORDERED_MAP_CHANGE(window, window);
        
        TRACE_INT(windowSize, right - left + 1);
        TRACE_INT(distinctCount, (int)window.size());
        
        // Shrink window if we have more than k distinct elements
        while (distinctCount > k) {
            TRACE_LINE();
            
            window[arr[left]]--;
            if (window[arr[left]] == 0) {
                window.erase(arr[left]);
            }
            TRACE_UNORDERED_MAP_CHANGE(window, window);
            
            left++;
            windowSize = right - left + 1;
            distinctCount = (int)window.size();
        }
        
        // Update max
        if (windowSize > maxLen) {
            maxLen = windowSize;
        }
    }
    
    cout << "{\"type\":\"result\",\"max_consecutive_with_k_distinct\":" << maxLen << "}\n";
    TRACK_FUNCTION_EXIT();
    return maxLen;
}

int main() {
    cout << "{\"type\":\"example_start\",\"description\":\"Map/Unordered Map Visualization Examples\"}\n";
    
    // Example 1: Frequency Counter
    cout << "{\"type\":\"example\",\"name\":\"Frequency Counter\"}\n";
    vector<int> nums1 = {1, 1, 1, 2, 2, 3};
    frequencyCounter(nums1);
    
    // Example 2: Two Sum
    cout << "{\"type\":\"example\",\"name\":\"Two Sum\"}\n";
    vector<int> nums2 = {2, 7, 11, 15};
    twoSum(nums2, 9);
    
    // Example 4: Max Consecutive with k Distinct
    cout << "{\"type\":\"example\",\"name\":\"Max Consecutive with K Distinct\"}\n";
    vector<int> nums3 = {1, 2, 1, 2, 3};
    maxConsecutive(nums3, 2);
    
    return 0;
}
