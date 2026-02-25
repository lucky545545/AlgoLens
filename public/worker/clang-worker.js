// Stub out variables expected by the specific wasm-clang API we downloaded
let term = { write: () => { } };
let canvas = { width: 0, height: 0 };
let ctx2d = { clearRect: () => { } };

importScripts('../wasm/wasm-clang.js'); // The wrapper for clang.wasm

let output = '';

const apiOptions = {
    async readBuffer(filename) {
        const response = await fetch(`../wasm/${filename}`);
        if (!response.ok) throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
        return response.arrayBuffer();
    },
    async compileStreaming(filename) {
        const response = await fetch(`../wasm/${filename}`);
        if (!response.ok) throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
        return WebAssembly.compile(await response.arrayBuffer());
    },
    hostWrite(s) {
        output += s;
        self.postMessage({ type: 'stdout', message: s });
    }
};

const api = new API(apiOptions);

self.onmessage = async (e) => {
    const { code } = e.data;
    output = '';

    try {
        self.postMessage({ type: 'STATUS', message: 'Compiling and Running...' });

        // This will run the compiler, link it, and execute it!
        // The output is piped to hostWrite
        await api.compileLinkRun(code);

        self.postMessage({ type: 'SUCCESS', stdout: output });
    } catch (err) {
        self.postMessage({ type: 'ERROR', stderr: err.message || JSON.stringify(err), stdout: output });
    }
};