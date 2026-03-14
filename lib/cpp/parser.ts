// Enhanced parser for AlgoLens execution traces

export interface Variable {
    name: string;
    value: any;
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
    eventType: 'step' | 'var_change' | 'array_change' | 'map_change' | 'function_call' | 'function_return' | 'line';
}

export interface ExecutionTrace {
    frames: ExecutionFrame[];
    totalSteps: number;
    error?: string;
}

export function parseExecutionTrace(stdout: string): ExecutionTrace {
    const frames: ExecutionFrame[] = [];
    const variableStates = new Map<string, Variable>();
    const arrayStates = new Map<string, number[]>();
    const mapStates = new Map<string, Record<string | number, number>>();
    let currentCallStack: string[] = ['main'];
    
    const lines = stdout.split('\n');
    
    for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
            const event = JSON.parse(line);
            
            // Update call stack from event
            if (event.call_stack) {
                currentCallStack = event.call_stack;
            }
            
            // Track variable changes
            if (event.var && event.value !== undefined) {
                // Check if event type explicitly indicates it's a map
                if (event.type === 'map_change') {
                    if (typeof event.value === 'object' && event.value !== null) {
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
                    // Check if it looks like a map (has numeric keys or is empty object from map)
                    const keys = Object.keys(event.value);
                    const looksLikeMap = keys.length === 0 || keys.every((k) => /^\d+$/.test(k) && typeof event.value[k] === 'number');
                    
                    if (looksLikeMap) {
                        mapStates.set(event.var, event.value);
                        variableStates.set(event.var, {
                            name: event.var,
                            value: event.value,
                            type: 'map',
                            lineChanged: event.line
                        });
                    } else {
                        // Other objects - treat as generic object type
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
                        const mapObj = JSON.parse(event.value);
                        mapStates.set(event.var, mapObj);
                        variableStates.set(event.var, {
                            name: event.var,
                            value: mapObj,
                            type: 'map',
                            lineChanged: event.line
                        });
                    } catch {
                        // If not valid JSON, treat as primitive
                        variableStates.set(event.var, {
                            name: event.var,
                            value: event.value,
                            type: 'primitive',
                            lineChanged: event.line
                        });
                    }
                }
                // Check if it's an array (starts with '[')
                else if (typeof event.value === 'string' && event.value.startsWith('[')) {
                    const arrayStr = event.value.slice(1, -1);
                    const arrayValues = arrayStr.split(',').map((v: string) => parseInt(v) || 0);
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
                step_id: event.step_id || frames.length,
                line: event.line || 0,
                function: event.function || 'main',
                callStack: currentCallStack,
                variables: new Map(variableStates),
                arrayStates: new Map(arrayStates),
                mapStates: new Map(mapStates),
                eventType: event.type || 'step'
            };
            
            frames.push(frame);
        } catch (e) {
            // Ignore non-JSON lines (like regular console output)
            continue;
        }
    }
    
    return {
        frames,
        totalSteps: frames.length,
        error: frames.length === 0 ? 'No execution frames captured' : undefined
    };
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
export function formatValue(value: any): string {
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