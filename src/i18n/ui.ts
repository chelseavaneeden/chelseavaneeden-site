// Interface strings. Page copy lives in content files; this holds the small, repeated
// UI words so a future PT/NL version only needs a new block here.
export const languages = { en: 'English' } as const;
export const defaultLang = 'en';

export const ui = {
  en: {
    'price.from': 'From',
    'price.tailored': 'Tailored proposal',
    'unit.session': 'session',
    'unit.pack': 'pack',
    'unit.month': 'month',
    'unit.programme': 'programme',
    'unit.workshop': 'workshop',
    'unit.day': 'day',
    'unit.person': 'person',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.partnerships': 'Partnerships',
    'a11y.skip': 'Skip to content',
    'a11y.external': 'opens in a new tab',
    'footer.rights': 'All rights reserved.',
  },
} as const;

export type Lang = keyof typeof ui;
export type UiKey = keyof (typeof ui)['en'];

export function t(lang: Lang, key: UiKey): string {
  return ui[lang]?.[key] ?? ui[defaultLang][key];
}
