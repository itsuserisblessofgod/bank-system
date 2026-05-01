import api from './api.js';

export const transactionService = {
  deposit: (accountId, amount) => api.post('/transactions/deposit', { accountId, amount }).then((r) => r.data),
  withdraw: (accountId, amount) => api.post('/transactions/withdraw', { accountId, amount }).then((r) => r.data),
  transfer: (fromAccountId, toAccountId, amount) =>
    api.post('/transactions/transfer', { fromAccountId, toAccountId, amount }).then((r) => r.data),
  history: (accountId, page = 0, size = 20) =>
    api.get('/transactions/history', { params: { accountId, page, size } }).then((r) => r.data),
  getRecent: (limit = 10) =>
    api.get(`/transactions/recent?limit=${limit}`).then((r) => r.data),
};
