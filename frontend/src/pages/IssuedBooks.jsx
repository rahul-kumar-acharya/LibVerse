import React, { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  Undo2,
  Clock,
  Search,
  DollarSign
} from 'lucide-react';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const IssuedBooks = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  // Tab State: 'issued', 'returned', 'overdue'
  const [activeTab, setActiveTab] = useState('issued');
  
  // Data State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Return Processing State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [processingReturn, setProcessingReturn] = useState(false);

  // Reset page when tab or search parameters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    fetchTransactions();
  }, [activeTab, search, page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        page
      };
      
      if (activeTab === 'issued') {
        params.status = 'issued';
      } else if (activeTab === 'returned') {
        params.status = 'returned';
      } else if (activeTab === 'overdue') {
        params.overdue = 'true';
      }

      const response = await transactionService.getTransactions(params);
      
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setTransactions(data);
      
      const count = response.data.count || data.length;
      setTotalPages(Math.ceil(count / 10)); // 10 is default transactions page size
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast('Failed to load transaction reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openReturnModal = (transaction) => {
    setSelectedTransaction(transaction);
    setReturnModalOpen(true);
  };

  const handleReturnBook = async () => {
    if (!selectedTransaction) return;
    try {
      setProcessingReturn(true);
      const response = await transactionService.returnBook(selectedTransaction.id);
      const updatedRecord = response.data;
      
      const fineValue = parseFloat(updatedRecord.fine);
      if (fineValue > 0) {
        showToast(`Book returned successfully. Late fine: ₹${fineValue}`, 'success');
      } else {
        showToast('Book returned successfully. No late fine applied.', 'success');
      }
      
      setReturnModalOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error returning book:', error);
      showToast(error.response?.data?.detail || 'Failed to process return.', 'error');
    } finally {
      setProcessingReturn(false);
      setSelectedTransaction(null);
    }
  };

  // Define Columns dynamically based on active tab
  const getColumns = () => {
    const baseColumns = [
      {
        header: 'Book Info',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 max-w-[220px] truncate">{row.book.title}</p>
            <span className="text-[10px] text-slate-400">ISBN: {row.book.isbn}</span>
          </div>
        ),
      },
      {
        header: 'Student Info',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{row.student.name}</p>
            <span className="text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">
              {row.student.roll_number}
            </span>
          </div>
        ),
      },
      { header: 'Issue Date', key: 'issue_date' },
      { header: 'Due Date', key: 'return_date' },
    ];

    if (activeTab === 'issued') {
      return [
        ...baseColumns,
        {
          header: 'Potential Fine',
          render: (row) => {
            const fine = parseFloat(row.potential_fine);
            return (
              <span className={`font-semibold ${fine > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-550'}`}>
                ₹{row.potential_fine}
              </span>
            );
          },
        },
        ...(isAdmin()
          ? [
              {
                header: 'Action',
                render: (row) => (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openReturnModal(row)}
                    icon={Undo2}
                  >
                    Return
                  </Button>
                ),
              },
            ]
          : []),
      ];
    } else if (activeTab === 'returned') {
      return [
        ...baseColumns,
        { header: 'Actual Return Date', key: 'actual_return_date' },
        {
          header: 'Fine Charged',
          render: (row) => {
            const fineVal = parseFloat(row.fine);
            return (
              <span className={`font-bold ${fineVal > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                ₹{row.fine}
              </span>
            );
          },
        },
      ];
    } else {
      // Overdue Tab
      return [
        ...baseColumns,
        {
          header: 'Days Overdue',
          render: (row) => {
            const due = new Date(row.return_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = Math.abs(today - due);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return (
              <span className="font-bold text-rose-500">
                {diffDays} days late
              </span>
            );
          },
        },
        {
          header: 'Accumulated Fine',
          render: (row) => (
            <span className="font-bold text-rose-500 animate-pulse">
              ₹{row.potential_fine}
            </span>
          ),
        },
        ...(isAdmin()
          ? [
              {
                header: 'Action',
                render: (row) => (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openReturnModal(row)}
                    icon={Undo2}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    Return
                  </Button>
                ),
              },
            ]
          : []),
      ];
    }
  };

  const tabs = [
    { id: 'issued', label: 'Active Issues', icon: Clock },
    { id: 'returned', label: 'Returned Books', icon: CheckCircle },
    { id: 'overdue', label: 'Overdue Books', icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Lending Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze active book checkouts, returned history logs and calculate overdue fines.
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800/80 gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(''); }}
              className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all focus:outline-none relative ${
                isActive
                  ? 'text-indigo-650 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-in fade-in" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search Filter */}
      <div className="glass-card p-4">
        <SearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          onClear={() => setSearch('')}
          placeholder={isAdmin() ? "Search transactions by student name, roll, book title, or ISBN..." : "Search my transactions by book title or ISBN..."}
        />
      </div>

      {/* Data Table */}
      <Table
        columns={getColumns()}
        data={transactions}
        loading={loading}
        emptyMessage={`No ${activeTab} transaction records found.`}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Return Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Process Book Return"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setReturnModalOpen(false)}
              disabled={processingReturn}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleReturnBook}
              loading={processingReturn}
            >
              Process Return
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
            Confirm returning book <span className="font-semibold text-slate-800 dark:text-white">"{selectedTransaction?.book.title}"</span> from student <span className="font-semibold text-slate-800 dark:text-white">"{selectedTransaction?.student.name}"</span>?
          </p>

          {selectedTransaction && parseFloat(selectedTransaction.potential_fine) > 0 && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-800 dark:text-rose-350">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Late Fine Applies</p>
                <p className="text-sm font-semibold mt-0.5">
                  Due date was {selectedTransaction.return_date}. Accumulated late fine is ₹{selectedTransaction.potential_fine} (₹10/day).
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default IssuedBooks;
