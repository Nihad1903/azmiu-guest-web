import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold text-gray-900">
            AZMIU Guest QR
          </h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.username}{" "}
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
