'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui';

export default function A11yTestPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">A11y test page (temporary)</h1>
      <button
        id="trigger"
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper"
      >
        Open dialog
      </button>
      <a id="after" href="#after" className="ml-4 text-sm underline">
        Outside link
      </a>
      <Modal open={open} onClose={() => setOpen(false)} title="Test dialog">
        <p className="text-sm">Dialog body.</p>
        <input id="dlg-input" className="mt-3 w-full rounded border p-2" placeholder="Dialog input" />
        <button
          id="dlg-btn"
          type="button"
          className="mt-3 rounded-full bg-ink px-4 py-2 text-sm text-paper"
          onClick={() => setOpen(false)}
        >
          Done
        </button>
      </Modal>
    </div>
  );
}
