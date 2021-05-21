import React, {} from 'react';
import { Container } from '@material-ui/core';

import ProfileForm from '../components/ProfileForm';

import { usersApi } from '../services/api';


const Profile = () => {
  const handleSubmit = (info) => {
    const userId = localStorage.getItem('userId');
    if(!userId) return;
    usersApi.put(`/users/${userId}`, info)
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }

  return (
    <Container maxWidth="lg">
      <h1>Perfil</h1>
      <ProfileForm submit={handleSubmit} />
    </Container>
  );
}

export default Profile;
