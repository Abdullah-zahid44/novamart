// Demo-order seeder for the admin orders pages (Agent 7).
// The build contract does not define seeded orders, so the admin orders UI
// would otherwise render empty on a fresh store. This seeds a small,
// realistic set of demo orders exactly once via the public store API —
// it never overwrites existing orders.

import { createOrder, getOrders, getProducts, getSettings } from '@/lib/store';
import type { Address, OrderItem, OrderStatus, Product } from '@/lib/types';

let seeded = false;

const DEMO_CUSTOMERS: { name: string; email: string; address: Address }[] = [
  {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@example.com',
    address: {
      fullName: 'Sarah Mitchell',
      phone: '+1 512-555-0148',
      street: '4821 Maple Ave, Apt 3B',
      city: 'Austin',
      postal: '78701',
      country: 'United States',
    },
  },
  {
    name: 'James Carter',
    email: 'james.carter@example.com',
    address: {
      fullName: 'James Carter',
      phone: '+1 213-555-0193',
      street: '2300 Sunset Blvd',
      city: 'Los Angeles',
      postal: '90026',
      country: 'United States',
    },
  },
  {
    name: 'Emily Nguyen',
    email: 'emily.nguyen@example.com',
    address: {
      fullName: 'Emily Nguyen',
      phone: '+1 206-555-0117',
      street: '15 Harbor Lane',
      city: 'Seattle',
      postal: '98101',
      country: 'United States',
    },
  },
  {
    name: 'David Okafor',
    email: 'david.okafor@example.com',
    address: {
      fullName: 'David Okafor',
      phone: '+1 404-555-0162',
      street: '900 Peachtree St NE',
      city: 'Atlanta',
      postal: '30309',
      country: 'United States',
    },
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    address: {
      fullName: 'Maria Garcia',
      phone: '+1 305-555-0184',
      street: '410 Brickell Ave, Unit 1204',
      city: 'Miami',
      postal: '33131',
      country: 'United States',
    },
  },
];

const DEMO_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function toItem(product: Product, qty: number): OrderItem {
  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    qty,
    image: product.images[0],
    color: product.colors[0],
  };
}

export function ensureDemoOrders(): void {
  if (seeded) return;
  seeded = true;
  if (typeof window === 'undefined') return;
  try {
    if (getOrders().length > 0) return;
    const products = getProducts();
    if (products.length === 0) return;
    const settings = getSettings();

    DEMO_CUSTOMERS.forEach((customer, idx) => {
      const picks = [0, 1, 2].map((k) => products[(idx * 2 + k) % products.length]);
      const items = picks.map((p, i) => toItem(p, ((idx + i) % 2) + 1));
      const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      const shipping = subtotal >= settings.freeShipOver ? 0 : settings.shippingFlat;
      const tax = Math.round(subtotal * settings.taxRate * 100) / 100;
      const total = Math.round((subtotal + shipping + tax) * 100) / 100;
      const card = idx % 2 === 0;

      createOrder({
        name: customer.name,
        email: customer.email,
        items,
        subtotal,
        discount: 0,
        shipping,
        tax,
        total,
        status: DEMO_STATUSES[idx],
        paymentMethod: card ? 'Credit Card' : 'PayPal',
        paymentLast4: card ? '4242' : undefined,
        address: customer.address,
      });
    });
  } catch {
    // Demo seeding is best-effort; the pages render an empty state on failure.
  }
}
