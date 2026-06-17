import API from './api';

export const register = async (userData) => {
  const response = await API.post('/auth/register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await API.post('/auth/login/', credentials);
  if (response.data.access) {
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
  }
  return response.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken) {
    try {
      await API.post('/auth/logout/', { refresh: refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  localStorage.clear();
};

export const getProfile = async () => {
  const response = await API.get('/auth/profile/');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await API.patch('/auth/profile/', data);
  return response.data;
};

export const verifyEmail = async (uidb64, token) => {
  const response = await API.get(`/auth/verify-email/${uidb64}/${token}/`);
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await API.post('/auth/resend-verification/', { email });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post('/auth/forgot-password/', { email });
  return response.data;
};

export const resetPassword = async (uidb64, token, newPassword, newPassword2) => {
  const response = await API.post(`/auth/reset-password/${uidb64}/${token}/`, {
    new_password: newPassword,
    new_password2: newPassword2,
  });
  return response.data;
};