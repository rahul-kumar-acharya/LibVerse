import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import bookService from '../services/bookService';
import { useToast } from '../context/ToastContext';
import { parseApiError } from '../utils/errorParser';
import { ArrowLeft, Upload } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Loader from '../components/Loader';

const EditBook = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    category_id: '',
    quantity: '',
    shelf: '',
    description: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitData();
  }, [id]);

  const fetchInitData = async () => {
    try {
      setLoading(true);
      // Fetch categories and book details in parallel
      const [catRes, bookRes] = await Promise.all([
        bookService.getCategories(),
        bookService.getBook(id),
      ]);
      
      setCategories(catRes.data);
      
      const book = bookRes.data;
      setFormData({
        title: book.title,
        isbn: book.isbn,
        author: book.author,
        publisher: book.publisher,
        category_id: book.category ? book.category.id : (book.category_id || ''),
        quantity: book.quantity,
        shelf: book.shelf || '',
        description: book.description || '',
      });
      
      if (book.cover_image) {
        setExistingCoverUrl(book.cover_image);
        setImagePreview(book.cover_image);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      showToast('Failed to load book parameters.', 'error');
      navigate('/dashboard/books');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.isbn) newErrors.isbn = 'ISBN is required';
    if (!formData.author) newErrors.author = 'Author is required';
    if (!formData.publisher) newErrors.publisher = 'Publisher is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct validation errors.', 'error');
      return;
    }

    try {
      setSaving(true);
      
      // Construct FormData for multipart upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('isbn', formData.isbn);
      data.append('author', formData.author);
      data.append('publisher', formData.publisher);
      data.append('category_id', formData.category_id);
      data.append('quantity', formData.quantity);
      data.append('shelf', formData.shelf);
      data.append('description', formData.description);
      
      // Only append cover image if a new file was uploaded
      if (coverImage) {
        data.append('cover_image', coverImage);
      }

      await bookService.updateBook(id, data);

      showToast('Book updated successfully.', 'success');
      navigate('/dashboard/books');
    } catch (error) {
      console.error('Error updating book:', error);
      const backendErrors = error.response?.data || {};
      if (backendErrors.isbn) {
        setErrors((prev) => ({ ...prev, isbn: 'A book with this ISBN already exists.' }));
      }
      showToast(parseApiError(error, 'Failed to update book record.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/books"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Edit Book</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Modify book details and adjust stock copies.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="glass-card p-6 md:p-8 space-y-6">
            
            {/* Input blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Book Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Clean Architecture"
                error={errors.title}
                required
              />

              <Input
                label="ISBN Number"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                placeholder="e.g. 978-0134494166"
                error={errors.isbn}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Author Name"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="e.g. Robert C. Martin"
                error={errors.author}
                required
              />

              <Input
                label="Publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                placeholder="e.g. Prentice Hall"
                error={errors.publisher}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                label="Category"
                name="category_id"
                type="select"
                value={formData.category_id}
                onChange={handleInputChange}
                placeholder="Select category"
                options={categoryOptions}
                error={errors.category_id}
                required
                className="sm:col-span-2"
              />

              <Input
                label="Total Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="e.g. 5"
                error={errors.quantity}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                label="Shelf Number"
                name="shelf"
                value={formData.shelf}
                onChange={handleInputChange}
                placeholder="e.g. A-3"
                error={errors.shelf}
              />

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Book Cover Image (Optional)
                </label>
                <div className="flex gap-4 items-center">
                  <label className="flex-1 flex flex-col items-center justify-center px-4 py-4 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-slate-500 text-xs">
                    <Upload className="w-5 h-5 mb-1.5 text-indigo-500" />
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload new cover</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="w-20 h-20 border border-slate-100 rounded-xl overflow-hidden relative group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Input
              label="Book Description / Summary"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide a brief summary of the book content, topics..."
              error={errors.description}
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
              Save Changes
            </Button>
          </div>
        </form>
      )}

    </div>
  );
};

export default EditBook;
