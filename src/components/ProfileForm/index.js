import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import { cepApi, statesApi } from '../../services/api';
import { cepMask, cpfMask, phoneMask } from '../../utils/mask';
import { isCpfValid } from '../../utils/validation';

import classes from './styles.module.css';

const ProfileForm = ({ submit }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [uf, setUf] = useState('');
  const [city, setCity] = useState('');
  const [tempCity, setTempCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [complement, setComplement] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [phones, setPhones] = useState([
    {
      type: '',
      number: ''
    }
  ]);
  const [emails, setEmails] = useState([
    {
      email: ''
    }
  ]);
  const [cpfError, setCpfError] = useState(false);
  const [cepError, setCepError] = useState(false);

  useEffect(() => {
    statesApi.get()
      .then(res => {
        const stateList = res.data.map(s => ({ state: s.nome, uf: s.sigla }));
        setStates(stateList.sort((a, b) => {
          if(a.uf < b.uf) return -1;
          if(a.uf > b.uf) return 1;
          return 0;
        }));
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    setCity('');
    setCities([]);
    if(!uf || uf === '') return;
    statesApi.get(`/${uf}/municipios`)
      .then(res => setCities(res.data.map(c => ({ id: c.id, city: c.nome }))))
      .catch(err => console.log(err));
  }, [uf])

  useEffect(() => {
    if(tempCity === '' || (tempCity !== '' && cities.length === 0)) return;
    setCity(tempCity);
    setTempCity('');
  }, [cities, tempCity])

  useEffect(() => {
    const cleanCep = cep.replace(/-/g, '');
    if(cleanCep.length !== 8) return;
    cepApi.get(`/${cep}/json`)
      .then(res => {
        if(res.data.erro) return setCepError(true);
        setCepError(false);
        setUf(res.data.uf);
        setTempCity(res.data.localidade);
        setNeighborhood(res.data.bairro);
        setAddress(res.data.logradouro);
        setComplement(res.data.complemento);
      })
      .catch(err => console.log(err));
  }, [cep])

  const handlePhoneChange = (index, phone) => {
    setPhones(prevState => prevState.map((p, i) => {
      if(i !== index) return p;
      return phone;
    }));
  }

  const handleEmailChange = (index, email) => {
    setEmails(prevState => prevState.map((e, i) => {
      if(i !== index) return e;
      return { email };
    }))
  }

  const addPhone = () => {
    setPhones(p => ([
      ...p,
      {
        type: '',
        number: ''
      }
    ]));
  }

  const removePhone = () => {
    setPhones(p => p.filter((_, i) => i !== phones.length - 1));
  }

  const addEmail = () => {
    setEmails(e => ([
      ...e,
      {
        email: ''
      }
    ]))
  }

  const removeEmail = () => {
    setEmails(e => e.filter((_, i) => i !== emails.length - 1));
  }

  const handleCpfValidation = () => {
    setCpfError(!isCpfValid(cpf.replace(/[-.]/g, '')));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    submit({
      name,
      cpf: cpf.replace(/[-.]/g, ''),
      cep: cep.replace(/-/g, ''),
      uf,
      city,
      neighborhood,
      address,
      complement,
      phones: phones.map(p => ({ type: p.type, number: p.number.replace(/[-() ]/g, '')})),
      emails
    });
  }

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      <TextField
        margin="normal"
        label="Nome"
        variant="outlined"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <TextField
        margin="normal"
        label="CPF"
        variant="outlined"
        value={cpf}
        onChange={e => setCpf(cpfMask(e.target.value))}
        onBlur={handleCpfValidation}
        error={cpfError}
        helperText={cpfError && "CPF Inválido!"}
        required
      />
      <TextField
        margin="normal"
        label="CEP"
        variant="outlined"
        value={cep}
        onChange={e => setCep(cepMask(e.target.value))}
        error={cepError}
        helperText={cepError && "CEP Inválido!"}
        required
      />
      <TextField
        margin="normal"
        label="UF"
        variant="outlined"
        value={uf}
        onChange={e => setUf(e.target.value)}
        select
        required
      >
        {states.map(s => (
          <MenuItem key={s.uf} value={s.uf}>{s.state}</MenuItem>
        ))}
      </TextField>
      <TextField
        margin="normal"
        label="Cidade"
        variant="outlined"
        value={city}
        onChange={e => setCity(e.target.value)}
        select
        required
      >
        {cities.map(c => (
          <MenuItem key={c.id} value={c.city}>{c.city}</MenuItem>
        ))}
      </TextField>
      <TextField
        margin="normal"
        label="Bairro"
        variant="outlined"
        value={neighborhood}
        onChange={e => setNeighborhood(e.target.value)}
        required
      />
      <TextField
        margin="normal"
        label="Logradouro"
        variant="outlined"
        value={address}
        onChange={e => setAddress(e.target.value)}
        required
      />
      <TextField
        margin="normal"
        label="Complemento"
        variant="outlined"
        value={complement}
        onChange={e => setComplement(e.target.value)}
      />
      <Grid container spacing={2}>
        <Grid item xs={8} />
        <Grid item xs={2}>
          <Button
            style={{ width: '100%' }}
            variant="contained"
            color="secondary"
            onClick={removePhone}
            disabled={phones.length < 2}
          >Remover Telefone</Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            style={{ width: '100%' }}
            variant="contained"
            color="primary"
            onClick={addPhone}
          >Adicionar Telefone</Button>
        </Grid>
      </Grid>
      {phones.map((p, i) => (
        <Grid container spacing={3} key={i}>
          <Grid item xs={2}>
            <TextField
              className={classes.gridInput}
              margin="normal"
              label="Tipo de Telefone"
              variant="outlined"
              value={p.type}
              onChange={e => handlePhoneChange(i, { type: e.target.value, number: p.number })}
              select
              required
            >
              <MenuItem value="Celular">Celular</MenuItem>
              <MenuItem value="Residencial">Residencial</MenuItem>
              <MenuItem value="Comercial">Comercial</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={10}>
            <TextField
              className={classes.gridInput}
              margin="normal"
              label="Telefone"
              variant="outlined"
              value={p.number}
              onChange={e => handlePhoneChange(i, { type: p.type, number: phoneMask(e.target.value) })}
              required
            />
          </Grid>
        </Grid>
      ))}
      <Grid container spacing={2}>
        <Grid item xs={8} />
        <Grid item xs={2}>
          <Button
            style={{ width: '100%' }}
            variant="contained"
            color="secondary"
            onClick={removeEmail}
            disabled={emails.length < 2}
          >Remover Email</Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            style={{ width: '100%' }}
            variant="contained"
            color="primary"
            onClick={addEmail}
          >Adicionar Email</Button>
        </Grid>
      </Grid>
      {emails.map((e, i) => (
        <TextField
          key={i}
          type="email"
          margin="normal"
          label="Email"
          variant="outlined"
          value={e.email}
          onChange={e => handleEmailChange(i, e.target.value)}
          required
        />
      ))}
      <Button
        className={classes.submitButton}
        variant="contained"
        color="primary"
        type="submit"
        disabled={cpfError || cepError}
      >Salvar</Button>
    </form>
  );
}

export default ProfileForm;
