export type UserRole = "MANAGER" | "SUPERUSER";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface UserBrief {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh: string;
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh: string;
}

export type QRRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface QRRequest {
  id: string;
  guest_name: string;
  guest_surname: string;
  guest_email: string;
  guest_phone: string;
  remark: string;
  status: QRRequestStatus;
  rejection_reason: string;
  manager: UserBrief;
  approved_by: UserBrief | null;
  approved_at: string | null;
  novus_user_id: string | null;
  novus_card_id: string | null;
  novus_credential_id: string | null;
  qr_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface QRRequestCreatePayload {
  guest_name: string;
  guest_surname: string;
  guest_email: string;
  guest_phone?: string;
  remark?: string;
}

export interface QRRequestCreateResponse {
  id: string;
  guest_name: string;
  guest_surname: string;
  guest_email: string;
  guest_phone: string;
  remark: string;
  status: QRRequestStatus;
  manager: string;
  created_at: string;
}

export interface RejectPayload {
  rejection_reason: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorResponse {
  detail?: string;
  novus?: string;
  [key: string]: unknown;
}
