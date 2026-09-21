# NovaMart — SEO Snippets for `app/layout.tsx`

> **Do not edit `app/layout.tsx` directly in this agent** — it is owned by another workstream.
> Merge the block below into the layout's exported `metadata` object.

## Files created by the SEO agent (already on disk)

| File | Purpose |
| --- | --- |
| `app/sitemap.ts` | `MetadataRoute.Sitemap` — 14 static routes + 6 `/shop/<category>` + 48 `/product/<slug>` = **68 URLs** at `https://novamart.demo/sitemap.xml` |
| `app/robots.ts` | Allow-all robots + sitemap pointer at `https://novamart.demo/robots.txt` |
| `public/manifest.webmanifest` | PWA manifest — name `NovaMart`, `theme_color`/`background_color` `#F6F1E8`, `display: standalone` |
| `public/og-image.jpg` | 1920×1280 editorial still-life share image, no text in frame, 316 KB |

## Merge into `app/layout.tsx`

Add `metadataBase` and extend the existing `metadata` export:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://novamart.demo'),
  title: {
    default: 'NovaMart — Good goods, fairly priced.',
    template: '%s | NovaMart',
  },
  description:
    'Good goods, fairly priced. Shop electronics, home & kitchen, fashion, beauty, sports and toys — 48 honest products, real reviews, fast checkout.',
  keywords: [
    'novamart',
    'online store',
    'electronics',
    'home and kitchen',
    'fashion',
    'beauty',
    'sports',
    'toys',
  ],
  authors: [{ name: 'NovaMart' }],
  creator: 'NovaMart',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.webmanifest',
  themeColor: '#F6F1E8',
  openGraph: {
    type: 'website',
    url: 'https://novamart.demo',
    siteName: 'NovaMart',
    title: 'NovaMart — Good goods, fairly priced.',
    description:
      'Shop electronics, home & kitchen, fashion, beauty, sports and toys — honest prices, real reviews.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1920,
        height: 1280,
        alt: 'NovaMart — everyday goods, styled simply',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NovaMart — Good goods, fairly priced.',
    description:
      'Shop electronics, home & kitchen, fashion, beauty, sports and toys — honest prices, real reviews.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/og-image.jpg',
  },
};
```

## Notes

- `metadataBase` makes all relative OG/twitter image URLs (`/og-image.jpg`) resolve to
  `https://novamart.demo/og-image.jpg` for crawlers.
- `manifest: '/manifest.webmanifest'` injects the `<link rel="manifest">` tag automatically —
  no manual `<link>` needed in the layout.
- `themeColor: '#F6F1E8'` matches the warm-paper brand palette on mobile browsers.
- No other layout edits are required; `app/sitemap.ts` and `app/robots.ts` are picked up by
  Next.js route conventions (`/sitemap.xml`, `/robots.txt`) with zero config.
