'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin } from 'lucide-react';
import { getSettings } from '@/lib/store';

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const { supportEmail } = getSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Order support');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [reference, setReference] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Please enter a valid email address.';
    if (message.trim().length < 10)
      next.message = 'Tell us a little more (at least 10 characters).';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setReference(`NM-${Math.floor(100000 + Math.random() * 900000)}`);
    setSent(true);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
        Contact
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
        We&apos;re here to help
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Questions about an order, a product or a return? Send us a message and a
        real human will get back to you — usually within one business day.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <Mail className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Email us</h2>
              <a
                href={`mailto:${supportEmail}`}
                className="mt-1 block text-sm text-indigo-600 hover:underline"
              >
                {supportEmail}
              </a>
              <p className="mt-1 text-xs text-slate-500">
                For order issues, include your order number.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <Clock className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Support hours
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Monday – Friday, 9am – 6pm CT
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Average first response: under 4 hours.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <MapPin className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Headquarters
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                400 Congress Ave, Suite 1200
                <br />
                Austin, TX 78701
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {sent ? (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <CheckCircle2
                className="mx-auto h-14 w-14 text-emerald-600"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Message received
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Thanks, {name.trim().split(' ')[0] || 'there'} — your message is
                on its way. We&apos;ll reply to{' '}
                <span className="font-medium text-slate-900">
                  {email.trim()}
                </span>{' '}
                within one business day.
              </p>
              <p className="mt-4 inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Reference: {reference}
              </p>
            </div>
          ) : (
            <form
              onSubmit={submit}
              noValidate
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Cooper"
                    aria-invalid={errors.name ? 'true' : undefined}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                  {errors.name && (
                    <p role="alert" className="mt-1.5 text-xs text-rose-600">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    aria-invalid={errors.email ? 'true' : undefined}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1.5 text-xs text-rose-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5">
                <label
                  htmlFor="contact-topic"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Topic
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                >
                  {[
                    'Order support',
                    'Shipping & delivery',
                    'Returns & refunds',
                    'Product question',
                    'Partnership',
                    'Something else',
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-5">
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="How can we help?"
                  aria-invalid={errors.message ? 'true' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
                {errors.message && (
                  <p role="alert" className="mt-1.5 text-xs text-rose-600">
                    {errors.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="mt-6 w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
              >
                Send message
              </button>
              <p className="mt-3 text-xs text-slate-500">
                Prefer email? Write to us directly at{' '}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-indigo-600 hover:underline"
                >
                  {supportEmail}
                </a>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
