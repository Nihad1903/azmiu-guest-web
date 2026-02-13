import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Layout from "./components/Layout.tsx";
import LoginPage from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import GuestsPage from "./pages/Guests.tsx";
import CreateGuestPage from "./pages/CreateGuest.tsx";
import LogsPage from "./pages/Logs.tsx";
import NotFound from "./pages/NotFound.tsx";

function RoleBasedRedirect() {
  const { user } = useAuth();
  if (user?.role === "MANAGER") {
    return <Navigate to="/guests" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/guests" element={<GuestsPage />} />
              <Route path="/create-guest" element={<CreateGuestPage />} />
              <Route path="/logs" element={<LogsPage />} />
            </Route>
            {/* Role-based redirect for root */}
            <Route path="/" element={<RoleBasedRedirect />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
