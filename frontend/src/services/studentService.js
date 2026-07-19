import api from '../api/axios';

const studentService = {
  getStudents: (params) => api.get('students/', { params }),
  getStudent: (id) => api.get(`students/${id}/`),
  createStudent: (data) => api.post('students/', data),
  updateStudent: (id, data) => api.put(`students/${id}/`, data),
  deleteStudent: (id) => api.delete(`students/${id}/`),
};

export default studentService;
