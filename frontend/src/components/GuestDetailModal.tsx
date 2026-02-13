import type { QRRequest } from "../types/api.ts";
import StatusBadge from "./StatusBadge.tsx";
import { useState } from "react";
import { downloadQRCode } from "../services/qrRequestService.ts";
import { extractErrorMessage } from "../hooks/useApiError.ts";

interface GuestDetailModalProps {
  request: QRRequest | null;
  onClose: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GuestDetailModal({ request, onClose }: GuestDetailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!request) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadQRCode(request.id, `${request.guest_name}_${request.guest_surname}`);
    } catch (err) {
      alert(extractErrorMessage(err));
    } finally {
      setIsDownloading(false);
    }
  };

  const qrDisplayUrl = request.qr_number 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(request.qr_number)}`
    : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-600 font-medium text-lg">
              {request.guest_name.charAt(0)}{request.guest_surname.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {request.guest_name} {request.guest_surname}
              </h2>
              <p className="text-sm text-stone-500 mt-0.5">{request.guest_email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-t border-stone-100" />

        <div className="px-6 py-5 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500">Status</span>
            <StatusBadge status={request.status} />
          </div>

          {/* QR Code Section */}
          {request.status === "APPROVED" && request.qr_number && (
            <div className="flex flex-col items-center py-6 border border-stone-200 rounded-lg">
              <div className="p-3 bg-white border border-stone-100 rounded-lg">
                <img 
                  src={qrDisplayUrl!}
                  alt="QR Code"
                  className="w-40 h-40"
                />
              </div>
              <p className="mt-4 font-mono text-xs text-stone-500 tracking-wide">
                {request.qr_number}
              </p>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="mt-4 text-sm font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2 decoration-stone-300 hover:decoration-stone-400 disabled:opacity-50 transition-colors"
              >
                {isDownloading ? "Downloading..." : "Download QR Code"}
              </button>
            </div>
          )}

          {/* Rejection Reason */}
          {request.status === "REJECTED" && request.rejection_reason && (
            <div className="py-3 px-4 bg-rose-50 border border-rose-100 rounded-lg">
              <p className="text-xs font-medium text-rose-400 uppercase tracking-wide mb-1">Rejection Reason</p>
              <p className="text-sm text-rose-700 whitespace-pre-wrap break-words">{request.rejection_reason}</p>
            </div>
          )}

          {/* Phone */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500">Phone</span>
            <span className="text-sm text-stone-900">{request.guest_phone || "—"}</span>
          </div>

          {/* Remark */}
          {request.remark && (
            <div>
              <p className="text-sm text-stone-500 mb-1.5">Remark</p>
              <p className="text-sm text-stone-700 leading-relaxed">{request.remark}</p>
            </div>
          )}

          <div className="border-t border-stone-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">Requested by</span>
              <span className="text-sm text-stone-900">{request.manager?.username ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">Reviewed by</span>
              <span className="text-sm text-stone-900">{request.approved_by?.username ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">Created</span>
              <span className="text-sm text-stone-700">{formatDate(request.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">Updated</span>
              <span className="text-sm text-stone-700">{formatDate(request.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
