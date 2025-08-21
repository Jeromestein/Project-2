// Posts functionality

// Show post detail
async function showPostDetail(slug) {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`/api/posts/${slug}`, { headers });
        const data = await response.json();
        
        if (response.ok) {
            app.currentPostId = data.post._id;
            renderPostDetail(data.post);
            app.showPage('post-detail');
        } else {
            app.showAlert('Post not found', 'danger');
        }
    } catch (error) {
        console.error('Error loading post:', error);
        app.showAlert('Failed to load post', 'danger');
    }
}

function renderPostDetail(post) {
    // Render post content
    const contentContainer = document.getElementById('post-content');
    contentContainer.innerHTML = `
        <div class="post-header">
            <h1 class="post-title">${post.title}</h1>
            <div class="post-meta-detail">
                <span><i class="fas fa-user"></i>${post.author.firstName} ${post.author.lastName}</span>
                <span><i class="fas fa-calendar"></i>${app.formatDate(post.createdAt)}</span>
                <span><i class="fas fa-eye"></i>${post.views} views</span>
                <span><i class="fas fa-clock"></i>${post.readingTime} min read</span>
                <span><i class="fas fa-folder"></i>${post.category}</span>
            </div>
            ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="img-fluid rounded mb-3">` : ''}
        </div>
        
        <div class="post-content-detail">
            ${post.content}
        </div>
        
        <div class="d-flex justify-content-between align-items-center mt-4">
            <div class="post-tags">
                ${post.tags.map(tag => `
                    <a href="#" class="post-tag" onclick="app.filterByTag('${tag}')">
                        #${tag}
                    </a>
                `).join('')}
            </div>
            
            <button class="like-btn ${post.isLiked ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
                <i class="fas fa-heart"></i>
                <span id="like-count-${post._id}">${post.likeCount}</span>
            </button>
        </div>
    `;
    
    // Render post info sidebar
    const infoContainer = document.getElementById('post-info');
    infoContainer.innerHTML = `
        <div class="mb-3">
            <h6>Author</h6>
            <div class="d-flex align-items-center">
                <img src="${post.author.avatar || '/images/default-avatar.png'}" 
                     alt="${post.author.firstName}" 
                     class="rounded-circle me-2" 
                     width="40" height="40">
                <div>
                    <div class="fw-bold">${post.author.firstName} ${post.author.lastName}</div>
                    <small class="text-muted">@${post.author.username}</small>
                </div>
            </div>
        </div>
        
        <div class="mb-3">
            <h6>Category</h6>
            <a href="#" class="text-decoration-none" onclick="app.filterByCategory('${post.category}')">
                ${post.category}
            </a>
        </div>
        
        <div class="mb-3">
            <h6>Published</h6>
            <small class="text-muted">${app.formatDate(post.createdAt)}</small>
        </div>
        
        <div class="mb-3">
            <h6>Reading Time</h6>
            <small class="text-muted">${post.readingTime} minutes</small>
        </div>
    `;
    
    // Load comments
    loadComments(post._id);
}

// Like/Unlike post
async function toggleLike(postId) {
    if (!app.currentUser) {
        app.showAlert('Please login to like posts', 'warning');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update like button
            const likeBtn = document.querySelector(`[onclick="toggleLike('${postId}')"]`);
            const likeCount = document.getElementById(`like-count-${postId}`);
            
            if (data.isLiked) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }
            
            likeCount.textContent = data.likeCount;
        } else {
            app.showAlert(data.message || 'Failed to update like', 'danger');
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        app.showAlert('Failed to update like', 'danger');
    }
}

// Load comments
async function loadComments(postId) {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`/api/posts/${postId}`, { headers });
        const data = await response.json();
        
        if (response.ok) {
            renderComments(data.post.comments);
        } else {
            app.showAlert('Failed to load comments', 'danger');
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        app.showAlert('Failed to load comments', 'danger');
    }
}

function renderComments(comments) {
    const container = document.getElementById('comments-container');
    
    if (comments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-comments fa-2x text-muted mb-2"></i>
                <p class="text-muted">No comments yet. Be the first to comment!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.user.firstName} ${comment.user.lastName}</span>
                <span class="comment-date">${app.formatDate(comment.createdAt)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

// Add comment
async function addComment() {
    if (!app.currentUser) {
        app.showAlert('Please login to comment', 'warning');
        return;
    }
    
    const content = document.getElementById('comment-content').value.trim();
    
    if (!content) {
        app.showAlert('Please enter a comment', 'warning');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/posts/${app.currentPostId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Clear form
            document.getElementById('comment-content').value = '';
            
            // Reload comments
            loadComments(app.currentPostId);
            
            app.showAlert('Comment added successfully!', 'success');
        } else {
            app.showAlert(data.message || 'Failed to add comment', 'danger');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        app.showAlert('Failed to add comment', 'danger');
    }
}

// Create/Edit post modal
function showCreatePostModal() {
    if (!app.currentUser) {
        app.showAlert('Please login to create posts', 'warning');
        return;
    }
    
    // Reset form
    document.getElementById('post-form').reset();
    document.getElementById('post-modal-title').textContent = 'Create New Post';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('postModal'));
    modal.show();
}

function showEditPostModal(postId) {
    if (!app.currentUser) {
        app.showAlert('Please login to edit posts', 'warning');
        return;
    }
    
    // Load post data
    loadPostForEdit(postId);
    
    // Update modal title
    document.getElementById('post-modal-title').textContent = 'Edit Post';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('postModal'));
    modal.show();
}

async function loadPostForEdit(postId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/posts/${postId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const post = data.post;
            
            // Populate form
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-content').value = post.content;
            document.getElementById('post-excerpt').value = post.excerpt || '';
            document.getElementById('post-category').value = post.category;
            document.getElementById('post-status').value = post.status;
            document.getElementById('post-tags').value = post.tags.join(', ');
            document.getElementById('post-featured-image').value = post.featuredImage || '';
            
            // Store post ID for update
            app.currentPostId = postId;
        } else {
            app.showAlert('Failed to load post for editing', 'danger');
        }
    } catch (error) {
        console.error('Error loading post for edit:', error);
        app.showAlert('Failed to load post for editing', 'danger');
    }
}

// Save post (create or update)
async function savePost() {
    if (!app.currentUser) {
        app.showAlert('Please login to save posts', 'warning');
        return;
    }
    
    const formData = {
        title: document.getElementById('post-title').value,
        content: document.getElementById('post-content').value,
        excerpt: document.getElementById('post-excerpt').value,
        category: document.getElementById('post-category').value,
        status: document.getElementById('post-status').value,
        tags: document.getElementById('post-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        featuredImage: document.getElementById('post-featured-image').value
    };
    
    try {
        const token = localStorage.getItem('token');
        const method = app.currentPostId ? 'PUT' : 'POST';
        const url = app.currentPostId ? `/api/posts/${app.currentPostId}` : '/api/posts';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('postModal'));
            modal.hide();
            
            // Clear form
            document.getElementById('post-form').reset();
            
            // Reset current post ID
            app.currentPostId = null;
            
            app.showAlert(
                app.currentPostId ? 'Post updated successfully!' : 'Post created successfully!', 
                'success'
            );
            
            // Reload dashboard if on dashboard page
            if (app.currentPage === 'dashboard') {
                app.loadDashboard();
            }
        } else {
            app.showAlert(data.message || 'Failed to save post', 'danger');
        }
    } catch (error) {
        console.error('Error saving post:', error);
        app.showAlert('Failed to save post', 'danger');
    }
}

// Delete post
async function deletePost(postId) {
    if (!app.currentUser) {
        app.showAlert('Please login to delete posts', 'warning');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            app.showAlert('Post deleted successfully!', 'success');
            
            // Reload dashboard
            if (app.currentPage === 'dashboard') {
                app.loadDashboard();
            }
        } else {
            const data = await response.json();
            app.showAlert(data.message || 'Failed to delete post', 'danger');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        app.showAlert('Failed to delete post', 'danger');
    }
}

// Add these functions to the app object
app.showPostDetail = showPostDetail;
app.toggleLike = toggleLike;
app.addComment = addComment;
app.showCreatePostModal = showCreatePostModal;
app.showEditPostModal = showEditPostModal;
app.savePost = savePost;
app.deletePost = deletePost;
