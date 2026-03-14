#!/usr/bin/env node

/**
 * Map Visualization Output Validator
 * 
 * Usage: node validate-map-output.js
 * 
 * Reads the output from example_map_visualization.exe and validates:
 * 1. Valid JSON format
 * 2. Presence of map_change events
 * 3. Correct map structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Map Visualization Output Validator\n');

// Step 1: Run the program and capture output
console.log('Step 1: Running example_map_visualization.exe...');
let output = '';
try {
    const cppDir = path.join(__dirname, 'lib', 'cpp');
    const exePath = path.join(cppDir, 'example_map_visualization.exe');
    
    if (!fs.existsSync(exePath)) {
        console.error('❌ Executable not found:', exePath);
        console.log('\nPlease compile first:');
        console.log('  cd lib/cpp');
        console.log('  g++ -std=c++17 -I. -o example_map_visualization examples/example_map_visualization.cpp');
        process.exit(1);
    }
    
    output = execSync(exePath, { cwd: cppDir }).toString();
    console.log('✓ Program executed successfully\n');
} catch (error) {
    console.error('❌ Failed to run program:', error.message);
    process.exit(1);
}

// Step 2: Parse JSON lines
console.log('Step 2: Parsing JSON output...');
const lines = output.split('\n').filter(line => line.trim());
let validLines = 0;
let invalidLines = 0;
const events = [];

lines.forEach((line, idx) => {
    try {
        const event = JSON.parse(line);
        events.push(event);
        validLines++;
    } catch (e) {
        console.log(`  ⚠️  Line ${idx + 1}: Not valid JSON (skip)`);
        invalidLines++;
    }
});

console.log(`✓ Parsed ${validLines} valid JSON lines\n`);

if (invalidLines > 0) {
    console.log(`⚠️  Warning: ${invalidLines} lines were not valid JSON\n`);
}

// Step 3: Find map_change events
console.log('Step 3: Checking for map_change events...');
const mapChangeEvents = events.filter(e => e.type === 'map_change');
console.log(`✓ Found ${mapChangeEvents.length} map_change events\n`);

if (mapChangeEvents.length === 0) {
    console.error('❌ No map_change events found!');
    console.log('\nThis means TRACE_UNORDERED_MAP_CHANGE() is not being called.');
    console.log('Check your C++ code:\n');
    console.log('1. Include tracer.hpp');
    console.log('2. After each map modification, call:');
    console.log('   TRACE_UNORDERED_MAP_CHANGE(map_name, map_object);');
    process.exit(1);
}

// Step 4: Validate map structure
console.log('Step 4: Validating map structure...\n');
let structureErrors = 0;

mapChangeEvents.forEach((event, idx) => {
    const errors = [];
    
    if (!event.var) errors.push('Missing "var" field');
    if (event.value === undefined) errors.push('Missing "value" field');
    if (typeof event.value === 'string') errors.push('Value is string instead of object');
    if (!Array.isArray(event.call_stack)) errors.push('Missing or invalid "call_stack"');
    if (typeof event.step_id !== 'number') errors.push('Missing or invalid "step_id"');
    
    if (errors.length > 0) {
        console.log(`  Event ${idx + 1} (${event.var}):`);
        errors.forEach(e => console.log(`    ❌ ${e}`));
        structureErrors++;
    }
});

if (structureErrors === 0) {
    console.log('✓ All map_change events have correct structure\n');
} else {
    console.log(`\n❌ ${structureErrors} events have structural issues\n`);
}

// Step 5: Show sample events
console.log('Step 5: Sample map_change events:\n');
mapChangeEvents.slice(0, 5).forEach((event, idx) => {
    console.log(`Event ${idx + 1}: ${event.var}`);
    console.log(`  Value: ${JSON.stringify(event.value)}`);
    console.log(`  Step: ${event.step_id}`);
    console.log();
});

// Step 6: Summary
console.log('=== SUMMARY ===\n');

const summary = {
    'Total JSON Events': validLines,
    'map_change Events': mapChangeEvents.length,
    'Structure Errors': structureErrors,
    'Status': structureErrors === 0 && mapChangeEvents.length > 0 ? '✓ PASSED' : '❌ FAILED'
};

Object.entries(summary).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
});

console.log('\n=== NEXT STEPS ===\n');

if (structureErrors === 0 && mapChangeEvents.length > 0) {
    console.log('✓ C++ output looks good!');
    console.log('✓ Maps should be visible in the visualizer.');
    console.log('\nIf you still don\'t see maps in the visualizer:');
    console.log('1. Check browser console (F12 → Console)');
    console.log('2. Look for "ExecutionVisualizer Debug" output');
    console.log('3. Verify maps field is > 0');
    console.log('4. Check if ReactComponent is rendering correctly');
} else {
    console.log('❌ There are issues with the C++ output.');
    console.log('Please fix the issues above and try again.');
}

console.log('\n');
