import { t, type Lang } from '../i18n/ui';

export type PriceDisplay = 'exact' | 'from' | 'on-request';
export type PriceVisibility = 'web' | 'media-kit' | 'hidden';
export type PriceUnit = 'session' | 'pack' | 'month' | 'programme' | 'workshop' | 'day' | 'person';
export type Currency = 'EUR' | 'GBP' | 'USD';

export interface PriceInput {
  priceDisplay: PriceDisplay;
  price?: number;
  currency?: Currency;
  unit?: PriceUnit;
  priceVisibility?: PriceVisibility;
  priceNote?: string;
}

export type PriceView =
  | { kind: 'quote'; label: string; note?: string }
  | { kind: 'exact' | 'from'; prefix: string; amount: string; unit?: string; note?: string };

/**
 * Decides how a price renders. A price is only shown when it is set to `exact` or `from`,
 * has a value, and is visible in this context. Everything else becomes a "Tailored proposal",
 * so nothing on the website locks Chelsea into a number she didn't choose to publish.
 */
export function priceView(o: PriceInput, lang: Lang = 'en', ctx: 'web' | 'media-kit' = 'web'): PriceView {
  const visibility = o.priceVisibility ?? 'web';
  const hidden = visibility === 'hidden' || (visibility === 'media-kit' && ctx === 'web');

  if (o.priceDisplay === 'on-request' || o.price === undefined || hidden) {
    return { kind: 'quote', label: t(lang, 'price.tailored'), note: o.priceNote };
  }

  const amount = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: o.currency ?? 'EUR',
    maximumFractionDigits: 0,
  }).format(o.price);

  return {
    kind: o.priceDisplay,
    prefix: o.priceDisplay === 'from' ? t(lang, 'price.from') : '',
    amount,
    unit: o.unit ? t(lang, `unit.${o.unit}`) : undefined,
    note: o.priceNote,
  };
}
