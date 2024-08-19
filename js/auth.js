const API_URL = 'https://learn.reboot01.com/api/auth/signin';

async function login(username, password) {
    const credentials = btoa(`${username}:${password}`);
    
    try {
        console.log('Attempting to log in...');
        debugLog('Sending login request...');
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        debugLog(`Response status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`Invalid credentials. Status: ${response.status}`);
        }

        const data = await response.json();
        debugLog('Login successful. Received data:', data);
        return data;
    } catch (error) {
        console.error('Login error:', error);
        debugLog(`Login error: ${error.message}`);
        throw error;
    }
}

function logout() {
    localStorage.removeItem('token');
    debugLog('Logged out. Token removed from localStorage.');
    window.location.reload();
}

function debugLog(message, data) {
    const debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
        const logMessage = data ? `${message} ${JSON.stringify(data)}` : message;
        debugOutput.innerHTML += `<p>${new Date().toLocaleTimeString()}: ${logMessage}</p>`;
    }
    console.log(message, data);
}