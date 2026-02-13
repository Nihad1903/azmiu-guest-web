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
      <span className="text-sm text-gray-600">
        Total: {totalCount} request{totalCount !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevious}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="flex items-center px-2 text-sm text-gray-600">
          Page {page}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
