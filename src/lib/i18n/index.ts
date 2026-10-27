import en from "./en.json";
import sw from "./sw.json";

export type Locale = "en" | "sw";
const dicts: Record<Locale, Record<string, string>> = { en, sw };

export function t(locale: Locale, key: string): string {
  return dicts[locale][key] ?? dicts.en[key] ?? key;
}

export function detectLocale(text: string): Locale {
  const swHints = /\b(habari|tafadhali|pesa|tuma|salio|asante|karibu|ujumbe|hakiki)\b/i;
  return swHints.test(text) ? "sw" : "en";
}
