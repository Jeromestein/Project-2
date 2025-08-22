// Authentication functionality

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            app.currentUser = data.user;
            app.updateUIForAuthenticatedUser();
            app.showAlert('Login successful!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            modal.hide();
            
            // Clear form
            document.getElementById('login-form').reset();
        } else {
            app.showAlert(data.message || 'Login failed', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        app.showAlert('Login failed. Please try again.', 'danger');
    }
});

// Register form handler
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('register-username').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        firstName: document.getElementById('register-first-name').value,
        lastName: document.getElementById('register-last-name').value,
        bio: document.getElementById('register-bio').value
    };
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            app.currentUser = data.user;
            app.updateUIForAuthenticatedUser();
            app.showAlert('Registration successful! Welcome to the platform.', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            modal.hide();
            
            // Clear form
            document.getElementById('register-form').reset();
        } else {
            app.showAlert(data.message || 'Registration failed', 'danger');
        }
    } catch (error) {
        console.error('Registration error:', error);
        app.showAlert('Registration failed. Please try again.', 'danger');
    }
});

// Profile management functions
async function loadProfile() {
    if (!app.currentUser) {
        app.showAlert('Please login to view your profile', 'warning');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            app.currentUser = data.user;
            renderProfile(data.user);
        } else {
            app.showAlert('Failed to load profile', 'danger');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        app.showAlert('Failed to load profile', 'danger');
    }
}

function renderProfile(user) {
    // Update profile display
    document.getElementById('profile-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profile-username').textContent = `@${user.username}`;
    document.getElementById('profile-bio').textContent = user.bio || 'No bio available';
    
    // Update avatar
    const avatarImg = document.getElementById('profile-avatar');
    if (user.avatar) {
        avatarImg.src = user.avatar;
    } else {
        avatarImg.src = '/images/default-avatar.png';
    }
    
    // Populate form fields
    document.getElementById('profile-first-name').value = user.firstName;
    document.getElementById('profile-last-name').value = user.lastName;
    document.getElementById('profile-bio-input').value = user.bio || '';
    document.getElementById('profile-avatar-url').value = user.avatar || '';
}

async function updateProfile() {
    if (!app.currentUser) {
        app.showAlert('Please login to update your profile', 'warning');
        return;
    }
    
    const formData = {
        firstName: document.getElementById('profile-first-name').value,
        lastName: document.getElementById('profile-last-name').value,
        bio: document.getElementById('profile-bio-input').value,
        avatar: document.getElementById('profile-avatar-url').value
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            app.currentUser = data.user;
            renderProfile(data.user);
            app.showAlert('Profile updated successfully!', 'success');
        } else {
            app.showAlert(data.message || 'Failed to update profile', 'danger');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        app.showAlert('Failed to update profile', 'danger');
    }
}

function showEditProfileForm() {
    // Show the profile form section
    const profileForm = document.getElementById('profile-form').parentElement;
    profileForm.classList.remove('d-none');
}

// Add these functions to the app object when it's available
function addFunctionsToApp() {
    if (typeof window.app !== 'undefined') {
        window.app.loadProfile = loadProfile;
        window.app.updateProfile = updateProfile;
        window.app.showEditProfileForm = showEditProfileForm;
    } else {
        // Retry after a short delay
        setTimeout(addFunctionsToApp, 100);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', addFunctionsToApp);
