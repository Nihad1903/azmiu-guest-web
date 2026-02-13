import { useCallback } from "react";
import { AxiosError } from "axios";

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data) {
      if (typeof data === "string") return data;
      if (typeof data.detail === "string") return data.detail;
      if (typeof data.novus === "string") return data.novus;
      // Handle DRF validation errors (field → string[])
      if (typeof data === "object") {
        const messages: string[] = [];
        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
          if (Array.isArray(value)) {
            messages.push(`${key}: ${value.join(", ")}`);
          } else if (typeof value === "string") {
            messages.push(`${key}: ${value}`);
          }
        }
        if (messages.length) return messages.join("; ");
      }
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

export function useApiError() {
  return useCallback((error: unknown): string => {
    return extractErrorMessage(error);
  }, []);
}
