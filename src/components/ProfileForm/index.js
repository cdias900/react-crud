import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';

import { cepApi, statesApi, usersApi } from '../../services/api';
import {
  cepMask,
  cpfMask,
  nameMask,
  mobilePhoneMask,
  normalPhoneMask,
  phoneMasks
} from '../../utils/mask';
import { isCpfValid } from '../../utils/validation';

import classes from './styles.module.css';

const ProfileForm = ({ submit }) => {
  const history = useHistory();
  const [editPermission, setEditPermission] = useState(false);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [tempCity, setTempCity] = useState('');
  const [tempState, setTempState] = useState('');
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
    let mounted = true;
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if(!userId || !token) history.push('/login');
    usersApi.get(`/users/${userId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        if(mounted) {
          setEditPermission(res.data.editPermission || false);
          setName(res.data.name);
          setCpf(cpfMask(res.data.cpf));
          setCep(cepMask(res.data.cep));
          setTempState(res.data.state);
          setTempCity(res.data.city);
          setNeighborhood(res.data.neighborhood);
          setAddress(res.data.address);
          setComplement(res.data.complement || '');
          setPhones(res.data.phones.map(p => ({
            type: p.type,
            number: p.type === phoneMasks.MOBILE ? mobilePhoneMask(p.number) : normalPhoneMask(p.number)
          })));
          setEmails(res.data.emails);
        }
      })
      .catch((err) => console.log(err));
      return () => { mounted = false; }
  }, [history]);

  useEffect(() => {
    let mounted = true;
    statesApi.get()
      .then(res => {
        if(mounted) {
          const stateList = res.data.map(s => ({ stateName: s.nome, state: s.sigla }));
          setStates(stateList.sort((a, b) => {
            if(a.state < b.state) return -1;
            if(a.state > b.state) return 1;
            return 0;
          }));
        }
      })
      .catch(err => console.log(err));
    return () => { mounted = false; }
  }, []);

  useEffect(() => {
    if(tempState === ''
    || (tempState !== '' && states.length === 0)) return;
    setState(tempState);
    setTempState('');
  }, [states, tempState]);

  useEffect(() => {
    let mounted = true;
    setCity('');
    setCities([]);
    if(!state || state === '') return;
    statesApi.get(`/${state}/municipios`)
      .then(res => {
        if(mounted) setCities(res.data.map(c => ({ id: c.id, city: c.nome })));
      })
      .catch(err => console.log(err));
    return () => { mounted = false; }
  }, [state])

  useEffect(() => {
    if(tempCity === ''
    || (tempCity !== '' && cities.length === 0)) return;
    setCity(tempCity);
    setTempCity('');
  }, [cities, tempCity])

  const searchCep = () => {
    const cleanCep = cep.replace(/-/g, '');
    if(cleanCep.length !== 8) return setCepError(true);
    cepApi.get(`/${cep}/json`)
      .then(res => {
        if(res.data.erro) return setCepError(true);
        setCepError(false);
        setState(res.data.uf);
        setTempCity(res.data.localidade);
        setNeighborhood(res.data.bairro);
        setAddress(res.data.logradouro);
        setComplement(res.data.complemento);
      })
      .catch(err => console.log(err));
  }

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
      state,
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
        InputProps={{
            readOnly: !editPermission,
          }}
        inputProps={{
          maxLength: 100,
          minlength: 3,
        }}
        margin="normal"
        label="Nome"
        variant="outlined"
        value={name}
        onChange={e => setName(nameMask(e.target.value))}
        required
      />
      <TextField
        InputProps={{
            readOnly: !editPermission,
          }}
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
        InputProps={{
            readOnly: !editPermission,
          }}
        margin="normal"
        label="CEP"
        variant="outlined"
        value={cep}
        onChange={e => setCep(cepMask(e.target.value))}
        onBlur={searchCep}
        error={cepError}
        helperText={cepError && "CEP Inválido!"}
        required
      />
      <TextField
        InputProps={{
            readOnly: !editPermission,
          }}
        margin="normal"
        label="UF"
        variant="outlined"
        value={state}
        onChange={e => setState(e.target.value)}
        select
        required
      >
        {states.map(s => (
          <MenuItem key={s.state} value={s.state}>{s.stateName}</MenuItem>
        ))}
      </TextField>
      <TextField
        InputProps={{
            readOnly: !editPermission,
          }}
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
        InputProps={{
            readOnly: !editPermission,
          }}
        margin="normal"
        label="Bairro"
        variant="outlined"
        value={neighborhood}
        onChange={e => setNeighborhood(e.target.value)}
        required
      />
      <TextField
        InputProps={{
            readOnly: !editPermission,
          }}
        margin="normal"
        label="Logradouro"
        variant="outlined"
        value={address}
        onChange={e => setAddress(e.target.value)}
        required
      />
      <TextField
        InputProps={{
            readOnly: !editPermission,
          }}
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
            disabled={phones.length < 2 || !editPermission}
          >Remover Telefone</Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            style={{ width: '100%' }}
            variant="contained"
            color="primary"
            onClick={addPhone}
            disabled={!editPermission}
          >Adicionar Telefone</Button>
        </Grid>
      </Grid>
      {phones.map((p, i) => (
        <Grid container spacing={3} key={i}>
          <Grid item xs={2}>
            <TextField
              InputProps={{
            readOnly: !editPermission,
          }}
              className={classes.gridInput}
              margin="normal"
              label="Tipo de Telefone"
              variant="outlined"
              value={p.type}
              onChange={e => handlePhoneChange(i, { type: e.target.value, number: p.number })}
              select
              required
            >
              {Object.values(phoneMasks).map(item => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={10}>
            <TextField
              InputProps={{
            readOnly: !editPermission,
          }}
              className={classes.gridInput}
              margin="normal"
              label="Telefone"
              variant="outlined"
              value={p.number}
              onChange={(e) => handlePhoneChange(i, {
                type: p.type,
                number: p.type === phoneMasks.MOBILE ? mobilePhoneMask(e.target.value) : normalPhoneMask(e.target.value)
              })}
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
            disabled={emails.length < 2 || !editPermission}
          >Remover Email</Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            style={{ width: '100%' }}
            variant="contained"
            color="primary"
            onClick={addEmail}
            disabled={!editPermission}
          >Adicionar Email</Button>
        </Grid>
      </Grid>
      {emails.map((e, i) => (
        <TextField
          InputProps={{
            readOnly: !editPermission,
          }}
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
