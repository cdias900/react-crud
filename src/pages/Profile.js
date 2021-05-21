import React from 'react';
import { Container } from '@material-ui/core';

import ProfileForm from '../components/ProfileForm';


const Profile = () => {
  const handleSubmit = (info) => {
    console.log(info);
  }

  return (
    <Container maxWidth="lg">
      <h1>Perfil</h1>
      <ProfileForm submit={handleSubmit} />
    </Container>
  );
}

export default Profile;
