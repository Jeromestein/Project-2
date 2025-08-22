// Dashboard functionality

// Load dashboard
async function loadDashboard() {
    if (!app.currentUser) {
        app.showAlert('Please login to access dashboard', 'warning');
        return;
    }
    
    await Promise.all([
        loadDashboardStats(),
        loadUserPosts()
    ]);
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/posts/user/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const posts = data.posts;
            
            // Calculate stats
            const totalPosts = posts.length;
            const publishedPosts = posts.filter(post => post.status === 'published').length;
            const draftPosts = posts.filter(post => post.status === 'draft').length;
            const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
            
            // Update stats display
            document.getElementById('total-posts').textContent = totalPosts;
            document.getElementById('published-posts').textContent = publishedPosts;
            document.getElementById('draft-posts').textContent = draftPosts;
            document.getElementById('total-views').textContent = totalViews;
        } else {
            app.showAlert('Failed to load dashboard stats', 'danger');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        app.showAlert('Failed to load dashboard stats', 'danger');
    }
}

// Load user's posts
async function loadUserPosts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/posts/user/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderUserPosts(data.posts);
        } else {
            app.showAlert('Failed to load your posts', 'danger');
        }
    } catch (error) {
        console.error('Error loading user posts:', error);
        app.showAlert('Failed to load your posts', 'danger');
    }
}

// Render user's posts in dashboard
function renderUserPosts(posts) {
    const container = document.getElementById('user-posts-container');
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-edit fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No posts yet</h4>
                <p class="text-muted">Start writing your first blog post!</p>
                <button class="btn btn-primary" onclick="app.showCreatePostModal()">
                    <i class="fas fa-plus me-1"></i>Create Your First Post
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Likes</th>
                        <th>Comments</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="fw-bold">${post.title}</div>
                                        <small class="text-muted">${post.category}</small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="badge ${post.status === 'published' ? 'bg-success' : 'bg-warning'}">
                                    ${post.status}
                                </span>
                            </td>
                            <td>${post.views}</td>
                            <td>${post.likeCount}</td>
                            <td>${post.commentCount}</td>
                            <td>${app.formatDate(post.createdAt)}</td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button class="btn btn-outline-primary" onclick="app.showPostDetail('${post.slug}')" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary" onclick="app.showEditPostModal('${post._id}')" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="app.deletePost('${post._id}')" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Add dashboard functions to app object when it's available
function addFunctionsToApp() {
    if (typeof window.app !== 'undefined') {
        window.app.loadDashboard = loadDashboard;
    } else {
        // Retry after a short delay
        setTimeout(addFunctionsToApp, 100);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', addFunctionsToApp);
