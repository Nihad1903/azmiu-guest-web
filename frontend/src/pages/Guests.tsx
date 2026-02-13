import { useCallback, useEffect, useState } from "react";
import type { QRRequest } from "../types/api.ts";
import { deleteRequest, downloadQRCode, getMyRequests } from "../services/qrRequestService.ts";
import { extractErrorMessage } from "../hooks/useApiError.ts";
import RequestsTable from "../components/RequestsTable.tsx";
import Pagination from "../components/Pagination.tsx";
import GuestDetailModal from "../components/GuestDetailModal.tsx";

export default function GuestsPage() {
  const [requests, setRequests] = useState<QRRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<QRRequest | null>(null);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Guests</h1>
          <p className="text-sm text-stone-500">
            View and manage your guest requests
          </p>
        </div>
        <button
          onClick={() => fetchRequests(page)}
          disabled={isLoading}
          className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading && requests.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white py-12 text-center">
          <p className="text-stone-500">Loading guests...</p>
        </div>
      ) : (
        <>
          <RequestsTable
            requests={requests}
            userRole="MANAGER"
            onDelete={handleDelete}
            onDownloadQR={handleDownloadQR}
            onGuestClick={setSelectedGuest}
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

      <GuestDetailModal
        request={selectedGuest}
        onClose={() => setSelectedGuest(null)}
      />
    </div>
  );
}
