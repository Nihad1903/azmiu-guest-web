import type { QRRequestStatus } from "../types/api.ts";

const statusConfig: Record<QRRequestStatus, { bg: string; text: string; label: string }> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Pending",
  },
  APPROVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Approved",
  },
  REJECTED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    label: "Rejected",
  },
};

interface StatusBadgeProps {
  status: QRRequestStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
