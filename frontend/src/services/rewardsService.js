import api from './api.js';

export const rewardsService = {
  getMyRewards: () => api.get('/rewards/my').then((r) => r.data),
  getHistory: (page = 0, size = 10) =>
    api.get('/rewards/my/history', { params: { page, size } }).then((r) => r.data),
  redeem: (points, accountId) =>
    api.post('/rewards/redeem', { points, accountId }).then((r) => r.data),
};
