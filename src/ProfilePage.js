import React, { useEffect, useState } from 'react';
import { fetchGraphQLData } from './graphqlClient'; // Import the GraphQL client function

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const query = `
        query GetProfile {
          user {
            id
            login
            # Add more fields as needed
          }
        }
      `;

      try {
        const data = await fetchGraphQLData(query);
        setProfileData(data.user);
      } catch (err) {
        setError('Failed to load profile data.');
        console.error(err);
      }
    };

    fetchProfileData();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="profile-page">
      <h2>Profile Page</h2>
      {profileData ? (
        <div>
          <p>ID: {profileData.id}</p>
          <p>Login: {profileData.login}</p>
          {/* Display more profile data here */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProfilePage; // Export ProfilePage as the default
