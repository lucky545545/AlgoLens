export type TraceEventType =
  | "step"
  | "var_declare"
  | "var_change"
  | "array_declare"
  | "array_change"
  | "map_change"
  | "function_call"
  | "function_return"
  | "line";

export type TraceValue =
  | string
  | number
  | boolean
  | null
  | number[]
  | Record<string, number>;

export interface TraceEvent {
  type: TraceEventType;
  step_id: number;
  line: number;
  function: string;
  call_stack: string[];
  var?: string;
  value?: TraceValue;
}

export interface TraceApiResponse {
  success: boolean;
  trace?: TraceEvent[];
  stdout?: string;
  stderr?: string;
  message?: string;
}

export function isTraceEvent(value: unknown): value is TraceEvent {
  if (!value || typeof value !== "object") return false;

  const event = value as Record<string, unknown>;
  return (
    typeof event.type === "string" &&
    typeof event.step_id === "number" &&
    typeof event.line === "number" &&
    typeof event.function === "string" &&
    Array.isArray(event.call_stack) &&
    event.call_stack.every((item) => typeof item === "string")
  );
}
