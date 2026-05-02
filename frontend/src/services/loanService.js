import api from './api.js';

export const loanService = {
  calculate: (data) => api.post('/loans/calculate', data).then((r) => r.data),
  apply: (data) => api.post('/loans/apply', data).then((r) => r.data),
  getMyLoans: () => api.get('/loans/my').then((r) => r.data),
};
