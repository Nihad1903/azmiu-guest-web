import { useState } from "react";

interface RejectDialogProps {
  isOpen: boolean;
  guestName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function RejectDialog({
  isOpen,
  guestName,
  onConfirm,
  onCancel,
  isSubmitting,
}: RejectDialogProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason("");
    }
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Reject Request</h3>
        <p className="mt-1 text-sm text-gray-600">
          Rejecting QR request for <strong>{guestName}</strong>.
        </p>
        <div className="mt-4">
          <label
            htmlFor="rejection-reason"
            className="block text-sm font-medium text-gray-700"
          >
            Rejection reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejection-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Provide a reason for rejection..."
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || isSubmitting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
