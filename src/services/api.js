import axios from 'axios';

export const usersApi = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const cepApi = axios.create({
  baseURL: 'https://viacep.com.br/ws',
});

export const statesApi = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
});
