import { useEffect, useRef, useState } from 'react';
import { createLead, type LeadInput } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  source?: string;
}

export function LeadCaptureModal({ open, onClose, source = 'website' }: Props) {
  const dlg = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<LeadInput>({
    contact_name: '',
    email: '',
    business_name: '',
    goal: '',
    source,
  });

  useEffect(() => {
    if (open) {
      setDone(false);
      setError(null);
      const id = setTimeout(() => dlg.current?.querySelector<HTMLInputElement>('input')?.focus(), 80);
      return () => clearTimeout(id);
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contact_name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await createLead(form);
    setSubmitting(false);
    if (!res) {
      setError('Something broke. Try again or email hello@meetdelai.com.');
      return;
    }
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        ref={dlg}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto border border-line bg-bg-2 p-8 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 font-mono text-mono-label text-ink-muted hover:text-ink"
          aria-label="Close"
        >
          ✕
        </button>

        {done ? (
          <div className="space-y-4">
            <p className="label-mono">Connected</p>
            <h2 className="font-display text-headline-md text-ink">You're in.</h2>
            <p className="text-body-md text-ink-muted">
              I read every message myself. Expect a real reply within a business day —
              not a sequence, not a calendar trap. If we're a fit, we'll book a call from there.
            </p>
            <button onClick={onClose} className="btn-ghost mt-2">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <p className="label-mono mb-2">Start a conversation</p>
              <h2 className="font-display text-headline-md text-ink">
                What are you trying to operationalize?
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Tell us where the friction is. We'll come back with an honest read — no drip sequences, no discovery deck.
              </p>
            </div>

            <Field label="Name" required value={form.contact_name} onChange={(v) => setForm({ ...form, contact_name: v })} />
            <Field label="Email" required type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Company (optional)" value={form.business_name || ''} onChange={(v) => setForm({ ...form, business_name: v })} />
            <Textarea
              label="What are you building?"
              value={form.goal || ''}
              onChange={(v) => setForm({ ...form, goal: v })}
              placeholder="Where you are, what's stuck, what good looks like."
            />

            {error ? <p className="font-mono text-sm text-ink">⚠︎ {error}</p> : null}

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? 'Sending…' : 'Send'}
            </button>
            <p className="font-mono text-mono-label text-ink-faint text-center">
              Direct line — no drip sequences.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="label-mono mb-2 block">{label}{required ? ' *' : ''}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input-brutal"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="label-mono mb-2 block">{label}</span>
      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input-brutal resize-y"
      />
    </label>
  );
}
