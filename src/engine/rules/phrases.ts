// Phrase matchers for R04-R06, R08-R12, R14. EN + SW + common Sheng spellings.
// Each list is evidence, never a verdict on its own (weights live in rules/index.ts).
export const PHRASES: Record<string, readonly string[]> = {
  reversal: ["sent by mistake", "sent to you by mistake", "please reverse", "reverse the money", "tumetuma kimakosa", "nimetuma kimakosa", "rudisha pesa", "rudisha hiyo pesa"],
  urgency: ["within 30 minutes", "within 1 hour", "immediately", "right now", "account will be blocked", "akaunti itafungwa", "haraka", "sasa hivi", "before it is too late"],
  sendToOther: ["tuma kwa hii namba", "tuma kwa hii number", "send to this number", "send the money to", "tuma pesa kwa"],
  feeToUnlock: ["registration fee", "processing fee", "pay a fee", "lipa ada", "ada ya usajili", "unlock fee", "release fee"],
  prize: ["you have won", "you won", "cashback", "congratulations you", "umeshinda", "zawadi", "bonus yako"],
  otpPin: ["share your pin", "send your pin", "your otp", "toa pin", "tuma pin", "tuma otp", "id number yako", "namba ya kitambulisho"],
  investment: ["double your money", "guaranteed returns", "ai trading", "100% profit", "faida ya uhakika", "maradufu"],
  fakeCare: ["safaricom customer care", "customer care calling", "huduma kwa wateja", "we are calling from safaricom", "from kcb bank", "from equity bank"],
};

export function matchPhrases(text: string, key: string): string | null {
  const hay = text.toLowerCase();
  for (const p of PHRASES[key] ?? []) {
    const i = hay.indexOf(p);
    if (i >= 0) return text.slice(i, i + p.length);
  }
  return null;
}

export function uppercaseRatio(text: string): number {
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length < 20) return 0;
  return letters.replace(/[^A-Z]/g, "").length / letters.length;
}
