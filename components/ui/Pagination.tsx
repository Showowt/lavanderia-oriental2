'use client';

import { cn } from '@/lib/utils';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Button>

      {pages.map((pageNum, index) => {
        if (pageNum === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-gray-400"
            >
              ...
            </span>
          );
        }

        return (
          <Button
            key={pageNum}
            variant={pageNum === page ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(pageNum as number)}
            className="min-w-[36px]"
          >
            {pageNum}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </nav>
  );
}

function getPageNumbers(
  current: number,
  total: number
): (number | '...')[] {
  const delta = 1;
  const range: (number | '...')[] = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  if (current - delta > 2) {
    range.unshift('...');
  }

  if (current + delta < total - 1) {
    range.push('...');
  }

  range.unshift(1);
  if (total > 1) {
    range.push(total);
  }

  return range;
}

// Compact pagination info display
interface PaginationInfoProps {
  page: number;
  pageSize: number;
  total: number;
  className?: string;
}

export function PaginationInfo({
  page,
  pageSize,
  total,
  className,
}: PaginationInfoProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (total === 0) {
    return (
      <span className={cn('text-sm text-gray-500', className)}>
        No hay resultados
      </span>
    );
  }

  return (
    <span className={cn('text-sm text-gray-500', className)}>
      Mostrando {from}-{to} de {total}
    </span>
  );
}
