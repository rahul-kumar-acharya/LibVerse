import React, { useState, useEffect } from 'react';
import studentService from '../services/studentService';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import SkeletonLoader from '../components/SkeletonLoader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Table from '../components/Table';

const Students = () => {
  const { showToast } = useToast();
  
  // Data State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    department: '',
    semester: '',
    phone: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Debounce search query to reduce database requests load
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchStudents();
  }, [page, debouncedSearch]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        search: debouncedSearch,
      };
      
      const response = await studentService.getStudents(params);
      setStudents(response.data.results || []);
      
      const count = response.data.count || 0;
      setTotalPages(Math.ceil(count / 10)); // 10 is standard students page_size
    } catch (error) {
      console.error('Error fetching students:', error);
      showToast('Failed to load students directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const openAddModal = () => {
    setSelectedStudent(null);
    setFormData({
      name: '',
      roll_number: '',
      department: '',
      semester: '',
      phone: '',
      email: '',
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      roll_number: student.roll_number,
      department: student.department,
      semester: student.semester,
      phone: student.phone,
      email: student.email,
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const openDeleteModal = (student) => {
    setSelectedStudent(student);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.roll_number) errors.roll_number = 'Roll Number is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.semester) errors.semester = 'Semester is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.email) errors.email = 'Email is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSaving(true);
      if (selectedStudent) {
        // Edit Operation
        await studentService.updateStudent(selectedStudent.id, formData);
        showToast('Student record updated successfully.', 'success');
      } else {
        // Add Operation
        await studentService.createStudent(formData);
        showToast('Student record created successfully.', 'success');
      }
      setFormModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      const backendErrors = error.response?.data || {};
      if (backendErrors.roll_number) {
        setFormErrors((prev) => ({ ...prev, roll_number: 'Roll number must be unique.' }));
      }
      showToast(backendErrors.detail || 'Failed to save student profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      setDeleting(true);
      await studentService.deleteStudent(selectedStudent.id);
      showToast('Student record deleted successfully.', 'success');
      setDeleteModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      showToast('Failed to delete student. They might have active book transactions.', 'error');
    } finally {
      setDeleting(false);
      setSelectedStudent(null);
    }
  };

  // Define Table Columns
  const columns = [
    { header: 'Student Name', render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{row.name}</p>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">
            {row.roll_number}
          </span>
        </div>
      ) 
    },
    { header: 'Department', key: 'department' },
    { header: 'Semester', key: 'semester' },
    { header: 'Email Address', key: 'email' },
    { header: 'Phone Number', key: 'phone' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(row)}
            icon={Edit}
            className="p-1.5"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDeleteModal(row)}
            icon={Trash2}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Students Directory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage students profile records and track their library permissions.
          </p>
        </div>
        <Button icon={Plus} onClick={openAddModal}>Add Student</Button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          onClear={() => { setSearch(''); setPage(1); }}
          placeholder="Search students by name, roll number, or department..."
        />
      </div>

      {/* Cards Section */}
      {loading ? (
        <SkeletonLoader type="grid" count={6} />
      ) : students.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => {
            const firstLetter = student.name ? student.name.charAt(0).toUpperCase() : 'S';
            return (
              <div
                key={student.id}
                className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-slate-300/80 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  {/* Circle Avatar with first letter */}
                  <div className="w-12 h-12 rounded-full bg-light-beige text-primary-brown font-extrabold text-lg flex items-center justify-center flex-shrink-0 border border-slate-200/50">
                    {firstLetter}
                  </div>
                  
                  <div className="space-y-1.5 flex-grow">
                    <h3 className="font-bold text-slate-800 text-base leading-snug">
                      {student.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {student.roll_number}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full border border-slate-200/40">
                        {student.department}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full border border-slate-200/40">
                        {student.semester} Semester
                      </span>
                    </div>
                    
                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-3 leading-relaxed border-t border-slate-100 mt-2">
                      <p><span className="font-medium text-slate-400">Email:</span> {student.email}</p>
                      <p><span className="font-medium text-slate-400">Phone:</span> {student.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex gap-2 mt-5 border-t border-slate-100 pt-4 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(student)}
                    icon={Edit}
                    className="px-3"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteModal(student)}
                    icon={Trash2}
                    className="px-3 text-rose-600 hover:bg-rose-50 border-slate-200"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <p className="text-slate-700 font-semibold">No students found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Form Add/Edit Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={selectedStudent ? 'Edit Student Profile' : 'Add New Student'}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setFormModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} loading={saving}>
              {selectedStudent ? 'Save Changes' : 'Create Student'}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Rahul Sharma"
            error={formErrors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Roll Number"
              name="roll_number"
              value={formData.roll_number}
              onChange={handleInputChange}
              placeholder="e.g. CS202301"
              error={formErrors.roll_number}
              required
            />

            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g. Computer Science"
              error={formErrors.department}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              placeholder="e.g. 6th"
              error={formErrors.semester}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. 9876543210"
              error={formErrors.phone}
              required
            />
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="e.g. rahul@college.edu"
            error={formErrors.email}
            required
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Student Record"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteStudent}
              loading={deleting}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
          Are you sure you want to delete student <span className="font-semibold text-slate-800 dark:text-white">"{selectedStudent?.name}"</span>? All records linked to this student may be affected.
        </p>
      </Modal>

    </div>
  );
};

export default Students;
