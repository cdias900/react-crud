import axios from 'axios';

export const usersApi = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080/api'
    : 'https://spring-boot-react-crud.herokuapp.com/api',
});

export const cepApi = axios.create({
  baseURL: 'https://viacep.com.br/ws',
});

export const statesApi = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
});
