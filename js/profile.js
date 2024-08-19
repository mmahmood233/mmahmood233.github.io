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
    if (!profileDiv) {
        console.error('Profile div not found');
        return;
    }

    profileDiv.innerHTML = `
        <h2>Welcome, ${profileData.login}!</h2>
        <h3>User ID: ${profileData.id}</h3>
        
        <h3>Recent Transactions:</h3>
        <ul>
            ${profileData.transactions.slice(0, 5).map(t => `
                <li>${new Date(t.createdAt).toLocaleDateString()}: ${t.type} - ${t.amount} XP</li>
            `).join('')}
        </ul>
        
        <h3>Recent Progress:</h3>
        <ul>
            ${profileData.progresses.slice(0, 5).map(p => `
                <li>${new Date(p.createdAt).toLocaleDateString()}: ${p.object.name} - Grade: ${p.grade}</li>
            `).join('')}
        </ul>
        
        <div id="xp-graph"></div>
        <div id="project-success-graph"></div>
        
        <button id="logout-button">Logout</button>
    `;
    
    createXPGraph(profileData.transactions);
    createProjectSuccessGraph(profileData.progresses);
    
    console.log('Profile UI updated');
}

// Log that the script has loaded
console.log('profile.js loaded and executed');