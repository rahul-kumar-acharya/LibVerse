import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import studentService from '../services/studentService';
import bookService from '../services/bookService';
import transactionService from '../services/transactionService';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, KeyRound } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Loader from '../components/Loader';
import AutocompleteSelect from '../components/AutocompleteSelect';

const IssueBook = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedBookId = searchParams.get('bookId');

  // Load Lists State
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    book_id: preSelectedBookId || '',
    return_date: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitData();
  }, []);

  const fetchInitData = async () => {
    try {
      setLoading(true);
      
      // Load pre-selected book if URL parameter is present
      let preSelectedBook = null;
      if (preSelectedBookId) {
        const bookRes = await bookService.getBook(preSelectedBookId);
        preSelectedBook = bookRes.data;
      }
      
      // Fetch default small lists (first page of 15) to fill dropdown initially
      const [studentRes, bookRes] = await Promise.all([
        studentService.getStudents({ page_size: 15 }),
        bookService.getBooks({ page_size: 15, status: 'available' }),
      ]);

      setStudents(studentRes.data.results || []);
      
      let bookList = bookRes.data.results || [];
      // Guarantee pre-selected book is included in option lists
      if (preSelectedBook && !bookList.some((b) => b.id === preSelectedBook.id)) {
        bookList = [preSelectedBook, ...bookList];
      }
      setBooks(bookList);

      // Set default return date (10 days from today)
      const defaultReturn = new Date();
      defaultReturn.setDate(defaultReturn.getDate() + 10);
      const dateString = defaultReturn.toISOString().split('T')[0];
      
      setFormData((prev) => ({
        ...prev,
        return_date: dateString,
      }));
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      showToast('Failed to load students and books collections.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSearch = async (term) => {
    try {
      const response = await studentService.getStudents({ search: term, page_size: 15 });
      setStudents(response.data.results || []);
    } catch (e) {
      console.error('Error searching students:', e);
    }
  };

  const handleBookSearch = async (term) => {
    try {
      const response = await bookService.getBooks({ search: term, page_size: 15, status: 'available' });
      setBooks(response.data.results || []);
    } catch (e) {
      console.error('Error searching books:', e);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!formData.student_id) newErrors.student_id = 'Please select a student';
    if (!formData.book_id) newErrors.book_id = 'Please select a book';
    if (!formData.return_date) newErrors.return_date = 'Please specify a return date';
    else {
      const selectedDate = new Date(formData.return_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.return_date = 'Return date cannot be in the past';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      await transactionService.issueBook({
        student_id: formData.student_id,
        book_id: formData.book_id,
        return_date: formData.return_date,
      });

      showToast('Book issued successfully.', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error issuing book:', error);
      const backendErrors = error.response?.data || {};
      showToast(backendErrors.detail || backendErrors.book_id?.[0] || 'Failed to complete lending transaction.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.roll_number})`,
  }));

  const bookOptions = books.map((b) => ({
    value: b.id,
    label: `${b.title} [ISBN: ${b.isbn}] (${b.available_quantity} available)`,
  }));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/books"
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Issue a Book</h2>
          <p className="text-sm text-slate-500">
            Create a lending record for a student.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-sm space-y-5">
            
            <div className="flex items-center gap-3 p-4 bg-light-beige/30 border border-slate-200/40 rounded-2xl mb-2 text-primary-brown">
              <KeyRound className="w-5 h-5 flex-shrink-0 text-olive-green" />
              <p className="text-xs leading-relaxed font-semibold">
                Once a book is issued, the available quantity is decremented automatically. Late returns are subject to a fine of ₹10 per day.
              </p>
            </div>

            {/* Dynamic Autocomplete Student Selector */}
            <AutocompleteSelect
              label="Select Student"
              placeholder="Search by student name or roll number..."
              value={formData.student_id}
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, student_id: val }));
                setErrors((prev) => ({ ...prev, student_id: '' }));
              }}
              onSearch={handleStudentSearch}
              options={studentOptions}
              error={errors.student_id}
              required
            />

            {/* Dynamic Autocomplete Book Selector */}
            <AutocompleteSelect
              label="Select Book"
              placeholder="Search by book title or ISBN..."
              value={formData.book_id}
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, book_id: val }));
                setErrors((prev) => ({ ...prev, book_id: '' }));
              }}
              onSearch={handleBookSearch}
              options={bookOptions}
              error={errors.book_id}
              required
            />

            <Input
              label="Return Deadline"
              name="return_date"
              type="date"
              value={formData.return_date}
              onChange={handleInputChange}
              error={errors.return_date}
              required
            />

          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Link to="/dashboard/books">
              <Button variant="outline" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={saving}>
              Issue Book
            </Button>
          </div>
        </form>
      )}

    </div>
  );
};

export default IssueBook;
