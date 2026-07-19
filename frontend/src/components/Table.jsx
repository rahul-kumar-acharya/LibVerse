import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-250/60 p-6 rounded-2xl shadow-sm">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-slate-700 dark:text-slate-300 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-100/50 dark:shadow-none">
      <table className="w-full border-collapse text-left bg-white dark:bg-slate-900">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-100/40'} hover:bg-olive-green/10 transition-colors`}
            >
              {columns.map((col, colIdx) => {
                const cellValue = col.render
                  ? col.render(row, rowIdx)
                  : row[col.key];
                  
                return (
                  <td
                    key={colIdx}
                    className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap"
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
