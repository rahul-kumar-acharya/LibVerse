import api from '../api/axios';

const transactionService = {
  getTransactions: (params) => api.get('transactions/', { params }),
  issueBook: (data) => api.post('transactions/issue/', data),
  returnBook: (id) => api.post(`transactions/${id}/return_book/`),
  getDashboardStats: () => api.get('transactions/dashboard_stats/'),
};

export default transactionService;
