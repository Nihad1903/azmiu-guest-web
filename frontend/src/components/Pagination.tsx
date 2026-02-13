interface PaginationProps {
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  hasNext,
  hasPrevious,
  totalCount,
  onPageChange,
}: PaginationProps) {
  if (!hasNext && !hasPrevious) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-sm text-stone-500">
        {totalCount} request{totalCount !== 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevious}
          className="rounded-md px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-sm font-medium text-stone-900">
          {page}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="rounded-md px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
