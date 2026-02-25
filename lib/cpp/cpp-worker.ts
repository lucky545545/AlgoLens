// src/lib/cpp-worker.ts
/* eslint-disable no-restricted-globals */
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
        } catch (err: any) {
            self.postMessage({
                stdout: "",
                stderr: err.message,
                exitCode: 1
            });
        }
    }
};