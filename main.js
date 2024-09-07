document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        showProfileView();
    } else {
        showLoginView();
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('jwtToken');
        showLoginView();
    });
});

function showLoginView() {
    document.getElementById('login-view').style.display = 'block';
    document.getElementById('profile-view').style.display = 'none';
}

function showProfileView() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
    fetchUserData();
}