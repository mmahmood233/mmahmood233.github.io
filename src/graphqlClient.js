export const GRAPHQL_ENDPOINT = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';

export const fetchGraphQLData = async (query, variables = {}) => {
  const token = localStorage.getItem('jwt');

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await response.json();
  if (data.errors) {
    throw new Error('GraphQL query failed: ' + data.errors.map(error => error.message).join(', '));
  }

  return data.data;
};
