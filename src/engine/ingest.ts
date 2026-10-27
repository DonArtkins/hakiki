// Guard stage (docs/03 section 8): size, type and shape limits before any model spend.
export class CheckInputError extends Error {
  readonly code: "too_large" | "unreadable";
  constructor(code: "too_large" | "unreadable", message: string) {
    super(message);
    this.code = code;
    this.name = "CheckInputError";
  }
}

export interface CheckInput {
  text?: string;
  imageDataUrl?: string;
  channel: "web" | "telegram" | "share" | "cli" | "eval";
  locale?: "en" | "sw";
}

const MAX_TEXT_CHARS = 10_000;
const MAX_IMAGE_CHARS = 7_000_000; // ~5 MB base64

export function guardInput(input: CheckInput): Required<Pick<CheckInput, "channel">> & CheckInput {
  if (input.text && input.text.length > MAX_TEXT_CHARS) throw new CheckInputError("too_large", "Message is too long. Paste the important part only.");
  if (input.imageDataUrl) {
    if (input.imageDataUrl.length > MAX_IMAGE_CHARS) throw new CheckInputError("too_large", "Screenshot is too large. Try a smaller crop.");
    if (!/^data:image\/(png|jpeg|webp);base64,/.test(input.imageDataUrl)) throw new CheckInputError("unreadable", "That file is not a PNG, JPG or WebP screenshot.");
  }
  if (!input.text?.trim() && !input.imageDataUrl) throw new CheckInputError("unreadable", "Paste a message or add a screenshot first.");
  return input;
}
