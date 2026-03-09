// Online C++ compiler to run C++ program online
#include <iostream>
#include <vector>
using namespace std;
int main() {
    // Write C++ code here
    vector<int> inp;
    int temp;
    while (cin >> temp) {
        inp.push_back(temp);
    }
    for(auto i : inp){
        cout << i;
    }

    return 0;
}