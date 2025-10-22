/* ========================================== */
/* ALBO SOLUTIONS - PLATFORM ROUTER */
/* Client-side Navigation ohne Page Reload */
/* ========================================== */

class PlatformRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.contentArea = null;
        
        console.log('🚀 Platform Router initialized');
    }

    /**
     * Register a route handler
     */
    register(path, handler) {
        this.routes.set(path, handler);
        console.log(`✅ Route registered: ${path}`);
    }

    /**
     * Navigate to a route
     */
    async navigate(path, pushState = true) {
        console.log(`🔄 Navigating to: ${path}`);
        
        const handler = this.routes.get(path);
        
        if (!handler) {
            console.error(`❌ Route not found: ${path}`);
            this.navigate('landing'); // Fallback
            return;
        }

        // Update URL without reload (optional)
        if (pushState && history.pushState) {
            history.pushState({ path }, '', `?section=${path}`);
        }

        // Call handler
        try {
            await handler();
            this.currentRoute = path;
            console.log(`✅ Navigation complete: ${path}`);
        } catch (error) {
            console.error(`❌ Navigation error for ${path}:`, error);
        }
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Set content area
     */
    setContentArea(element) {
        this.contentArea = element;
    }

    /**
     * Initialize router from URL
     */
    initFromURL() {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section') || 'landing';
        
        console.log(`🔗 Init from URL: ${section}`);
        this.navigate(section, false);
    }
}

// Create global router instance
window.platformRouter = new PlatformRouter();

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.path) {
        window.platformRouter.navigate(event.state.path, false);
    }
});

console.log('✅ Platform Router loaded');