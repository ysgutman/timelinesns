import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationData } from '../types/index.ts';

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  isLoading,
}) => {
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1 && total <= limit) {
    if (total === 0) return null;
    return (
      <div className="py-4 text-center text-xs text-slate-400">
        전체 {total}개의 글이 모두 표시되었습니다.
      </div>
    );
  }

  // Calculate visible page window (e.g. 1 to 5, or window around current page)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
      {/* Total Count Info */}
      <div className="text-xs text-slate-500">
        전체 <strong className="text-slate-800">{total}</strong>개 글 중{' '}
        <span className="font-semibold text-slate-800">
          {startItem}-{endItem}
        </span>
        번째 표시 (페이지 {page} / {totalPages})
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1 select-none">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || isLoading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="첫 페이지"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="이전 페이지"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {pages.map((p) => {
            const isActive = p === page;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-xs shadow-sky-200 scale-105'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="다음 페이지"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || isLoading}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="마지막 페이지"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
