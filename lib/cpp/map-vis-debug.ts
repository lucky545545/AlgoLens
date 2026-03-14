// Safe debugging utility for map visualization
// Only logs in browser environment and can be toggled on/off

class MapVisDebugger {
    private enabled: boolean;
    
    constructor() {
        // Only enable in development and browser environment
        this.enabled = typeof window !== 'undefined' && 
                       process.env.NODE_ENV === 'development' &&
                       localStorage?.getItem('MAP_VIS_DEBUG') === 'true';
    }
    
    log(message: string, data?: any) {
        if (!this.enabled) return;
        
        if (data) {
            console.log(`[MapVis] ${message}`, data);
        } else {
            console.log(`[MapVis] ${message}`);
        }
    }
    
    logParser(message: string, data?: any) {
        this.log(`[Parser] ${message}`, data);
    }
    
    logVisualizer(message: string, data?: any) {
        this.log(`[Visualizer] ${message}`, data);
    }
    
    enable() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('MAP_VIS_DEBUG', 'true');
            this.enabled = true;
            console.log('✓ Map Visualization Debugging ENABLED');
        }
    }
    
    disable() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('MAP_VIS_DEBUG');
            this.enabled = false;
            console.log('✓ Map Visualization Debugging DISABLED');
        }
    }
}

export const mapVisDebug = new MapVisDebugger();

// Usage in browser console:
// mapVisDebug.enable()  - to start debugging
// mapVisDebug.disable() - to stop debugging
// Then refresh the page and you'll see [MapVis] logs
