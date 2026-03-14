// Test file to verify map visualization parsing
// Run this in your browser console or test file to debug

import { parseExecutionTrace } from '@/lib/cpp/parser';

const sampleOutput = `{"type":"function_call","step_id":1,"line":9,"function":"test","call_stack":["main","test"],"var":"test","value":}
{"type":"map_change","step_id":2,"line":12,"function":"test","call_stack":["main","test"],"var":"freq","value":{}}
{"type":"map_change","step_id":3,"line":14,"function":"test","call_stack":["main","test"],"var":"freq","value":{"1":1}}
{"type":"map_change","step_id":4,"line":15,"function":"test","call_stack":["main","test"],"var":"freq","value":{"1":2}}
{"type":"map_change","step_id":5,"line":16,"function":"test","call_stack":["main","test"],"var":"freq","value":{"1":2,"2":1}}`;

export function testMapParsing() {
    console.log('=== MAP VISUALIZATION PARSING TEST ===\n');
    
    const trace = parseExecutionTrace(sampleOutput);
    
    console.log('Total frames:', trace.totalSteps);
    console.log('Error:', trace.error);
    
    trace.frames.forEach((frame, idx) => {
        console.log(`\n--- Frame ${idx} (Step ID: ${frame.step_id}) ---`);
        console.log('Event Type:', frame.eventType);
        console.log('Variables:', Array.from(frame.variables.entries()).map(([name, v]) => ({
            name,
            type: v.type,
            value: v.value
        })));
        console.log('Maps:', Array.from(frame.mapStates.entries()));
    });
    
    // Test getMemoryState at step 5
    const { getFrameAtStep, getMemoryState } = require('@/lib/cpp/parser');
    console.log('\n=== Memory State at Step 5 ===');
    const frame = getFrameAtStep(trace, 5);
    if (frame) {
        const memory = getMemoryState(trace, frame.step_id);
        console.log('Memory State:', memory);
        console.log('Maps:', memory?.maps);
        console.log('Arrays:', memory?.arrays);
    }
    
    return trace;
}

// Export for testing
if (typeof window !== 'undefined') {
    (window as any).testMapParsing = testMapParsing;
}
