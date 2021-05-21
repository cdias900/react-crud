import React, { useState } from 'react';
import { TextField, Button } from '@material-ui/core';

import classes from './styles.module.css';

const LoginForm = ({ submit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    submit({
      username,
      password
    });
  }

  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      <TextField
        margin="normal"
        label="Nome de usuário"
        variant="outlined"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <TextField
        margin="normal"
        label="Senha"
        variant="outlined"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <Button
        className={classes.submitButton}
        variant="contained"
        color="primary"
        type="submit"
      >Fazer Login</Button>
    </form>
  )
}

export default LoginForm;
