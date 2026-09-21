'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Clock, Mail } from 'lucide-react';
import { EditorialHeader } from '@/components/home/EditorialHeader';
import { Button, Card, Input, Select, Textarea, Reveal } from '@/components/ui';

const TOPICS = [
  { value: 'order', label: 'Order help' },
  { value: 'returns', label: 'Returns & refunds' },
  { value: 'product', label: 'Product question' },
  { value: 'other', label: 'Something else' },
];

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('order');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'That email does not look right.';
    if (message.trim().length < 10) next.message = 'Give us a little more detail — ten characters at least.';
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <EditorialHeader
        kicker="Contact"
        title="Talk to a human."
        lede="No chatbots, no ticket black holes. Write to us and a person replies — usually faster than we promise."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
        <Reveal>
          <Card className="p-7 sm:p-9">
            {sent ? (
              <div className="flex flex-col items-start gap-4 py-8">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sand text-accent">
                  <CheckCircle2 size={24} aria-hidden />
                </span>
                <h2 className="font-display text-2xl font-semibold text-ink">Message received.</h2>
                <p className="max-w-prose leading-relaxed text-muted">
                  Thanks, {name.trim().split(' ')[0]}. We reply within one business day —
                  usually faster. Keep an eye on <span className="font-medium text-ink">{email.trim()}</span>.
                </p>
                <Button variant="secondary" onClick={() => setSent(false)}>
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    autoComplete="name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    autoComplete="email"
                  />
                </div>
                <Select
                  label="What is this about?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  options={TOPICS}
                />
                <Textarea
                  label="Message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  error={errors.message}
                  placeholder="Order number helps, if you have one."
                />
                <Button type="submit" size="lg">
                  Send message
                </Button>
                <p className="text-xs text-muted">
                  Demo note: this form validates and confirms locally — nothing leaves your browser.
                </p>
              </form>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <aside className="space-y-5">
            <Card className="bg-sand p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-accent">
                <Mail size={20} aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">Email us directly</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Prefer your own inbox? Write to{' '}
                <a href="mailto:support@novamart.com" className="font-semibold text-accent hover:underline">
                  support@novamart.com
                </a>
                .
              </p>
            </Card>
            <Card className="bg-sand p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-accent">
                <Clock size={20} aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">When we reply</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Monday to Friday, 9 to 6 Eastern. Messages sent on weekends get answered
                Monday morning, coffee in hand.
              </p>
            </Card>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
