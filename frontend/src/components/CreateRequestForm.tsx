import { useState } from "react";
import type { FormEvent } from "react";
import type { QRRequestCreatePayload } from "../types/api.ts";
import { createQRRequest } from "../services/qrRequestService.ts";
import { extractErrorMessage } from "../hooks/useApiError.ts";

interface CreateRequestFormProps {
  onCreated: () => void;
}

const initialForm: QRRequestCreatePayload = {
  guest_name: "",
  guest_surname: "",
  guest_email: "",
  guest_phone: "",
  remark: "",
};

export default function CreateRequestForm({
  onCreated,
}: CreateRequestFormProps) {
  const [form, setForm] = useState<QRRequestCreatePayload>({ ...initialForm });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await createQRRequest(form);
      setForm({ ...initialForm });
      setSuccess(true);
      onCreated();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        New Guest QR Request
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          Request created successfully.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Guest Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="guest_name"
            required
            value={form.guest_name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Guest Surname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="guest_surname"
            required
            value={form.guest_surname}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Guest Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="guest_email"
            required
            value={form.guest_email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Guest Phone
          </label>
          <input
            type="tel"
            name="guest_phone"
            value={form.guest_phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Remark
          </label>
          <textarea
            name="remark"
            rows={2}
            value={form.remark}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
