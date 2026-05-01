import api from './api.js';

export const adminService = {
  users: () => api.get('/admin/users').then((r) => r.data),
  accounts: () => api.get('/admin/accounts').then((r) => r.data),
  deactivate: (id) => api.put(`/admin/users/${id}/deactivate`).then((r) => r.data),
  fraudAlerts: () => api.get('/fraud/alerts').then((r) => r.data),
  fraudAuditLog: () => api.get('/fraud/audit-log').then((r) => r.data),
  fraudRulesInfo: () => api.get('/fraud/rules/info').then((r) => r.data),
  reloadRules: () => api.post('/fraud/rules/reload').then((r) => r.data),
};
