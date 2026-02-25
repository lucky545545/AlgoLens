export async function compileAndRun(userCode: string) {
    // 1. Fetch the compiler components (stored in your /public folder)
    const worker = new Worker(new URL('./compiler-worker.ts', import.meta.url));

    return new Promise((resolve, reject) => {
        worker.postMessage({
            type: 'COMPILE_AND_RUN',
            code: userCode,
        });

        worker.onmessage = (e) => {
            const { success, stdout, stderr, error } = e.data;
            if (success) resolve({ stdout, stderr });
            else reject(error);
        };
    });
}