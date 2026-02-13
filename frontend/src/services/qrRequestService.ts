import apiClient, { getAccessToken } from "./apiClient.ts";
import type {
  PaginatedResponse,
  QRRequest,
  QRRequestCreatePayload,
  QRRequestCreateResponse,
  RejectPayload,
} from "../types/api.ts";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:9000";

// ── Manager endpoints ──────────────────────────────────────────

export async function createQRRequest(
  payload: QRRequestCreatePayload,
): Promise<QRRequestCreateResponse> {
  const { data } = await apiClient.post<QRRequestCreateResponse>(
    "/api/qr-requests/",
    payload,
  );
  return data;
}

export async function getMyRequests(
  page = 1,
): Promise<PaginatedResponse<QRRequest>> {
  const { data } = await apiClient.get<PaginatedResponse<QRRequest>>(
    "/api/qr-requests/my/",
    { params: { page } },
  );
  return data;
}

export async function deleteRequest(id: string): Promise<void> {
  await apiClient.delete(`/api/qr-requests/${id}/`);
}

// ── SuperUser endpoints ────────────────────────────────────────

export async function getAllRequests(
  page = 1,
): Promise<PaginatedResponse<QRRequest>> {
  const { data } = await apiClient.get<PaginatedResponse<QRRequest>>(
    "/api/qr-requests/all/",
    { params: { page } },
  );
  return data;
}

export async function getPendingRequests(
  page = 1,
): Promise<PaginatedResponse<QRRequest>> {
  const { data } = await apiClient.get<PaginatedResponse<QRRequest>>(
    "/api/qr-requests/pending/",
    { params: { page } },
  );
  return data;
}

export async function approveRequest(id: string): Promise<QRRequest> {
  const { data } = await apiClient.post<QRRequest>(
    `/api/qr-requests/${id}/approve/`,
  );
  return data;
}

export async function rejectRequest(
  id: string,
  payload: RejectPayload,
): Promise<QRRequest> {
  const { data } = await apiClient.post<QRRequest>(
    `/api/qr-requests/${id}/reject/`,
    payload,
  );
  return data;
}

/**
 * Download QR code image for an approved request.
 * Opens the download in a new way by fetching the blob and triggering download.
 */
export async function downloadQRCode(id: string, guestName: string): Promise<void> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/qr-requests/${id}/qr-code/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to download QR code');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `qr_${guestName.replace(/\s+/g, '_')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
