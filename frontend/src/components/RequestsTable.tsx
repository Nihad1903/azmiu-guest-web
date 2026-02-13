import type { QRRequest, UserRole } from "../types/api.ts";
import StatusBadge from "./StatusBadge.tsx";

interface RequestsTableProps {
  requests: QRRequest[];
  userRole: UserRole;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (request: QRRequest) => void;
  onDownloadQR?: (request: QRRequest) => void;
  onGuestClick?: (request: QRRequest) => void;
  actionLoading?: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RequestsTable({
  requests,
  userRole,
  onDelete,
  onApprove,
  onReject,
  onDownloadQR,
  onGuestClick,
  actionLoading,
}: RequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white py-12 text-center">
        <p className="text-stone-500">No requests found</p>
        <p className="text-sm text-stone-400 mt-1">Requests will appear here once created</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                Guest
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                Status
              </th>
              {userRole === "SUPERUSER" && (
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  Manager
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3">
                  <button 
                    onClick={() => onGuestClick?.(req)}
                    className="flex items-center gap-3 group text-left"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-600 font-medium text-sm group-hover:bg-stone-200 transition-colors">
                      {req.guest_name.charAt(0)}{req.guest_surname.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900 group-hover:text-stone-600 transition-colors">{req.guest_name} {req.guest_surname}</p>
                      {req.remark && (
                        <p className="text-xs text-stone-400 max-w-[180px] truncate">{req.remark}</p>
                      )}
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-stone-900">{req.guest_email}</p>
                  <p className="text-xs text-stone-400">{req.guest_phone || "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={req.status} />
                </td>
                {userRole === "SUPERUSER" && (
                  <td className="px-4 py-3">
                    <span className="text-sm text-stone-600">{req.manager?.username ?? "—"}</span>
                  </td>
                )}
                <td className="px-4 py-3">
                  <span className="text-sm text-stone-500">{formatDate(req.created_at)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {userRole === "SUPERUSER" && req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => onApprove?.(req.id)}
                          disabled={actionLoading === req.id}
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === req.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => onReject?.(req)}
                          disabled={actionLoading === req.id}
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {userRole === "MANAGER" && req.status === "PENDING" && (
                      <button
                        onClick={() => onDelete?.(req.id)}
                        disabled={actionLoading === req.id}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                      >
                        {actionLoading === req.id ? "..." : "Delete"}
                      </button>
                    )}
                    {req.status === "APPROVED" && req.qr_number && (
                      <button
                        onClick={() => onDownloadQR?.(req)}
                        disabled={actionLoading === req.id}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-50 transition-colors"
                      >
                        {actionLoading === req.id ? "..." : "Download QR"}
                      </button>
                    )}
                    {req.status === "REJECTED" && (
                      <span className="text-xs text-stone-400">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
