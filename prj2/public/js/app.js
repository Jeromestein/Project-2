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
        console.log('Initializing BlogApp...');
        this.setupEventListeners();
        this.checkAuthStatus();
        this.loadHomePage();
        this.setupPWA();
        console.log('BlogApp initialized successfully');
    }

    setupEventListeners() {
        // Navigation - with null checks
        const navHome = document.getElementById('nav-home');
        if (navHome) {
            navHome.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('home');
            });
        }

        const navDashboard = document.getElementById('nav-dashboard');
        if (navDashboard) {
            navDashboard.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('dashboard');
            });
        }

        const navProfile = document.getElementById('nav-profile');
        if (navProfile) {
            navProfile.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('profile');
            });
        }

        const navContact = document.getElementById('nav-contact');
        if (navContact) {
            console.log('Contact link found:', navContact);
            navContact.addEventListener('click', (e) => {
                console.log('Contact nav link clicked');
                e.preventDefault();
                this.showPage('contact');
            });
        } else {
            console.error('Contact link not found!');
        }

        // Breadcrumb navigation
        const breadcrumbHome = document.getElementById('breadcrumb-home');
        if (breadcrumbHome) {
            breadcrumbHome.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('home');
            });
        }

        // Contact page buttons will be set up when contact page is loaded

        const navNewPost = document.getElementById('nav-new-post');
        if (navNewPost) {
            navNewPost.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCreatePostModal();
            });
        }

        const navLogout = document.getElementById('nav-logout');
        if (navLogout) {
            navLogout.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Search and filters
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchPosts();
            });
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchPosts();
                }
            });
        }

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
        const createPostBtn = document.getElementById('create-post-btn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => {
                this.showCreatePostModal();
            });
        }

        // Edit profile button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfileForm();
            });
        }

        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // Post form
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePost();
            });
        }

        // Comment form
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addComment();
            });
        }

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }

        // Back to top button
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
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
        console.log('showPage called with:', page);
        
        // Hide all pages
        document.querySelectorAll('[id$="-page"]').forEach(pageElement => {
            pageElement.classList.add('d-none');
        });

        // Show selected page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.remove('d-none');
            console.log(`Showing page: ${page}-page`);
        } else {
            console.error(`Page element not found: ${page}-page`);
        }
        
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
            case 'contact':
                this.loadContactPage();
                break;
        }
    }

    async loadHomePage() {
        console.log('Loading home page...');
        // Force immediate execution
        this.loadSamplePosts();
        this.loadSampleCategories();
        this.loadSampleTags();
    }

    loadSamplePosts() {
        const samplePosts = [
            {
                title: "How to Overcome Creative Blocks & Find Inspiration",
                author: "Anna Maria Lopez",
                date: "Mar 15, 2022",
                readTime: "10 min read",
                excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                image: "/images/placeholder-1.jpg"
            },
            {
                title: "Unusual Uses for Everyday Household Items",
                author: "Bob Jones",
                date: "Feb 18, 2022",
                readTime: "9 min read",
                excerpt: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                image: "/images/placeholder-2.jpg"
            },
            {
                title: "Spectacular Natural Wonders Everyone Should See",
                author: "John Alvarez",
                date: "Mar 18, 2022",
                readTime: "16 min read",
                excerpt: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
                image: "/images/placeholder-3.jpg"
            }
        ];

        // Set the posts to the instance variable so renderPosts works correctly
        this.posts = samplePosts;
        this.renderSamplePosts(samplePosts);
    }

    renderSamplePosts(posts) {
        const container = document.getElementById('posts-container');
        console.log('Rendering sample posts...', container);
        console.log('Posts data:', posts);
        
        if (!container) {
            console.error('Posts container not found!');
            return;
        }
        
        container.innerHTML = `
            <div class="row">
                ${posts.map(post => `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="article-card">
                            <div class="article-image">
                                <img src="${post.image}" alt="${post.title}" class="w-100 h-100 object-fit-cover">
                            </div>
                            <div class="article-content">
                                <h3 class="article-title">${post.title}</h3>
                                <div class="article-meta">
                                    <span class="article-author">${post.author}</span>
                                    <span class="article-date">• ${post.date}</span>
                                    <span class="article-read-time">• ${post.readTime}</span>
                                </div>
                                <p class="article-excerpt">${post.excerpt}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    loadSampleCategories() {
        const categories = [
            'Technology',
            'Design',
            'Business',
            'Lifestyle',
            'Travel',
            'Food',
            'Health',
            'Education'
        ];

        const container = document.getElementById('categories-list');
        if (container) {
            container.innerHTML = categories.map(category => `
                <a href="#" class="category-item d-block py-2 text-decoration-none">
                    <i class="fas fa-folder me-2"></i>${category}
                </a>
            `).join('');
        }
    }

    loadSampleTags() {
        const tags = [
            'JavaScript',
            'React',
            'Node.js',
            'CSS',
            'HTML',
            'Design',
            'UX',
            'UI',
            'Web Development',
            'Programming'
        ];

        const container = document.getElementById('tags-list');
        if (container) {
            container.innerHTML = tags.map(tag => `
                <a href="#" class="tag-item d-block py-2 text-decoration-none">
                    <i class="fas fa-tag me-2"></i>${tag}
                </a>
            `).join('');
        }
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

    loadContactPage() {
        console.log('Loading contact page...');
        
        // Remove existing event listeners to prevent duplicates
        const faqBtn = document.getElementById('faq-btn');
        const prBtn = document.getElementById('pr-btn');
        const salesBtn = document.getElementById('sales-btn');
        
        if (faqBtn) {
            // Remove existing listeners
            faqBtn.replaceWith(faqBtn.cloneNode(true));
            const newFaqBtn = document.getElementById('faq-btn');
            newFaqBtn.addEventListener('click', () => {
                this.showAlert('FAQ page is coming soon!', 'info');
            });
        }
        
        if (prBtn) {
            // Remove existing listeners
            prBtn.replaceWith(prBtn.cloneNode(true));
            const newPrBtn = document.getElementById('pr-btn');
            newPrBtn.addEventListener('click', () => {
                this.showAlert('PR contact form will be available soon!', 'info');
            });
        }
        
        if (salesBtn) {
            // Remove existing listeners
            salesBtn.replaceWith(salesBtn.cloneNode(true));
            const newSalesBtn = document.getElementById('sales-btn');
            newSalesBtn.addEventListener('click', () => {
                this.showAlert('Sales contact form will be available soon!', 'info');
            });
        }
    }

    handleContactForm() {
        const formData = {
            fullName: document.getElementById('contact-full-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            message: document.getElementById('contact-message').value,
            notRobot: document.getElementById('contact-not-robot').checked
        };

        // Basic validation
        if (!formData.fullName || !formData.email || !formData.message || !formData.notRobot) {
            this.showAlert('Please fill in all required fields and confirm you are not a robot.', 'warning');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            this.showAlert('Please enter a valid email address.', 'warning');
            return;
        }

        // Simulate form submission
        this.showAlert('Thank you for your message! We will get back to you soon.', 'success');
        
        // Clear form
        document.getElementById('contact-form').reset();
        
        // In a real application, you would send this data to your server
        console.log('Contact form submitted:', formData);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    const app = new BlogApp();
    window.app = app;
});
