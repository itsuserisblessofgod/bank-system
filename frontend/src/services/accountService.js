import api from './api.js';

export const accountService = {
  myAccounts: () => api.get('/accounts/my').then((r) => r.data),
  create: (accountType) => api.post('/accounts/create', { accountType }).then((r) => r.data),
  get: (id) => api.get(`/accounts/${id}`).then((r) => r.data),
};
