const GRAPHQL_URL = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';

async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const query = `
    {
        user {
            id
            login
            transactions(order_by: {createdAt: desc}) {
                amount
                type
                createdAt
            }
            progresses(order_by: {createdAt: desc}) {
                object {
                    name
                    type
                }
                grade
                createdAt
            }
        }
    }
    `;

    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }
        
        if (!data.data || !data.data.user || data.data.user.length === 0) {
            throw new Error('No user data found');
        }

        return data.data.user[0];
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

function updateProfileUI(profileData) {
    const profileDiv = document.getElementById('profile');
    profileDiv.innerHTML = `
        <div class="profile-section card">
            <h2>Welcome, ${profileData.login}!</h2>
            <p>User ID: ${profileData.id}</p>
        </div>
        
        <div class="profile-section card">
            <h3>Recent Transactions</h3>
            <ul>
                ${profileData.transactions.slice(0, 5).map(t => `
                    <li>${new Date(t.createdAt).toLocaleDateString()}: ${t.type} - ${t.amount} XP</li>
                `).join('')}
            </ul>
        </div>
        
        <div class="profile-section card">
            <h3>Recent Progress</h3>
            <ul>
                ${profileData.progresses.slice(0, 5).map(p => `
                    <li>${new Date(p.createdAt).toLocaleDateString()}: ${p.object.name} - Grade: ${p.grade}</li>
                `).join('')}
            </ul>
        </div>
        
        <div class="profile-section card">
            <h3>XP Over Time</h3>
            <div id="xp-graph"></div>
        </div>
        
        <div class="profile-section card">
            <h3>Project Success Rate</h3>
            <div id="project-success-graph"></div>
        </div>
        
        <button id="logout-button" onclick="handleLogout()">Logout</button>
    `;
    
    createXPGraph(profileData.transactions);
    createProjectSuccessGraph(profileData.progresses);
}
// Log that the script has loaded
console.log('profile.js loaded and executed');