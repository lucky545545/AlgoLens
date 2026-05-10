// Enhanced parser for AlgoLens execution traces
import { TraceEvent, TraceEventType, TraceValue, isTraceEvent } from "@/lib/trace-events";

export interface Variable {
    name: string;
    value: TraceValue;
    type: 'primitive' | 'array' | 'map' | 'object';
    lineChanged?: number;
}

export interface ExecutionFrame {
    step_id: number;
    line: number;
    function: string;
    callStack: string[];
    variables: Map<string, Variable>;
    arrayStates: Map<string, number[]>;
    mapStates: Map<string, Record<string | number, number>>;
    eventType: TraceEventType;
}

export interface ExecutionTrace {
    frames: ExecutionFrame[];
    totalSteps: number;
    error?: string;
}

function isNumericMap(value: Record<string, number>): boolean {
    const keys = Object.keys(value);
    return keys.length === 0 || keys.every((key) => /^\d+$/.test(key) && typeof value[key] === 'number');
}

function parseArrayString(value: string): number[] {
    const arrayStr = value.slice(1, -1).trim();
    if (!arrayStr) return [];
    return arrayStr.split(',').map((item) => Number.parseInt(item.trim(), 10) || 0);
}

export function parseTraceEvents(events: TraceEvent[]): ExecutionTrace {
    const frames: ExecutionFrame[] = [];
    const variableStates = new Map<string, Variable>();
    const arrayStates = new Map<string, number[]>();
    const mapStates = new Map<string, Record<string | number, number>>();
    let currentCallStack: string[] = ['main'];

    for (const event of events) {
            
        // Update call stack from event
        currentCallStack = event.call_stack;
            
        // Track variable changes
        if (event.var && event.value !== undefined) {
            // Check if event type explicitly indicates it's a map
            if (event.type === 'map_change') {
                if (typeof event.value === 'object' && event.value !== null && !Array.isArray(event.value)) {
                    mapStates.set(event.var, event.value);
                    variableStates.set(event.var, {
                        name: event.var,
                        value: event.value,
                        type: 'map',
                        lineChanged: event.line
                    });
                }
            }
            // Check if it's a map (object with numeric string keys and numeric values)
            else if (typeof event.value === 'object' && event.value !== null && !Array.isArray(event.value)) {
                if (isNumericMap(event.value)) {
                    mapStates.set(event.var, event.value);
                    variableStates.set(event.var, {
                        name: event.var,
                        value: event.value,
                        type: 'map',
                        lineChanged: event.line
                    });
                } else {
                    variableStates.set(event.var, {
                        name: event.var,
                        value: event.value,
                        type: 'object',
                        lineChanged: event.line
                    });
                }
            }
            // Check if it's a map JSON string (backup path)
            else if (typeof event.value === 'string' && event.value.startsWith('{') && event.value.includes(':')) {
                try {
                    const parsedValue: unknown = JSON.parse(event.value);
                    if (parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)) {
                        const mapObj = parsedValue as Record<string, number>;
                        mapStates.set(event.var, mapObj);
                        variableStates.set(event.var, {
                            name: event.var,
                            value: mapObj,
                            type: 'map',
                            lineChanged: event.line
                        });
                    }
                } catch {
                    variableStates.set(event.var, {
                        name: event.var,
                        value: event.value,
                        type: 'primitive',
                        lineChanged: event.line
                    });
                }
            }
            // Check if it's an array (already parsed as JS array)
            else if (Array.isArray(event.value)) {
                arrayStates.set(event.var, event.value);
                variableStates.set(event.var, {
                    name: event.var,
                    value: event.value,
                    type: 'array',
                    lineChanged: event.line
                });
            }
            // Check if it's an array string (starts with '[')
            else if (typeof event.value === 'string' && event.value.startsWith('[')) {
                const arrayValues = parseArrayString(event.value);
                arrayStates.set(event.var, arrayValues);
                variableStates.set(event.var, {
                    name: event.var,
                    value: arrayValues,
                    type: 'array',
                    lineChanged: event.line
                });
            } else {
                variableStates.set(event.var, {
                    name: event.var,
                    value: event.value,
                    type: 'primitive',
                    lineChanged: event.line
                });
            }
        }

        // Create execution frame
        const frame: ExecutionFrame = {
            step_id: event.step_id,
            line: event.line,
            function: event.function,
            callStack: currentCallStack,
            variables: new Map(variableStates),
            arrayStates: new Map(arrayStates),
            mapStates: new Map(mapStates),
            eventType: event.type
        };
            
        frames.push(frame);
    }
    
    return {
        frames,
        totalSteps: frames.length,
        error: frames.length === 0 ? 'No execution frames captured' : undefined
    };
}

export function parseExecutionTrace(stdout: string): ExecutionTrace {
    const events: TraceEvent[] = [];
    
    for (const line of stdout.split('\n')) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('{') || !trimmedLine.endsWith('}')) continue;
        
        try {
            const parsed: unknown = JSON.parse(trimmedLine);
            if (isTraceEvent(parsed)) {
                events.push(parsed);
            }
        } catch {
            // Ignore non-JSON lines from user programs.
        }
    }
    
    return parseTraceEvents(events);
}

// Get state at specific step
export function getFrameAtStep(trace: ExecutionTrace, stepId: number): ExecutionFrame | undefined {
    return trace.frames.find(f => f.step_id === stepId);
}

// Get variables that changed in this frame compared to previous
export function getChangedVariables(
    current: ExecutionFrame, 
    previous?: ExecutionFrame
): Variable[] {
    if (!previous) {
        return Array.from(current.variables.values());
    }
    
    const changed: Variable[] = [];
    for (const [name, value] of current.variables) {
        const prevValue = previous.variables.get(name);
        if (!prevValue || JSON.stringify(prevValue.value) !== JSON.stringify(value.value)) {
            changed.push(value);
        }
    }
    return changed;
}

// Format value for display
export function formatValue(value: TraceValue): string {
    if (value === null || value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

// Get memory state (variables + arrays) at specific step
export function getMemoryState(trace: ExecutionTrace, stepId: number) {
    const frame = getFrameAtStep(trace, stepId);
    if (!frame) return null;
    
    return {
        localVariables: Array.from(frame.variables.values()).filter(v => v.type === 'primitive'),
        arrays: Array.from(frame.arrayStates.entries()).map(([name, values]) => ({
            name,
            values,
            variable: frame.variables.get(name)
        })),
        maps: Array.from(frame.mapStates.entries()).map(([name, entries]) => ({
            name,
            entries,
            variable: frame.variables.get(name)
        }))
    };
}
