import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { extractErrorMessage } from "../hooks/useApiError.ts";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login({ username, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm px-4">
        <div className="rounded-lg border border-stone-200 bg-white p-8">
          <div className="mb-8 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-900">
              <span className="text-xl font-semibold text-white">A</span>
            </div>
          </div>

          <h1 className="mb-1 text-center text-xl font-semibold text-stone-900">
            Welcome back
          </h1>
          <p className="mb-6 text-center text-sm text-stone-500">
            Sign in to continue
          </p>

          {error && (
            <div className="mb-6 rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:outline-none transition-colors"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          AZMIU Guest Management
        </p>
      </div>
    </div>
  );
}
