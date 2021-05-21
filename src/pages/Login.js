import React from 'react';
import { Container } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import LoginForm from '../components/LoginForm';

import { usersApi } from '../services/api';

const Login = () => {
  const history = useHistory();

  const handleSubmit = (info) => {
    usersApi.post('/auth/login', info)
      .then(res => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.user.id);
        history.push('/profile');
      })
      .catch(err => {
        console.log(err);
        if(err.response && err.response.status !== 500)
          alert('Usuário ou senha inválidos.');
        else
          alert('Falha ao realizar login.');
      });
  }
  return (
    <Container maxWidth="lg">
      <h1>Login</h1>
      <LoginForm submit={handleSubmit} />
    </Container>
  )
}

export default Login;
