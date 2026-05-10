class Solution {
public:
    int maximumJumps(vector<int>& nums, int target) {
        int n = nums.size();
        vector<int> mp(n , 0);
        int curr_max = 0;
        for(int i = n-2 ; i >= 0 ; i--){
            for(int j = i+1 ; j <= n - 1 ; j++){
                if(abs(nums[i] - nums[j]) <= target){
                    mp[i] = mp[j] + 1;
                    break;
                }
            }
        }
        if(mp[0] == 0){
            return -1;
        }
        return mp[0]; 
        
    }
};
int main() {
    vector<int> nums = {1,3,6,4,1,2};
    int target = 3;
    Solution sol;
    int result = sol.maximumJumps(nums, target);
    return 0;
}