// src/lib/client-runner.ts

export interface RunResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    error?: string;
}

export async function runCppInBrowser(code: string): Promise<RunResult> {
    return new Promise((resolve) => {
        const worker = new Worker('/worker/clang-worker.js');
        let fullStdout = '';

        worker.onerror = (err) => {
            resolve({ stdout: "", stderr: `Worker failed to load: ${err.message}`, exitCode: 1 });
            worker.terminate();
        };

        worker.postMessage({ code });

        worker.onmessage = (e) => {
            const data = e.data;
            if (data.type === 'STATUS') {
                return; // We can ignore status messages or log them somewhere
            }
            if (data.type === 'stdout') {
                fullStdout += data.message;
                return;
            }
            if (data.type === 'ERROR') {
                resolve({
                    stdout: fullStdout || data.stdout || "",
                    stderr: data.stderr || data.message || "Unknown error",
                    exitCode: 1
                });
                worker.terminate();
                return;
            }
            if (data.type === 'SUCCESS') {
                resolve({
                    stdout: data.stdout || fullStdout,
                    stderr: "",
                    exitCode: 0
                });
                worker.terminate();
                return;
            }
        };
    });
}

