import { useCallback, useEffect, useState } from "react";
import type { QRRequest } from "../types/api.ts";
import {
  approveRequest,
  downloadQRCode,
  getAllRequests,
  getPendingRequests,
  rejectRequest,
} from "../services/qrRequestService.ts";
import { extractErrorMessage } from "../hooks/useApiError.ts";
import RequestsTable from "../components/RequestsTable.tsx";
import RejectDialog from "../components/RejectDialog.tsx";
import Pagination from "../components/Pagination.tsx";

type ViewMode = "pending" | "all";

export default function SuperUserDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("pending");
  const [requests, setRequests] = useState<QRRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<QRRequest | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchRequests = useCallback(
    async (p: number, mode: ViewMode) => {
      setIsLoading(true);
      setError(null);
      try {
        const fetcher = mode === "pending" ? getPendingRequests : getAllRequests;
        const data = await fetcher(p);
        setRequests(data.results);
        setTotalCount(data.count);
        setHasNext(data.next !== null);
        setHasPrevious(data.previous !== null);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRequests(page, viewMode);
  }, [page, viewMode, fetchRequests]);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this request? This will trigger NOVUS provisioning.")) {
      return;
    }
    setActionLoading(id);
    try {
      await approveRequest(id);
      await fetchRequests(page, viewMode);
    } catch (err) {
      alert(extractErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOpen = (request: QRRequest) => {
    setRejectTarget(request);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    try {
      await rejectRequest(rejectTarget.id, { rejection_reason: reason });
      setRejectTarget(null);
      await fetchRequests(page, viewMode);
    } catch (err) {
      alert(extractErrorMessage(err));
    } finally {
      setIsRejecting(false);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setPage(1);
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
        <h2 className="text-lg font-semibold text-gray-900">QR Requests</h2>
        <div className="flex gap-2">
          <div className="flex rounded-md border border-gray-300">
            <button
              onClick={() => handleViewModeChange("pending")}
              className={`px-3 py-1.5 text-sm font-medium ${
                viewMode === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } rounded-l-md`}
            >
              Pending
            </button>
            <button
              onClick={() => handleViewModeChange("all")}
              className={`px-3 py-1.5 text-sm font-medium ${
                viewMode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } rounded-r-md`}
            >
              All
            </button>
          </div>
          <button
            onClick={() => fetchRequests(page, viewMode)}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
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
            userRole="SUPERUSER"
            onApprove={handleApprove}
            onReject={handleRejectOpen}
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

      <RejectDialog
        isOpen={rejectTarget !== null}
        guestName={
          rejectTarget
            ? `${rejectTarget.guest_name} ${rejectTarget.guest_surname}`
            : ""
        }
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
        isSubmitting={isRejecting}
      />
    </div>
  );
}
