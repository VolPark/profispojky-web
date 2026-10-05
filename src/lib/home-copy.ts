/**
 * Výchozí texty úvodní stránky. V adminu (Úvodní stránka → Texty sekcí) je lze přepsat;
 * prázdné pole = text odsud. Fakta jen z obsahu webu (O firmě, úvodní text, čísla).
 */
export const HOME_COPY = {
  manifesto:
    'Za každým spojem je voda, která má téct, plyn, který nesmí uniknout, a teplo, které má zůstat doma. Proto pečlivě vybíráme výrobce, hlídáme certifikace a držíme zboží skladem. Aby vaše práce vydržela.',
  numbersTitle: 'Čísla, za kterými si stojíme.',
  brandsTitle: 'Dvanáct výrobců. Jeden partner.',
  brandsText:
    'Zastupujeme zahraniční výrobce spojovací techniky a armatur. Jejich produkty pro vás dovážíme, hlídáme jejich certifikaci pro český trh a máme je skladem.',
  storyTitle: 'Víc než dovozce',
  divisionsTitle: 'Plast, mosaz, litina. Vyberte materiál.',
  findTitle: 'Víte přesně, co hledáte?',
  bandWords: 'Voda · Plyn · Topení',
  ctaTitle: 'Kupte u partnera ve svém okolí.',
  ctaText: 'Naše produkty najdete na více než 200 prodejních místech v Česku a na Slovensku.',
} as const

export type HomeCopyKey = keyof typeof HOME_COPY

/** Text z adminu, nebo výchozí. */
export const homeText = (copy: Partial<Record<HomeCopyKey, string | null>> | null | undefined, key: HomeCopyKey) =>
  copy?.[key]?.trim() || HOME_COPY[key]
