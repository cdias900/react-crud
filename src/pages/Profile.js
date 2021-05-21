import React, {} from 'react';
import { Container, Button, Grid } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import ProfileForm from '../components/ProfileForm';

import { usersApi } from '../services/api';


const Profile = () => {
  const history = useHistory();

  const handleSubmit = (info) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if(!userId || !token) return;
    usersApi.put(`/users/${userId}`, info, {
      headers: {
        Authorization: token,
      }
    })
      .then(res => {
        alert('Dados atualizados com sucesso!');
        console.log(res.data);
      })
      .catch(err => {
        alert('Falha ao atualizar dados.');
        if(err.response && err.response.status === 401) history.push('/login');
        console.log(err);
      });
  }

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if(token) {
      usersApi.post('/auth/logout', {}, {
        headers: { Authorization: token }
      })
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
    }
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    history.push('/login');
  }

  return (
    <Container maxWidth="lg">
      <Grid container>
        <Grid item xs={1}>
        <h1>Perfil</h1>
        </Grid>
        <Grid item xs={10} />
        <Grid item xs={1}>
          <Button
            style={{ width: '100%' }}
            variant="contained"
            color="secondary"
            onClick={handleLogout}
          >Logout</Button>
        </Grid>
      </Grid>
      <ProfileForm submit={handleSubmit} />
    </Container>
  );
}

export default Profile;
