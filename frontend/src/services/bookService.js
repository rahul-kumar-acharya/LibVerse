import api from '../api/axios';

const bookService = {
  getBooks: (params) => api.get('books/', { params }),
  getBook: (id) => api.get(`books/${id}/`),
  createBook: (data) => api.post('books/', data, {
    headers: {
      'Content-Type': 'multipart/form-data', // Handles cover image upload
    }
  }),
  updateBook: (id, data) => api.put(`books/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }),
  deleteBook: (id) => api.delete(`books/${id}/`),
  getCategories: () => api.get('categories/'),
};

export default bookService;
