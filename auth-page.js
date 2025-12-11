// Auth page functionality
const API_URL = 'http://localhost:5000/api';

// Tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const formType = tab.dataset.form;
        
        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active form
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${formType}-form`).classList.add('active');
        
        // Clear previous messages
        document.getElementById(`${formType}-error`).classList.remove('show');
        document.getElementById(`${formType}-success`).classList.remove('show');
    });
});

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    const successMsg = document.getElementById('login-success');
    const loadingMsg = document.getElementById('login-loading');
    const loginBtn = document.getElementById('login-btn');
    
    // Clear messages
    errorMsg.classList.remove('show');
    successMsg.classList.remove('show');
    
    // Validate inputs
    if (!identifier || !password) {
        errorMsg.textContent = 'Please fill in all fields';
        errorMsg.classList.add('show');
        return;
    }
    
    try {
        loadingMsg.classList.add('show');
        loginBtn.disabled = true;
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ identifier, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        successMsg.textContent = 'Login successful! Redirecting...';
        successMsg.classList.add('show');
        
        // Redirect to home after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        errorMsg.textContent = error.message || 'An error occurred during login';
        errorMsg.classList.add('show');
    } finally {
        loadingMsg.classList.remove('show');
        loginBtn.disabled = false;
    }
});

// Signup form handler
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const errorMsg = document.getElementById('signup-error');
    const successMsg = document.getElementById('signup-success');
    const loadingMsg = document.getElementById('signup-loading');
    const signupBtn = document.getElementById('signup-btn');
    
    // Clear messages
    errorMsg.classList.remove('show');
    successMsg.classList.remove('show');
    
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
        errorMsg.textContent = 'Please fill in all fields';
        errorMsg.classList.add('show');
        return;
    }
    
    if (username.length < 3) {
        errorMsg.textContent = 'Username must be at least 3 characters';
        errorMsg.classList.add('show');
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = 'Password must be at least 6 characters';
        errorMsg.classList.add('show');
        return;
    }
    
    if (password !== confirmPassword) {
        errorMsg.textContent = 'Passwords do not match';
        errorMsg.classList.add('show');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMsg.textContent = 'Please enter a valid email address';
        errorMsg.classList.add('show');
        return;
    }
    
    try {
        loadingMsg.classList.add('show');
        signupBtn.disabled = true;
        
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        successMsg.textContent = 'Account created successfully! Redirecting...';
        successMsg.classList.add('show');
        
        // Clear form
        document.getElementById('signup-form').reset();
        
        // Redirect to home after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signup error:', error);
        errorMsg.textContent = error.message || 'An error occurred during signup';
        errorMsg.classList.add('show');
    } finally {
        loadingMsg.classList.remove('show');
        signupBtn.disabled = false;
    }
});
