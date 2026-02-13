import apiClient, { setTokens } from "./apiClient.ts";
import type { LoginRequest, LoginResponse } from "../types/api.ts";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    "/api/auth/login/",
    credentials,
  );
  setTokens(data.token, data.refresh);
  return data;
}
