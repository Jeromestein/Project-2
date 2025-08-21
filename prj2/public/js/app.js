// Main application JavaScript file

class BlogApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.currentPostId = null;
        this.posts = [];
        this.categories = [];
        this.tags = [];
        this.currentPageNumber = 1;
        this.searchQuery = '';
        this.sortBy = 'newest';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.loadHomePage();
        this.setupPWA();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('nav-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('home');
        });

        document.getElementById('nav-dashboard').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('dashboard');
        });

        document.getElementById('nav-profile').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('profile');
        });

        document.getElementById('nav-new-post').addEventListener('click', (e) => {
            e.preventDefault();
            this.showCreatePostModal();
        });

        document.getElementById('nav-logout').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Search and filters
        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchPosts();
        });

        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchPosts();
            }
        });

        // Sort buttons
        document.querySelectorAll('[data-sort]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.sortBy = e.target.dataset.sort;
                this.loadPosts();
            });
        });

        // Create post button
        document.getElementById('create-post-btn').addEventListener('click', () => {
            this.showCreatePostModal();
        });

        // Edit profile button
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            this.showEditProfileForm();
        });

        // Profile form
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Post form
        document.getElementById('post-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePost();
        });

        // Comment form
        document.getElementById('comment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addComment();
        });
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.user;
                    this.updateUIForAuthenticatedUser();
                } else {
                    localStorage.removeItem('token');
                    this.updateUIForUnauthenticatedUser();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                this.updateUIForUnauthenticatedUser();
            }
        } else {
            this.updateUIForUnauthenticatedUser();
        }
    }

    updateUIForAuthenticatedUser() {
        document.getElementById('auth-buttons').classList.add('d-none');
        document.getElementById('user-menu').classList.remove('d-none');
        document.getElementById('user-username').textContent = this.currentUser.username;
        
        // Show/hide comment form based on authentication
        const commentFormContainer = document.getElementById('comment-form-container');
        if (commentFormContainer) {
            commentFormContainer.classList.remove('d-none');
        }
    }

    updateUIForUnauthenticatedUser() {
        document.getElementById('auth-buttons').classList.remove('d-none');
        document.getElementById('user-menu').classList.add('d-none');
        this.currentUser = null;
        
        // Hide comment form for unauthenticated users
        const commentFormContainer = document.getElementById('comment-form-container');
        if (commentFormContainer) {
            commentFormContainer.classList.add('d-none');
        }
    }

    showPage(page) {
        // Hide all pages
        document.querySelectorAll('[id$="-page"]').forEach(pageElement => {
            pageElement.classList.add('d-none');
        });

        // Show selected page
        document.getElementById(`${page}-page`).classList.remove('d-none');
        this.currentPage = page;

        // Load page-specific content
        switch (page) {
            case 'home':
                this.loadHomePage();
                break;
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }

    async loadHomePage() {
        await this.loadPosts();
        await this.loadCategories();
        await this.loadTags();
    }

    async loadPosts() {
        try {
            const params = new URLSearchParams({
                page: this.currentPageNumber,
                limit: 10,
                sort: this.sortBy
            });

            if (this.searchQuery) {
                params.append('search', this.searchQuery);
            }

            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`/api/posts?${params}`, { headers });
            const data = await response.json();

            if (response.ok) {
                this.posts = data.posts;
                this.renderPosts();
                this.renderPagination(data.pagination);
            } else {
                this.showAlert('Failed to load posts', 'danger');
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showAlert('Failed to load posts', 'danger');
        }
    }

    renderPosts() {
        const container = document.getElementById('posts-container');
        
        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No posts found</h4>
                    <p class="text-muted">Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.posts.map(post => `
            <div class="card post-card" onclick="app.showPostDetail('${post.slug}')">
                <div class="card-body">
                    <div class="post-meta">
                        <span><i class="fas fa-user"></i>${post.author.firstName} ${post.author.lastName}</span>
                        <span><i class="fas fa-calendar"></i>${this.formatDate(post.createdAt)}</span>
                        <span><i class="fas fa-eye"></i>${post.views} views</span>
                        <span><i class="fas fa-heart"></i>${post.likeCount} likes</span>
                        <span><i class="fas fa-comment"></i>${post.commentCount} comments</span>
                    </div>
                    
                    <h5 class="card-title">${post.title}</h5>
                    
                    ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ''}
                    
                    <div class="post-tags">
                        ${post.tags.map(tag => `
                            <a href="#" class="post-tag" onclick="event.stopPropagation(); app.filterByTag('${tag}')">
                                #${tag}
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        
        if (pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        if (pagination.hasPrev) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="app.goToPage(${pagination.currentPage - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        // Page numbers
        for (let i = 1; i <= pagination.totalPages; i++) {
            if (i === pagination.currentPage) {
                paginationHTML += `
                    <li class="page-item active">
                        <span class="page-link">${i}</span>
                    </li>
                `;
            } else {
                paginationHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="app.goToPage(${i})">${i}</a>
                    </li>
                `;
            }
        }

        // Next button
        if (pagination.hasNext) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="app.goToPage(${pagination.currentPage + 1})">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }

        container.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPageNumber = page;
        this.loadPosts();
    }

    searchPosts() {
        this.searchQuery = document.getElementById('search-input').value.trim();
        this.currentPageNumber = 1;
        this.loadPosts();
    }

    filterByTag(tag) {
        this.searchQuery = tag;
        this.currentPageNumber = 1;
        this.loadPosts();
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            
            if (response.ok) {
                const categories = [...new Set(data.posts.map(post => post.category))];
                this.renderCategories(categories);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderCategories(categories) {
        const container = document.getElementById('categories-list');
        container.innerHTML = categories.map(category => `
            <a href="#" class="category-item" onclick="app.filterByCategory('${category}')">
                <i class="fas fa-folder me-2"></i>${category}
            </a>
        `).join('');
    }

    filterByCategory(category) {
        this.searchQuery = category;
        this.currentPageNumber = 1;
        this.loadPosts();
    }

    async loadTags() {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            
            if (response.ok) {
                const allTags = data.posts.flatMap(post => post.tags);
                const tagCounts = {};
                allTags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
                
                const sortedTags = Object.entries(tagCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([tag]) => tag);
                
                this.renderTags(sortedTags);
            }
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    }

    renderTags(tags) {
        const container = document.getElementById('tags-list');
        container.innerHTML = tags.map(tag => `
            <a href="#" class="tag-item" onclick="app.filterByTag('${tag}')">
                <i class="fas fa-tag me-2"></i>#${tag}
            </a>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('main .container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }

        // Handle install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // Show install button if needed
        });
    }

    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        this.updateUIForUnauthenticatedUser();
        this.showAlert('Logged out successfully', 'success');
        
        if (this.currentPage === 'dashboard' || this.currentPage === 'profile') {
            this.showPage('home');
        }
    }
}

// Initialize the app
const app = new BlogApp();

// Make app globally available for event handlers
window.app = app;
