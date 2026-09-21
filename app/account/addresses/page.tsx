"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Home, Pencil, Plus, Trash2, X } from "lucide-react";
import { currentUser, updateUser } from "@/lib/store";
import type { Address, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

const EMPTY: Address = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  postal: "",
  country: "United States",
};

type FieldErrors = Partial<Record<keyof Address, string>>;

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "United Arab Emirates",
  "Saudi Arabia",
  "Pakistan",
  "India",
];

export default function AddressesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Address>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = currentUser();
    if (!u) return;
    setUser(u);
    setAddresses(u.addresses ?? []);
  }, []);

  function set<K extends keyof Address>(key: K, value: Address[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function openAdd() {
    setForm(EMPTY);
    setErrors({});
    setEditIndex(null);
    setFormOpen(true);
  }

  function openEdit(index: number) {
    setForm(addresses[index]);
    setErrors({});
    setEditIndex(index);
    setFormOpen(true);
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (form.fullName.trim().length < 2) e.fullName = "Enter the recipient's full name.";
    if (!form.phone.trim()) e.phone = "Enter a phone number.";
    else if (form.phone.replace(/\D/g, "").length < 6)
      e.phone = "That phone number looks too short.";
    if (!form.street.trim()) e.street = "Enter the street address.";
    if (!form.city.trim()) e.city = "Enter the city.";
    if (!form.postal.trim()) e.postal = "Enter the postal / ZIP code.";
    if (!form.country.trim()) e.country = "Select a country.";
    return e;
  }

  function persist(next: Address[]) {
    if (!user) return;
    updateUser(user.id, { addresses: next });
    setAddresses(next);
  }

  function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    const next =
      editIndex === null
        ? [...addresses, { ...form }]
        : addresses.map((a, i) => (i === editIndex ? { ...form } : a));
    persist(next);
    setSaving(false);
    setFormOpen(false);
  }

  function handleDelete(index: number) {
    const ok = window.confirm("Remove this address from your account?");
    if (!ok) return;
    persist(addresses.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Addresses
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage where your orders get delivered.
          </p>
        </div>
        {!formOpen && (
          <Button variant="primary" onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Add address
          </Button>
        )}
      </div>

      {formOpen && (
        <Card className="mb-6 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {editIndex === null ? "Add a new address" : "Edit address"}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close address form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="fullName"
                label="Full name"
                placeholder="Alex Morgan"
                autoComplete="name"
                value={form.fullName}
                onChange={(ev) => set("fullName", ev.target.value)}
                error={errors.fullName}
              />
              <Input
                id="phone"
                label="Phone number"
                type="tel"
                placeholder="+1 555 010 2030"
                autoComplete="tel"
                value={form.phone}
                onChange={(ev) => set("phone", ev.target.value)}
                error={errors.phone}
              />
            </div>
            <Input
              id="street"
              label="Street address"
              placeholder="123 Palm Street, Apt 4B"
              autoComplete="street-address"
              value={form.street}
              onChange={(ev) => set("street", ev.target.value)}
              error={errors.street}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                id="city"
                label="City"
                placeholder="Austin"
                autoComplete="address-level2"
                value={form.city}
                onChange={(ev) => set("city", ev.target.value)}
                error={errors.city}
              />
              <Input
                id="postal"
                label="Postal / ZIP code"
                placeholder="73301"
                autoComplete="postal-code"
                value={form.postal}
                onChange={(ev) => set("postal", ev.target.value)}
                error={errors.postal}
              />
              <Select
                id="country"
                label="Country"
                value={form.country}
                onChange={(ev) => set("country", ev.target.value)}
                error={errors.country}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : editIndex === null ? "Save address" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {addresses.length === 0 && !formOpen ? (
        <EmptyState
          icon={Home}
          title="No saved addresses"
          hint="Add a delivery address now and checkout will be one click faster."
          action={
            <Button variant="primary" onClick={openAdd}>
              <Plus className="mr-1.5 h-4 w-4" /> Add your first address
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((a, i) => (
            <Card key={`${a.street}-${i}`} className="flex flex-col p-5">
              <address className="flex-1 text-sm not-italic leading-relaxed text-gray-600">
                <p className="font-semibold text-gray-900">{a.fullName}</p>
                <p>{a.street}</p>
                <p>
                  {a.city}, {a.postal}
                </p>
                <p>{a.country}</p>
                <p className="mt-1 text-gray-500">Phone: {a.phone}</p>
              </address>
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <Button variant="outline" size="sm" onClick={() => openEdit(i)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => handleDelete(i)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
