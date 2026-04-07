import { http } from './http';

const extractError = (error) => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    'Unexpected error'
  );
};

export const login = async (data) => {
  try {
    const res = await http.post('/auth/login', data);
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export const register = async (data) => {
  try {
    const res = await http.post('/auth/register', data);
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export const fetchMe = async () => {
  try {
    const res = await http.get('/profile/me');
    return res.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export const loginWithGoogle = () => {
  const apiBase = 'http://localhost:8080';
  window.location.href = `${apiBase}/oauth2/authorization/google`;
};