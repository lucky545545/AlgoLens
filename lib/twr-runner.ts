import { twrWasmModule } from "twr-wasm";

type WasmArg = string | number | bigint | ArrayBuffer;

export async function runTwrWasm(wasmPath: string, functionName: string, args: WasmArg[] = []) {
    // 1. Create a new module instance
    const mod = new twrWasmModule();

    try {
        // 2. Load the pre-compiled .wasm file
        await mod.loadWasm(wasmPath);

        // 3. Call the C++ function
        // callC takes an array: [functionName, ...arguments]
        const result = await mod.callC([functionName, ...args]);

        return {
            success: true,
            result: result,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "WASM Execution failed",
        };
    }
}
