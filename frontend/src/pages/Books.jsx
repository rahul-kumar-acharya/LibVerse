import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookService from '../services/bookService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Bookmark
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';

const Books = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  
  // Data State
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce search query to reduce database request triggers
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch books when search criteria or pagination changes
  useEffect(() => {
    fetchBooks();
  }, [page, categoryFilter, statusFilter, debouncedSearch]);

  const fetchCategories = async () => {
    try {
      const response = await bookService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        search: debouncedSearch,
      };
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await bookService.getBooks(params);
      setBooks(response.data.results || []);
      
      const count = response.data.count || 0;
      setTotalPages(Math.ceil(count / 8)); // 8 is default page size
    } catch (error) {
      console.error('Error fetching books:', error);
      showToast('Failed to load books database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setDeleteModalOpen(true);
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    try {
      setDeleting(true);
      await bookService.deleteBook(selectedBook.id);
      showToast('Book deleted successfully.', 'success');
      setDeleteModalOpen(false);
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      showToast('Failed to delete book. It might be linked to transaction history.', 'error');
    } finally {
      setDeleting(false);
      setSelectedBook(null);
    }
  };

  // Define Table Columns
  const columns = [
    {
      header: 'Cover',
      render: (row) => {
        const firstLetter = row.title ? row.title.charAt(0).toUpperCase() : 'B';
        return (
          <div className="flex justify-center">
            {row.cover_image ? (
              <div className="w-10 h-14 rounded-lg overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                <img src={row.cover_image} alt={row.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-14 rounded-lg bg-light-beige text-primary-brown font-extrabold text-sm flex items-center justify-center border border-slate-200/50 shadow-sm flex-shrink-0">
                {firstLetter}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Book Name',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">
            {row.title}
          </p>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider space-x-1.5 flex items-center flex-wrap">
            <span>ISBN: {row.isbn}</span>
            <span className="text-slate-300">|</span>
            <span>Publisher: {row.publisher}</span>
            <span className="text-slate-300">|</span>
            <span className="text-olive-green">Shelf: {row.shelf || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Author',
      render: (row) => (
        <span className="text-slate-700 font-medium text-sm">{row.author}</span>
      )
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full border border-slate-200/40">
          {row.category_name || 'General'}
        </span>
      )
    },
    {
      header: 'Available',
      render: (row) => {
        const isOutOfStock = row.available_quantity === 0;
        return (
          <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            isOutOfStock
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-emerald-50 border-emerald-250 text-emerald-600'
          }`}>
            {isOutOfStock ? 'Out of stock' : `${row.available_quantity} / ${row.quantity} Available`}
          </span>
        );
      }
    },
    {
      header: 'Action',
      render: (row) => {
        const isOutOfStock = row.available_quantity === 0;
        return (
          <div className="flex gap-2 items-center">
            {isAdmin() ? (
              <>
                {!isOutOfStock ? (
                  <Link to={`/dashboard/issue?bookId=${row.id}`}>
                    <Button variant="primary" size="sm">
                      Issue
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" className="opacity-50 cursor-not-allowed border-slate-200" disabled>
                    Issue
                  </Button>
                )}
                <Link to={`/dashboard/books/edit/${row.id}`}>
                  <Button variant="outline" size="sm" icon={Edit} className="p-1.5" />
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteModal(row)}
                  icon={Trash2}
                  className="p-1.5 text-rose-600 border-slate-200"
                />
              </>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Read Only</span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Book Inventory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Browse collection, search titles, filter by category and manage stock.
          </p>
        </div>
        {isAdmin() && (
          <Link to="/dashboard/books/add">
            <Button icon={Plus}>Add New Book</Button>
          </Link>
        )}
      </div>

      {/* Search and Category Filter bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          placeholder="Search by title, author, or ISBN..."
          categoryValue={categoryFilter}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          statusValue={statusFilter}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Table Section */}
      <Table
        columns={columns}
        data={books}
        loading={loading}
        emptyMessage="No books matching search filters found in catalog."
      />

      {/* Pagination component */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Book Confirm"
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
              onClick={handleDeleteBook}
              loading={deleting}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-850">"{selectedBook?.title}"</span>? This will permanently remove the record from inventory.
        </p>
      </Modal>
      
    </div>
  );
};

export default Books;
