import React from 'react';
import { Container } from '@material-ui/core';

import LoginForm from '../components/LoginForm';

const Login = () => {
  const handleSubmit = (info) => {
    console.log(info)
  }
  return (
    <Container maxWidth="lg">
      <h1>Login</h1>
      <LoginForm submit={handleSubmit} />
    </Container>
  )
}

export default Login;
