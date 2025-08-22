// Authentication functionality for TechBlog Hub

// Global authentication state
const auth = {
    currentUser: null,
    token: localStorage.getItem('token'),
    
    // Initialize authentication
    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    },
    
    // Check if user is authenticated
    checkAuthStatus() {
        if (this.token) {
            this.validateToken();
        }
    },
    
    // Validate stored token
    async validateToken() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.updateUIForAuthenticatedUser();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Token validation error:', error);
            this.logout();
        }
    },
    
    // Setup event listeners for forms
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Logout button
        const logoutBtn = document.querySelector('[data-action="logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    },
    
    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;
        const rememberMe = document.getElementById('rememberMe')?.checked;
        
        if (!email || !password) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, rememberMe })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                
                if (rememberMe) {
                    localStorage.setItem('token', data.token);
                } else {
                    sessionStorage.setItem('token', data.token);
                }
                
                this.showAlert('Login successful! Welcome back.', 'success');
                this.updateUIForAuthenticatedUser();
                
                // Redirect to dashboard or home page
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                this.showAlert(data.message || 'Login failed. Please check your credentials.', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Login failed. Please try again.', 'danger');
        }
    },
    
    // Handle register form submission
    async handleRegister(e) {
        e.preventDefault();
        
        const formData = {
            fullName: document.getElementById('fullName')?.value,
            email: document.getElementById('registerEmail')?.value,
            password: document.getElementById('registerPassword')?.value,
            confirmPassword: document.getElementById('confirmPassword')?.value,
            newsletter: document.getElementById('newsletter')?.checked,
            termsAgreement: document.getElementById('termsAgreement')?.checked
        };
        
        // Validation
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            this.showAlert('Passwords do not match', 'danger');
            return;
        }
        
        if (!formData.termsAgreement) {
            this.showAlert('Please agree to the Terms of Service and Privacy Policy', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    newsletter: formData.newsletter
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', data.token);
                
                this.showAlert('Registration successful! Welcome to TechBlog Hub.', 'success');
                this.updateUIForAuthenticatedUser();
                
                // Redirect to dashboard or home page
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                this.showAlert(data.message || 'Registration failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('Registration failed. Please try again.', 'danger');
        }
    },
    
    // Handle logout
    handleLogout(e) {
        e.preventDefault();
        this.logout();
    },
    
    // Logout user
    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        this.updateUIForUnauthenticatedUser();
        this.showAlert('You have been logged out successfully.', 'info');
        
        // Redirect to home page
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    },
    
    // Update UI for authenticated user
    updateUIForAuthenticatedUser() {
        const authButtons = document.querySelector('.auth-icons');
        if (authButtons && this.currentUser) {
            authButtons.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user me-1"></i>
                        ${this.currentUser.fullName || this.currentUser.email}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="/dashboard.html">
                            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                        </a></li>
                        <li><a class="dropdown-item" href="/profile.html">
                            <i class="fas fa-user-edit me-2"></i>Profile
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" data-action="logout">
                            <i class="fas fa-sign-out-alt me-2"></i>Logout
                        </a></li>
                    </ul>
                </div>
            `;
            
            // Re-attach logout event listener
            const logoutBtn = authButtons.querySelector('[data-action="logout"]');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
            }
        }
    },
    
    // Update UI for unauthenticated user
    updateUIForUnauthenticatedUser() {
        const authButtons = document.querySelector('.auth-icons');
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="/login.html" class="btn btn-outline-primary btn-sm" title="Login">
                    <i class="fas fa-sign-in-alt me-1"></i>
                    Login
                </a>
                <a href="/register.html" class="btn btn-primary btn-sm" title="Register">
                    <i class="fas fa-user-plus me-1"></i>
                    Register
                </a>
            `;
        }
    },
    
    // Show alert message
    showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Add to page
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser && !!this.token;
    },
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },
    
    // Get auth token
    getToken() {
        return this.token;
    }
};

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
});

// Export for use in other modules
window.auth = auth;
