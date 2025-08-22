// Component loader for header and footer
class ComponentLoader {
    static async loadComponent(elementId, componentPath) {
        try {
            const response = await fetch(componentPath);
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
        } catch (error) {
            console.error(`Error loading component from ${componentPath}:`, error);
        }
    }

    static async loadHeader() {
        await this.loadComponent('header-container', '/components/header.html');
    }

    static async loadFooter() {
        await this.loadComponent('footer-container', '/components/footer.html');
    }

    static async loadAll() {
        await Promise.all([
            this.loadHeader(),
            this.loadFooter()
        ]);
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    ComponentLoader.loadAll();
});
