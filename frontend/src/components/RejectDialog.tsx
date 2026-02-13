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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleCancel}
    >
      <div 
        className="w-full max-w-md rounded-lg bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-stone-900">Reject Request</h3>
        <p className="mt-1 text-sm text-stone-500">
          This action cannot be undone.
        </p>

        <p className="mt-4 text-sm text-stone-600">
          You are about to reject the request for <span className="font-medium text-stone-900">{guestName}</span>.
        </p>

        <div className="mt-4">
          <label
            htmlFor="rejection-reason"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="rejection-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none transition-colors resize-none"
            placeholder="Provide a reason for rejection..."
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || isSubmitting}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
