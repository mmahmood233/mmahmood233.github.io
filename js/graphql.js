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
            transactions(order_by: {createdAt: desc}, limit: 5) {
                amount
                type
                createdAt
            }
            progresses(order_by: {createdAt: desc}, limit: 5) {
                object {
                    name
                }
                grade
                createdAt
            }
        }
    }
    `;

    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch profile data');
    }

    const data = await response.json();
    return data.data.user[0];
}