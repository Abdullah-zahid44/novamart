import { PackageCheck, RotateCcw, ShieldCheck } from 'lucide-react';
import { getSettings } from '@/lib/store';
import { currency } from '@/lib/format';

export const metadata = {
  title: 'Shipping & returns — NovaMart',
  description:
    'NovaMart shipping options, delivery times and our 30-day return policy.',
};

export default function ShippingPage() {
  const { shippingFlat, freeShipOver } = getSettings();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
        Policies
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Shipping &amp; returns
      </h1>
      <p className="mt-3 text-slate-600">
        Simple rules, no fine print. Here is exactly what to expect when you
        order from NovaMart.
      </p>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <PackageCheck className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          Shipping options
        </h2>
        <div className="mt-5 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Method</th>
                <th className="px-5 py-3 font-semibold">Delivery time</th>
                <th className="px-5 py-3 font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-5 py-4 font-medium text-slate-900">
                  Standard
                </td>
                <td className="px-5 py-4 text-slate-600">
                  3–5 business days
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {currency(shippingFlat)} flat ·{' '}
                  <span className="font-semibold text-emerald-600">
                    free over {currency(freeShipOver)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-4 font-medium text-slate-900">Express</td>
                <td className="px-5 py-4 text-slate-600">
                  1–2 business days
                </td>
                <td className="px-5 py-4 text-slate-600">
                  Calculated at checkout
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="mt-5 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>
            <span className="font-semibold text-slate-900">Processing:</span>{' '}
            orders placed before 2pm CT ship the same business day; later
            orders ship the next business day.
          </li>
          <li>
            <span className="font-semibold text-slate-900">Tracking:</span>{' '}
            every order includes live tracking emailed to you and available on
            the Track page.
          </li>
          <li>
            <span className="font-semibold text-slate-900">Coverage:</span> we
            currently ship within the United States. PO boxes and APO/FPO
            addresses are supported for Standard shipping.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <RotateCcw className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          Returns &amp; refunds
        </h2>
        <ul className="mt-5 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>
            <span className="font-semibold text-slate-900">30 days:</span> you
            have 30 days from delivery to return any unused item in its
            original packaging.
          </li>
          <li>
            <span className="font-semibold text-slate-900">Free return label:</span>{' '}
            start a return from your account or by emailing support and we will
            send a prepaid label — return shipping is on us.
          </li>
          <li>
            <span className="font-semibold text-slate-900">Refunds:</span>{' '}
            issued to your original payment method within 3–5 business days of
            us receiving the item.
          </li>
          <li>
            <span className="font-semibold text-slate-900">Damaged or wrong item:</span>{' '}
            tell us within 14 days with a photo and we will ship a replacement
            immediately, no return needed.
          </li>
        </ul>
      </section>

      <section className="mt-12 rounded-xl bg-indigo-50 p-6 ring-1 ring-indigo-100">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <ShieldCheck className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          Our promise
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          If your package is lost in transit, we reship or refund — your
          choice. You should never pay for a delivery problem that was not
          your fault.
        </p>
      </section>
    </main>
  );
}
