document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await login(username, password);
            if (response.error) {
                throw new Error(response.error);
            }
            localStorage.setItem('jwtToken', response);
            showProfileView();
        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });
});

async function login(username, password) {
    const credentials = btoa(`${username}:${password}`);
    
    try {
        const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Invalid Credentails, Try Again.`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

window.fetchUserData = fetchUserData;