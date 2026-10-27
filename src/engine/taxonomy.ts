// The 16 scam types (docs/09 section 4). Playbook bodies live in data/playbook/*.json;
// this module is the id contract shared by schemas, tools, evals and UI.
export const TAXONOMY = [
  { id: "fake_reversal", name_en: "Fake reversal", name_sw: "Utapeli wa kurudisha pesa" },
  { id: "silent_stk", name_en: "Silent STK prompt", name_sw: "Ombi la PIN la kimya" },
  { id: "fake_mpesa_sms", name_en: "Fake M-Pesa SMS", name_sw: "SMS bandia ya M-Pesa" },
  { id: "fake_customer_care", name_en: "Fake customer care", name_sw: "Huduma bandia kwa wateja" },
  { id: "tuma_number", name_en: "Send to another number", name_sw: "Tuma kwa namba nyingine" },
  { id: "fake_job", name_en: "Fake job fee", name_sw: "Ada bandia ya kazi" },
  { id: "tiktok_agent", name_en: "TikTok agent fee", name_sw: "Ada bandia ya wakala wa TikTok" },
  { id: "sim_swap", name_en: "SIM swap / OTP phishing", name_sw: "Wizi wa laini na OTP" },
  { id: "cashback_link", name_en: "Fake cashback link", name_sw: "Kiungo bandia cha zawadi" },
  { id: "investment_ponzi", name_en: "Guaranteed-returns investment", name_sw: "Uwekezaji wa faida ya uhakika" },
  { id: "fake_betting", name_en: "Fake betting bonus", name_sw: "Bonasi bandia ya kubeti" },
  { id: "courier_deposit", name_en: "Courier deposit", name_sw: "Ada bandia ya mzigo" },
  { id: "fake_payment_screenshot", name_en: "Fake payment screenshot", name_sw: "Picha bandia ya malipo" },
  { id: "deepfake_endorsement", name_en: "Deepfake endorsement", name_sw: "Tangazo bandia la mtu maarufu" },
  { id: "fake_gov_alert", name_en: "Fake government alert", name_sw: "Tahadhari bandia ya serikali" },
  { id: "loan_app_fee", name_en: "Loan app upfront fee", name_sw: "Ada ya awali ya mkopo" },
] as const;

export const TAXONOMY_IDS: string[] = TAXONOMY.map((t) => t.id);
export function isTaxonomyId(id: string | null): boolean {
  return id !== null && TAXONOMY_IDS.includes(id);
}
