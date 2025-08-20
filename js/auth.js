/**
 * auth.js - Handles user authentication for Smart City Dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Set up event listeners for forms
    setupEventListeners();
});

/**
 * Check if user is already logged in and redirect accordingly
 */
function checkAuthStatus() {
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    const urlParams = new URLSearchParams(window.location.search);
    
    // If user is logged in and trying to access login or register page, redirect to index
    if (currentUser && (currentPage === 'login.html' || currentPage === 'register.html')) {
        window.location.href = 'index.html';
    }
    
    // If user is not logged in and trying to access protected pages, redirect to login
    if (!currentUser && currentPage !== 'login.html' && currentPage !== 'register.html' && 
        currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'login.html';
    }
    
    // If user is not logged in and on the index page, redirect to register page
    if (!currentUser && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'register.html';
    }
    
    // Check if redirected from registration
    if (currentPage === 'login.html' && urlParams.get('registered') === 'true') {
        const successAlert = document.getElementById('successAlert');
        if (successAlert) {
            successAlert.classList.remove('d-none');
            // Remove the registered parameter from URL without refreshing
            window.history.replaceState({}, document.title, 'login.html');
        }
    }
    
    // Update UI based on authentication status
    updateAuthUI(currentUser);
}

/**
 * Set up event listeners for login and registration forms
 */
function setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
        
        // Password validation
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', validatePassword);
        }
        
        // Terms and conditions modal
        const acceptTermsBtn = document.getElementById('acceptTerms');
        if (acceptTermsBtn) {
            acceptTermsBtn.addEventListener('click', function() {
                document.getElementById('termsCheck').checked = true;
            });
        }
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

/**
 * Handle user login
 */
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Get users from local storage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user with matching email
    const user = users.find(u => u.email === email);
    
    // Check if user exists and password matches
    if (user && user.password === password) {
        // Login successful
        loginUser(user, rememberMe);
        window.location.href = 'index.html';
    } else {
        // Login failed
        showLoginError();
    }
}

/**
 * Handle user registration
 */
function handleRegistration() {
    // Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('termsCheck').checked;
    
    // Validate form
    if (!validateRegistrationForm(firstName, lastName, email, password, confirmPassword, termsAccepted)) {
        return;
    }
    
    // Get existing users from local storage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        showRegisterError('Email already exists. Please use a different email or login.');
        return;
    }
    
    // Create new user object
    const newUser = {
        id: generateUserId(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        createdAt: new Date().toISOString(),
        preferences: {
            defaultCity: 'New York'
        }
    };
    
    // Add user to array and save to local storage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Redirect to login page with success parameter
    window.location.href = 'login.html?registered=true';
}

/**
 * Validate registration form
 */
function validateRegistrationForm(firstName, lastName, email, password, confirmPassword, termsAccepted) {
    // Reset error message
    const errorElement = document.getElementById('registerAlert');
    errorElement.classList.add('d-none');
    
    // Check if all fields are filled
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showRegisterError('All fields are required.');
        return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showRegisterError('Please enter a valid email address.');
        return false;
    }
    
    // Validate password strength
    if (!isPasswordStrong(password)) {
        showRegisterError('Password does not meet the requirements.');
        return false;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        showRegisterError('Passwords do not match.');
        return false;
    }
    
    // Check if terms are accepted
    if (!termsAccepted) {
        showRegisterError('You must accept the Terms and Conditions.');
        return false;
    }
    
    return true;
}

/**
 * Check if password meets strength requirements
 */
function isPasswordStrong(password) {
    // At least 8 characters, 1 uppercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return passwordRegex.test(password);
}

/**
 * Validate password as user types
 */
function validatePassword() {
    const password = document.getElementById('registerPassword').value;
    const passwordInput = document.getElementById('registerPassword');
    
    if (password.length === 0) {
        passwordInput.classList.remove('is-valid', 'is-invalid');
        return;
    }
    
    if (isPasswordStrong(password)) {
        passwordInput.classList.remove('is-invalid');
        passwordInput.classList.add('is-valid');
    } else {
        passwordInput.classList.remove('is-valid');
        passwordInput.classList.add('is-invalid');
    }
}

/**
 * Show login error message
 */
function showLoginError() {
    const errorElement = document.getElementById('loginAlert');
    errorElement.textContent = 'Invalid email or password. Please try again.';
    errorElement.classList.remove('d-none');
    
    // Add shake animation
    errorElement.classList.add('animate__animated', 'animate__shakeX');
    setTimeout(() => {
        errorElement.classList.remove('animate__animated', 'animate__shakeX');
    }, 1000);
}

/**
 * Show registration error message
 */
function showRegisterError(message) {
    const errorElement = document.getElementById('registerAlert');
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
    
    // Add shake animation
    errorElement.classList.add('animate__animated', 'animate__shakeX');
    setTimeout(() => {
        errorElement.classList.remove('animate__animated', 'animate__shakeX');
    }, 1000);
}

/**
 * Login user and store session
 */
function loginUser(user, rememberMe) {
    // Create session object
    const session = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        loggedInAt: new Date().toISOString(),
        preferences: user.preferences || {}
    };
    
    // Store in localStorage or sessionStorage based on remember me option
    if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(session));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(session));
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    // Clear user session
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

/**
 * Get current logged in user
 */
function getCurrentUser() {
    // Check localStorage first, then sessionStorage
    return JSON.parse(localStorage.getItem('currentUser')) || 
           JSON.parse(sessionStorage.getItem('currentUser')) || 
           null;
}

/**
 * Update UI based on authentication status
 */
function updateAuthUI(user) {
    // Get navigation menu
    const navbarNav = document.getElementById('navbarNav');
    if (!navbarNav) return;
    
    // Get or create user menu container
    let userMenuContainer = document.querySelector('.user-menu-container');
    if (!userMenuContainer) {
        userMenuContainer = document.createElement('div');
        userMenuContainer.className = 'user-menu-container';
        navbarNav.appendChild(userMenuContainer);
    }
    
    // Update UI based on authentication status
    if (user) {
        // User is logged in, show user menu
        userMenuContainer.innerHTML = `
            <ul class="navbar-nav ms-auto">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-person-circle me-1"></i> ${user.firstName}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
                        <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                    </ul>
                </li>
            </ul>
        `;
        
        // Add event listener to logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
    } else {
        // User is not logged in, show login/register links
        const currentPage = window.location.pathname.split('/').pop();
        
        userMenuContainer.innerHTML = `
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link ${currentPage === 'register.html' ? 'active' : ''}" href="register.html">Register</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${currentPage === 'login.html' ? 'active' : ''}" href="login.html">Login</a>
                </li>
            </ul>
        `;
    }
}

/**
 * Generate a unique user ID
 */
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}