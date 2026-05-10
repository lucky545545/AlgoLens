// Safe debugging utility for map visualization.
// Only logs in browser development when explicitly enabled.

class MapVisDebugger {
    private enabled: boolean;
    
    constructor() {
        this.enabled = typeof window !== 'undefined' && 
                       process.env.NODE_ENV === 'development' &&
                       localStorage?.getItem('MAP_VIS_DEBUG') === 'true';
    }
    
    log(message: string, data?: unknown) {
        if (!this.enabled) return;
        
        if (data) {
            console.log(`[MapVis] ${message}`, data);
        } else {
            console.log(`[MapVis] ${message}`);
        }
    }
    
    logParser(message: string, data?: unknown) {
        this.log(`[Parser] ${message}`, data);
    }
    
    logVisualizer(message: string, data?: unknown) {
        this.log(`[Visualizer] ${message}`, data);
    }
    
    enable() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('MAP_VIS_DEBUG', 'true');
            this.enabled = true;
            console.log('Map Visualization Debugging ENABLED');
        }
    }
    
    disable() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('MAP_VIS_DEBUG');
            this.enabled = false;
            console.log('Map Visualization Debugging DISABLED');
        }
    }
}

export const mapVisDebug = new MapVisDebugger();
