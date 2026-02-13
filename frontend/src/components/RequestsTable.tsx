import type { QRRequest, UserRole } from "../types/api.ts";
import StatusBadge from "./StatusBadge.tsx";

interface RequestsTableProps {
  requests: QRRequest[];
  userRole: UserRole;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (request: QRRequest) => void;
  onDownloadQR?: (request: QRRequest) => void;
  actionLoading?: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

export default function RequestsTable({
  requests,
  userRole,
  onDelete,
  onApprove,
  onReject,
  onDownloadQR,
  actionLoading,
}: RequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
        No requests found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Guest
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Status
            </th>
            {userRole === "SUPERUSER" && (
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Manager
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              QR Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Remark
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                {req.guest_name} {req.guest_surname}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {req.guest_email}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {req.guest_phone || "-"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <StatusBadge status={req.status} />
                {req.status === "REJECTED" && req.rejection_reason && (
                  <p className="mt-1 max-w-xs truncate text-xs text-red-600" title={req.rejection_reason}>
                    {req.rejection_reason}
                  </p>
                )}
              </td>
              {userRole === "SUPERUSER" && (
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {req.manager?.username ?? "-"}
                </td>
              )}
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {req.qr_number || "-"}
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600" title={req.remark}>
                {req.remark || "-"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                {formatDate(req.created_at)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <div className="flex gap-2">
                  {userRole === "SUPERUSER" && req.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => onApprove?.(req.id)}
                        disabled={actionLoading === req.id}
                        className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === req.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => onReject?.(req)}
                        disabled={actionLoading === req.id}
                        className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {userRole === "MANAGER" && req.status === "PENDING" && (
                    <button
                      onClick={() => onDelete?.(req.id)}
                      disabled={actionLoading === req.id}
                      className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === req.id ? "..." : "Delete"}
                    </button>
                  )}
                  {req.status === "APPROVED" && req.qr_number && (
                    <button
                      onClick={() => onDownloadQR?.(req)}
                      disabled={actionLoading === req.id}
                      className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {actionLoading === req.id ? "..." : "Download QR"}
                    </button>
                  )}
                  {req.status === "REJECTED" && (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
