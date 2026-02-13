import { useNavigate } from "react-router-dom";
import CreateRequestForm from "../components/CreateRequestForm.tsx";

export default function CreateGuestPage() {
  const navigate = useNavigate();

  const handleCreated = () => {
    navigate("/guests");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Create Guest</h1>
        <p className="text-sm text-stone-500">
          Submit a new QR code request for a guest
        </p>
      </div>

      <CreateRequestForm onCreated={handleCreated} />
    </div>
  );
}
