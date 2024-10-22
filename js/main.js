document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    initializeLogout();
    checkAuthStatus();
    setupLoginForm();
}

function initializeLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            checkAuthStatus();
        });
    } else {
        console.error('Logout button not found');
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('jwtToken');
    const loginView = document.getElementById('login-view');
    const profileView = document.getElementById('profile-view');
    const logoutBtn = document.getElementById('logout-btn');

    if (token) {
        loginView.style.display = 'none';
        profileView.style.display = 'block';
        logoutBtn.style.display = 'block';
        fetchUserData(); 
    } else {
        loginView.style.display = 'block';
        profileView.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}



// Ensure fetchUserData is available globally
window.fetchUserData = fetchUserData;