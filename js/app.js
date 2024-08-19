// DOM Elements
const loginForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const profileDiv = document.getElementById('profile');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);

// Functions
async function handleLogin(event) {
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    try {
        const data = await login(username, password);
        if (data) {
            localStorage.setItem('token', data);
            await fetchAndDisplayProfile();
        }
    } catch (error) {
        errorMessage.textContent = error.message;
    }
}

async function fetchAndDisplayProfile() {
    try {
        const profileData = await fetchProfile();
        await displayProfile(profileData);
        loginForm.style.display = 'none';
        profileDiv.style.display = 'block';
    } catch (error) {
        errorMessage.textContent = 'Failed to fetch profile data';
    }
}

async function displayProfile(profileData) {
    if (typeof updateProfileUI === 'function') {
        await updateProfileUI(profileData);
    }
}

function handleLogout() {
    logout();
    profileDiv.style.display = 'none';
    loginForm.style.display = 'block';
    errorMessage.textContent = '';
    usernameInput.value = '';
    passwordInput.value = '';
}

// Initialize app
async function init() {
    const token = localStorage.getItem('token');
    if (token) {
        await fetchAndDisplayProfile();
    }
}

init();