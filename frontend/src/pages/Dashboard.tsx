import { useAuth } from "../context/AuthContext.tsx";
import ManagerDashboard from "./ManagerDashboard.tsx";
import SuperUserDashboard from "./SuperUserDashboard.tsx";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "SUPERUSER") {
    return <SuperUserDashboard />;
  }

  return <ManagerDashboard />;
}
