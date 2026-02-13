import { useCallback, useEffect, useState } from "react";
import type { QRRequest } from "../types/api.ts";
import { getAllRequests, getMyRequests } from "../services/qrRequestService.ts";
import { extractErrorMessage } from "../hooks/useApiError.ts";
import { useAuth } from "../context/AuthContext.tsx";
import StatusBadge from "../components/StatusBadge.tsx";
import Pagination from "../components/Pagination.tsx";
import GuestDetailModal from "../components/GuestDetailModal.tsx";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LogsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<QRRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<QRRequest | null>(null);

  const fetchRequests = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetcher = user?.role === "SUPERUSER" ? getAllRequests : getMyRequests;
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
  }, [user?.role]);

  useEffect(() => {
    fetchRequests(page);
  }, [page, fetchRequests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Activity Logs</h1>
          <p className="text-sm text-stone-500">
            View all QR request activities and status changes
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
          <p className="text-stone-500">Loading activity logs...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white py-12 text-center">
          <p className="text-stone-500">No activity logs yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Status
                  </th>
                  {user?.role === "SUPERUSER" && (
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                      Manager
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Reviewed By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        onClick={() => setSelectedGuest(req)}
                        className="text-left group"
                      >
                        <p className="text-sm font-medium text-stone-900 group-hover:text-stone-600 transition-colors">
                          {req.guest_name} {req.guest_surname}
                        </p>
                        <p className="text-xs text-stone-400">{req.guest_email}</p>
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    {user?.role === "SUPERUSER" && (
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-600">
                        {req.manager?.username ?? "—"}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-600">
                      {req.approved_by?.username ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-500">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-500">
                      {formatDate(req.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={page}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        totalCount={totalCount}
        onPageChange={setPage}
      />

      <GuestDetailModal
        request={selectedGuest}
        onClose={() => setSelectedGuest(null)}
      />
    </div>
  );
}
