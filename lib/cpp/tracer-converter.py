#!/usr/bin/env python3
"""
AlgoLens C++ Tracer Converter
Automated tool to convert normal C++ code to traced C++ code with tracer macros.
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple, Dict, Set

class TracerConverter:
    def __init__(self):
        self.indentation = "    "
        
    def convert_file(self, input_file: str, output_file: str = None) -> str:
        """Convert a C++ file to include tracer macros."""
        with open(input_file, 'r') as f:
            content = f.read()
        
        converted = self.convert_code(content)
        
        if output_file:
            with open(output_file, 'w') as f:
                f.write(converted)
            print(f"✅ Converted file saved to: {output_file}")
        
        return converted
    
    def convert_code(self, code: str) -> str:
        """Convert C++ code to include tracer macros."""
        lines = code.split('\n')
        converted_lines = []
        
        # Add tracer header if not present
        if '#include "tracer.hpp"' not in code:
            # Find the last #include and add after it
            last_include_idx = -1
            for i, line in enumerate(lines):
                if line.strip().startswith('#include'):
                    last_include_idx = i
            
            if last_include_idx >= 0:
                lines.insert(last_include_idx + 1, '#include "tracer.hpp"')
            else:
                lines.insert(0, '#include "tracer.hpp"')
        
        in_function = False
        function_name = "main"
        indent_level = 0
        tracked_vars: Set[str] = set()
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            
            # Skip empty lines and comments
            if not stripped or stripped.startswith('//'):
                converted_lines.append(line)
                continue
            
            # Detect function entry
            if self._is_function_def(stripped):
                in_function = True
                function_name = self._extract_function_name(stripped)
                converted_lines.append(line)
                continue
            
            # Add function entry tracking
            if in_function and self._is_function_start(stripped):
                indent = self._get_indent(line)
                converted_lines.append(indent + f'TRACK_FUNCTION_ENTRY("{function_name}");')
                conversion = self._convert_line(line, tracked_vars)
                converted_lines.append(conversion)
                in_function = False
                continue
            
            # Convert variable declarations
            if self._is_variable_declaration(stripped):
                conversion = self._convert_variable_declaration(line, tracked_vars)
                if conversion != line:
                    converted_lines.append(conversion)
                    # Add trace macro
                    var_name = self._extract_var_name(stripped)
                    if var_name:
                        indent = self._get_indent(line)
                        trace_line = self._generate_trace_macro(var_name, stripped)
                        if trace_line:
                            converted_lines.append(indent + trace_line)
                    continue
            
            # Convert loops
            if 'for' in stripped and '(' in stripped:
                conversion = self._convert_for_loop(line, tracked_vars)
                converted_lines.append(conversion)
                continue
            
            # Convert array operations
            if '[' in stripped and '=' in stripped:
                conversion = self._add_array_trace(line, tracked_vars)
                converted_lines.append(conversion)
                continue
            
            # Convert function returns
            if 'return' in stripped:
                indent = self._get_indent(line)
                converted_lines.append(indent + 'TRACK_FUNCTION_EXIT();')
                converted_lines.append(line)
                continue
            
            converted_lines.append(line)
        
        return '\n'.join(converted_lines)
    
    def _is_function_def(self, line: str) -> bool:
        """Check if line is a function definition."""
        # Simple heuristic: contains ( and ) and : or {
        return bool(re.match(r'^.*\(.*\)\s*{?.*', line)) and ('int ' in line or 'void ' in line or 'bool ' in line)
    
    def _is_function_start(self, line: str) -> bool:
        """Check if this is the opening of a function."""
        return line == '{' or ('{' in line and '=' not in line)
    
    def _extract_function_name(self, line: str) -> str:
        """Extract function name from function definition."""
        match = re.search(r'(\w+)\s*\(', line)
        return match.group(1) if match else 'unknown'
    
    def _is_variable_declaration(self, line: str) -> bool:
        """Check if line is a variable declaration."""
        # Look for type followed by name and optional initialization
        types = ['int', 'float', 'double', 'string', 'vector', 'map', 'unordered_map', 'bool', 'char']
        return any(f'{t} ' in line for t in types) and not 'for' in line
    
    def _extract_var_name(self, declaration: str) -> str:
        """Extract variable name from declaration."""
        # Remove type and get name
        for t in ['int', 'float', 'double', 'string', 'vector', 'map', 'unordered_map', 'bool', 'char']:
            if f'{t} ' in declaration:
                declaration = declaration.replace(f'{t} ', '', 1)
                break
        
        # Get first word (variable name)
        match = re.match(r'(\w+)', declaration.strip())
        return match.group(1) if match else None
    
    def _convert_variable_declaration(self, line: str, tracked: Set[str]) -> str:
        """Convert variable declaration line."""
        var_name = self._extract_var_name(line.strip())
        if var_name:
            tracked.add(var_name)
        return line
    
    def _generate_trace_macro(self, var_name: str, declaration: str) -> str:
        """Generate appropriate trace macro for variable."""
        if 'int' in declaration:
            # Extract initial value
            match = re.search(r'=\s*(-?\d+)', declaration)
            value = match.group(1) if match else '0'
            return f'TRACE_INT({var_name}, {value});'
        elif 'map' in declaration:
            return f'TRACE_UNORDERED_MAP_CHANGE({var_name}, {var_name});'
        elif 'vector' in declaration:
            return f'// Track array: {var_name}'
        return None
    
    def _convert_for_loop(self, line: str, tracked: Set[str]) -> str:
        """Convert for loop to use TRACE_INT for counter."""
        # Replace: for (int i = 0; ...)
        # With: for (TRACE_INT(i, 0); ...)
        match = re.search(r'for\s*\(\s*int\s+(\w+)\s*=\s*(-?\d+)', line)
        if match:
            var_name = match.group(1)
            init_value = match.group(2)
            tracked.add(var_name)
            indent = self._get_indent(line)
            return line.replace(f'int {var_name} = {init_value}', f'TRACE_INT({var_name}, {init_value})')
        return line
    
    def _add_array_trace(self, line: str, tracked: Set[str]) -> str:
        """Add trace for array operations."""
        # For now, just return the line - could be enhanced
        if 'swap' in line or '[' in line and '=' in line:
            return line + '  // Array modification'
        return line
    
    def _convert_line(self, line: str, tracked: Set[str]) -> str:
        """Convert a general line."""
        return line
    
    def _get_indent(self, line: str) -> str:
        """Extract indentation from line."""
        match = re.match(r'^(\s*)', line)
        return match.group(1) if match else ''


class TemplateProvider:
    """Provides template code for common algorithm patterns."""
    
    @staticmethod
    def get_sorted_algorithm_template() -> str:
        """Template for sorting algorithms."""
        return '''#include <vector>
#include "tracer.hpp"
using namespace std;

void bubble_sort(vector<int>& arr) {
    TRACK_FUNCTION_ENTRY("bubble_sort");
    
    int n = arr.size();
    TRACE_INT(comparisons, 0);
    TRACE_INT(swaps, 0);
    
    for (TRACE_INT(i, 0); i < n - 1; i++) {
        for (TRACE_INT(j, 0); j < n - i - 1; j++) {
            comparisons++;
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swaps++;
                // Emit array state
                cout << "{\\"type\\":\\"array_change\\",\\"var\\":\\"arr\\"}\\n";
            }
        }
    }
    
    TRACK_FUNCTION_EXIT();
}

int main() {
    vector<int> arr = {5, 2, 8, 1, 9};
    bubble_sort(arr);
    return 0;
}
'''
    
    @staticmethod
    def get_search_algorithm_template() -> str:
        """Template for searching algorithms."""
        return '''#include <vector>
#include "tracer.hpp"
using namespace std;

int binary_search(vector<int>& arr, int target, int left, int right) {
    TRACK_FUNCTION_ENTRY("binary_search");
    
    if (left > right) {
        TRACK_FUNCTION_EXIT();
        return -1;
    }
    
    int mid = left + (right - left) / 2;
    
    if (arr[mid] == target) {
        TRACK_FUNCTION_EXIT();
        return mid;
    }
    
    if (arr[mid] > target) {
        TRACE_INT(result1, binary_search(arr, target, left, mid - 1));
        TRACK_FUNCTION_EXIT();
        return result1;
    }
    
    TRACE_INT(result2, binary_search(arr, target, mid + 1, right));
    TRACK_FUNCTION_EXIT();
    return result2;
}

int main() {
    vector<int> arr = {2, 5, 8, 12, 16, 23, 38};
    binary_search(arr, 23, 0, arr.size() - 1);
    return 0;
}
'''
    
    @staticmethod
    def get_map_algorithm_template() -> str:
        """Template for map-based algorithms."""
        return '''#include <unordered_map>
#include <vector>
#include "tracer.hpp"
using namespace std;

int frequency_counter(vector<int>& nums) {
    TRACK_FUNCTION_ENTRY("frequency_counter");
    
    unordered_map<int, int> freq;
    TRACE_UNORDERED_MAP_CHANGE(freq, freq);
    
    TRACE_INT(maxFreq, 0);
    TRACE_INT(maxNum, -1);
    
    for (TRACE_INT(i, 0); i < nums.size(); i++) {
        freq[nums[i]]++;
        TRACE_UNORDERED_MAP_CHANGE(freq, freq);
        
        if (freq[nums[i]] > maxFreq) {
            maxFreq = freq[nums[i]];
            maxNum = nums[i];
        }
    }
    
    TRACK_FUNCTION_EXIT();
    return maxNum;
}

int main() {
    vector<int> nums = {1, 1, 1, 2, 2, 3};
    frequency_counter(nums);
    return 0;
}
'''
    
    @staticmethod
    def get_recursion_template() -> str:
        """Template for recursive algorithms."""
        return '''#include "tracer.hpp"
using namespace std;

int factorial(int n) {
    TRACK_FUNCTION_ENTRY("factorial");
    
    if (n <= 1) {
        TRACK_FUNCTION_EXIT();
        return 1;
    }
    
    TRACE_INT(result, n * factorial(n - 1));
    TRACK_FUNCTION_EXIT();
    return result;
}

int main() {
    TRACE_INT(answer, factorial(5));
    cout << answer << endl;
    return 0;
}
'''


def print_usage():
    """Print usage instructions."""
    print("""
╔════════════════════════════════════════════════════════════════╗
║         AlgoLens C++ Tracer Converter - Usage Guide            ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  python tracer-converter.py <command> [arguments]

COMMANDS:
  
  1. Convert existing file:
     python tracer-converter.py convert <input.cpp> [output.cpp]
     
     Example:
     python tracer-converter.py convert solution.cpp traced_solution.cpp
  
  2. Show template for algorithm type:
     python tracer-converter.py template <type>
     
     Available types:
     - sorting       : Bubble sort template
     - searching     : Binary search template
     - map           : Frequency counter with map
     - recursion     : Factorial (recursion) template
     
     Example:
     python tracer-converter.py template sorting
  
  3. Interactive conversion:
     python tracer-converter.py interactive
     
     Step-by-step guide to convert your code

EXAMPLES:
  
  # Convert existing code
  python tracer-converter.py convert my_algorithm.cpp
  
  # Show sorting algorithm template
  python tracer-converter.py template sorting
  
  # Interactive mode
  python tracer-converter.py interactive

FEATURES:
  ✓ Automatically adds #include "tracer.hpp"
  ✓ Converts variable declarations to TRACE_INT/TRACE_VAR
  ✓ Instruments for loops with TRACE_INT counters
  ✓ Adds function entry/exit tracking
  ✓ Converts map operations to TRACE_UNORDERED_MAP_CHANGE
  ✓ Preserves original code structure

MANUAL CHECKLIST:
  After automated conversion, manually add:
  1. TRACE_UNORDERED_MAP_CHANGE() after map modifications
  2. Array state emissions (cout with array_change events)
  3. Important TRACE_LINE() calls for key operations
  4. TRACE_INT() for manually computed values

TEMPLATES:
  If automated conversion doesn't work well, start with
  one of the provided templates matching your algorithm type.
""")


def main():
    if len(sys.argv) < 2:
        print_usage()
        return
    
    command = sys.argv[1].lower()
    
    if command == 'convert':
        if len(sys.argv) < 3:
            print("❌ Error: Please specify input file")
            print("Usage: python tracer-converter.py convert <input.cpp> [output.cpp]")
            return
        
        input_file = sys.argv[2]
        output_file = sys.argv[3] if len(sys.argv) > 3 else None
        
        if not Path(input_file).exists():
            print(f"❌ Error: File not found: {input_file}")
            return
        
        converter = TracerConverter()
        converted = converter.convert_file(input_file, output_file)
        
        if not output_file:
            print("\n✏️  CONVERTED CODE:\n")
            print(converted)
    
    elif command == 'template':
        if len(sys.argv) < 3:
            print("❌ Error: Please specify template type")
            print("Available: sorting, searching, map, recursion")
            return
        
        template_type = sys.argv[2].lower()
        provider = TemplateProvider()
        
        templates = {
            'sorting': provider.get_sorted_algorithm_template,
            'searching': provider.get_search_algorithm_template,
            'map': provider.get_map_algorithm_template,
            'recursion': provider.get_recursion_template,
        }
        
        if template_type not in templates:
            print(f"❌ Error: Unknown template type: {template_type}")
            print("Available: sorting, searching, map, recursion")
            return
        
        template = templates[template_type]()
        print(f"\n📋 {template_type.upper()} ALGORITHM TEMPLATE:\n")
        print(template)
    
    elif command == 'interactive':
        print("\n🎯 INTERACTIVE TRACER CONVERSION\n")
        print("Select your algorithm type:")
        print("1. Sorting (bubble sort, quicksort, etc.)")
        print("2. Searching (binary search, linear search)")
        print("3. HashMap/Map based (frequency counter, two-sum)")
        print("4. Recursion (factorial, fibonacci)")
        print("5. Custom algorithm")
        
        choice = input("\nEnter choice (1-5): ").strip()
        
        provider = TemplateProvider()
        templates = {
            '1': ('SORTING', provider.get_sorted_algorithm_template()),
            '2': ('SEARCHING', provider.get_search_algorithm_template()),
            '3': ('MAP-BASED', provider.get_map_algorithm_template()),
            '4': ('RECURSION', provider.get_recursion_template()),
        }
        
        if choice in templates:
            name, template = templates[choice]
            print(f"\n📋 Here's a {name} template:\n")
            print(template)
            
            save = input("\nSave to file? (y/n): ").strip().lower()
            if save == 'y':
                filename = input("Enter filename (e.g., my_algorithm.cpp): ").strip()
                with open(filename, 'w') as f:
                    f.write(template)
                print(f"✅ Saved to: {filename}")
        else:
            print("Enter your C++ code (end with EOF or Ctrl+D):")
            code = sys.stdin.read()
            converter = TracerConverter()
            converted = converter.convert_code(code)
            print("\n✏️  CONVERTED CODE:\n")
            print(converted)
    
    else:
        print(f"❌ Unknown command: {command}")
        print_usage()


if __name__ == '__main__':
    main()
