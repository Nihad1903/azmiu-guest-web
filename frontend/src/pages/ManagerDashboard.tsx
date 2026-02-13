import { useCallback, useEffect, useState } from "react";
import type { QRRequest } from "../types/api.ts";
import { deleteRequest, downloadQRCode, getMyRequests } from "../services/qrRequestService.ts";
import { extractErrorMessage } from "../hooks/useApiError.ts";
import CreateRequestForm from "../components/CreateRequestForm.tsx";
import RequestsTable from "../components/RequestsTable.tsx";
import Pagination from "../components/Pagination.tsx";

export default function ManagerDashboard() {
  const [requests, setRequests] = useState<QRRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyRequests(p);
      setRequests(data.results);
      setTotalCount(data.count);
      setHasNext(data.next !== null);
      setHasPrevious(data.previous !== null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(page);
  }, [page, fetchRequests]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this request?")) {
      return;
    }
    setActionLoading(id);
    try {
      await deleteRequest(id);
      await fetchRequests(page);
    } catch (err) {
      alert(extractErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreated = () => {
    setPage(1);
    fetchRequests(1);
  };

  const handleDownloadQR = async (request: QRRequest) => {
    setActionLoading(request.id);
    try {
      await downloadQRCode(request.id, `${request.guest_name}_${request.guest_surname}`);
    } catch (err) {
      alert(extractErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <CreateRequestForm onCreated={handleCreated} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Requests</h2>
          <button
            onClick={() => fetchRequests(page)}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading && requests.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
            Loading requests...
          </div>
        ) : (
          <>
            <RequestsTable
              requests={requests}
              userRole="MANAGER"
              onDelete={handleDelete}
              onDownloadQR={handleDownloadQR}
              actionLoading={actionLoading}
            />
            <Pagination
              page={page}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              totalCount={totalCount}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
