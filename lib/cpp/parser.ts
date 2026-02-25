export interface VisualStep {
    id: number;
    value: number;
    label: string;
}

export function parseStdoutToSteps(stdout: string): VisualStep[] {
    // Use Regex to find "Step X" patterns
    const stepRegex = /Step (\d+)/g;
    const matches = [...stdout.matchAll(stepRegex)];

    return matches.map((match, index) => ({
        id: index,
        value: parseInt(match[1]),
        label: `Iteration ${match[1]}`
    }));
}