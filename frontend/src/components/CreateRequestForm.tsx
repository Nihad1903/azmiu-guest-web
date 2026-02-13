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
    <form onSubmit={handleSubmit} className="rounded-lg border border-stone-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-stone-900">New Guest Request</h2>
        <p className="text-sm text-stone-500">Create a new QR code request for a guest</p>
      </div>

      {error && (
        <div className="mb-5 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          Request created successfully
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            First Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="guest_name"
            required
            value={form.guest_name}
            onChange={handleChange}
            placeholder="John"
            className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Last Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="guest_surname"
            required
            value={form.guest_surname}
            onChange={handleChange}
            placeholder="Doe"
            className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            name="guest_email"
            required
            value={form.guest_email}
            onChange={handleChange}
            placeholder="john.doe@example.com"
            className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            name="guest_phone"
            value={form.guest_phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Remark
          </label>
          <textarea
            name="remark"
            rows={3}
            value={form.remark}
            onChange={handleChange}
            placeholder="Additional notes about the guest visit..."
            className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Request"}
        </button>
      </div>
    </form>
  );
}
