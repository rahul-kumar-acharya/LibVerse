import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, Tag, BookOpen } from 'lucide-react';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Table from '../components/Table';

const Categories = () => {
  const { showToast } = useToast();
  
  // Data State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setError('');
    setFormModalOpen(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setError('');
    setFormModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setSaving(true);
      if (selectedCategory) {
        // Edit Operation
        await categoryService.updateCategory(selectedCategory.id, { name: categoryName });
        showToast('Category updated successfully.', 'success');
      } else {
        // Add Operation
        await categoryService.createCategory({ name: categoryName });
        showToast('Category created successfully.', 'success');
      }
      setFormModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      const backendErrors = error.response?.data || {};
      if (backendErrors.name) {
        setError('A category with this name already exists.');
      } else {
        showToast(backendErrors.detail || 'Failed to save category.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      setDeleting(true);
      await categoryService.deleteCategory(selectedCategory.id);
      showToast('Category deleted successfully.', 'success');
      setDeleteModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Cannot delete category because it contains books. Please reclassify books first.', 'error');
    } finally {
      setDeleting(false);
      setSelectedCategory(null);
    }
  };

  const columns = [
    {
      header: 'Category Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Tag className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Books Count',
      render: (row) => (
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="font-semibold">{row.book_count || 0} books</span>
        </div>
      ),
    },
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
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Book Categories</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, edit and delete book classifications for the library.
          </p>
        </div>
        <Button icon={Plus} onClick={openAddModal}>Add Category</Button>
      </div>

      {/* Table Section */}
      <Table
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories created yet."
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={selectedCategory ? 'Edit Category' : 'Create Category'}
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
              {selectedCategory ? 'Save Changes' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Category Name"
            name="name"
            value={categoryName}
            onChange={(e) => { setCategoryName(e.target.value); setError(''); }}
            placeholder="e.g. Artificial Intelligence"
            error={error}
            required
          />
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Category"
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
              onClick={handleDeleteCategory}
              loading={deleting}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
          Are you sure you want to delete the category <span className="font-semibold text-slate-800 dark:text-white">"{selectedCategory?.name}"</span>? This cannot be undone.
        </p>
      </Modal>

    </div>
  );
};

export default Categories;
