function isValidJWT(token) {
    return token && typeof token === 'string' && token.split('.').length === 3;
}

function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.sub) {
            return parseInt(payload.sub, 10);
        }
        throw new Error('User ID not found in token');
    } catch (error) {
        console.error('Error parsing token:', error);
        throw new Error('Invalid token structure');
    }
}

async function fetchUserData() {
    const token = localStorage.getItem('jwtToken');
    if (!isValidJWT(token)) {
        localStorage.removeItem('jwtToken');
        showLoginView();
        return;
    }

    let userId;
    try {
        userId = getUserIdFromToken(token);
    } catch (error) {
        console.error('Error getting user ID:', error);
        showLoginView();
        return;
    }

    const eventId = 20; 

    const query = `
    query($userId: Int!, $eventId: Int!) {
        user(where: {id: {_eq: $userId}}) {
            id
            login
            email
            totalUp
            totalDown
            auditRatio
            transactions(where: {type: {_eq: "xp"}}, order_by: {createdAt: desc}, limit: 10) {
                amount
                createdAt
                path
            }
            skills: transactions(
                order_by: [{type: desc}, {amount: desc}]
                distinct_on: [type]
                where: {type: {_in: ["skill_js", "skill_go", "skill_html", "skill_prog", "skill_front-end", "skill_back-end"]}}
            ) {
                type
                amount
            }
        }
        event_user(where: { userId: { _eq: $userId }, eventId: {_eq: $eventId}}) {
            level
        }
    }
    `;

    try {
        const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                query: query,
                variables: { userId: userId, eventId: eventId }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        console.log("Raw API response:", data);

        if (data.errors) {
            console.error("GraphQL Errors:", data.errors);
            throw new Error('GraphQL query failed');
        }

        if (!data.data || !data.data.user || data.data.user.length === 0) {
            throw new Error('No user data found');
        }

        displayUserData(data.data);
    } catch (error) {
        console.error('Error:', error);
        showLoginView();
    }
}

google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(fetchUserData);