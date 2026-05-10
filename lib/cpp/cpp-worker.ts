import { twrWasmModule } from "twr-wasm";

const mod = new twrWasmModule();

self.onmessage = async (e: MessageEvent) => {
    const { type, code } = e.data;

    if (type === 'RUN_CODE') {
        try {
            await mod.loadWasm("./mycode.wasm")

            // MOCK EXECUTION FOR NOW
            const mockStdout = `Executed code:\n${code}\nResult: 0`;

            self.postMessage({
                stdout: mockStdout,
                stderr: "",
                exitCode: 0
            });
        } catch (err) {
            self.postMessage({
                stdout: "",
                stderr: err instanceof Error ? err.message : "Unknown worker error",
                exitCode: 1
            });
        }
    }
};
