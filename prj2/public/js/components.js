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
        // Update header based on authentication status
        this.updateAuthButtons();
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

    // Check if user is logged in
    static isLoggedIn() {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser !== null;
    }

    // Get current user data
    static getCurrentUser() {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
    }

    // Update authentication buttons in header
    static updateAuthButtons() {
        const authButtonsContainer = document.getElementById('auth-buttons');
        if (!authButtonsContainer) return;

        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            authButtonsContainer.innerHTML = `
                <span class="navbar-text me-3">Welcome, ${user.fullName}</span>
                <button class="btn btn-outline-danger btn-sm" onclick="AuthManager.logout()">
                    Logout
                </button>
            `;
        } else {
            authButtonsContainer.innerHTML = `
                <a href="/login.html" class="btn btn-outline-primary btn-sm" title="Login">
                    Login
                </a>
                <a href="/register.html" class="btn btn-primary btn-sm" title="Register">
                    Register
                </a>
            `;
        }
    }

    // Logout function
    static logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberedUser');
        this.updateAuthButtons();
        window.location.href = '/';
    }
}

// Auth Manager for handling authentication
class AuthManager {
    static logout() {
        ComponentLoader.logout();
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    ComponentLoader.loadAll();
});
