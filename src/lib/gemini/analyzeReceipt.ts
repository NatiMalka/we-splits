import type { BillData } from '../../types';

// Type enum values are just their own string names (Type.OBJECT === 'OBJECT') per the
// SDK — inlined here as plain strings so the schema can be built without a static
// import, keeping @google/genai (a large SDK) out of the main bundle until someone
// actually uploads a receipt.
const Type = {
  OBJECT: 'OBJECT',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  ARRAY: 'ARRAY',
} as const;

// gemini-2.5-flash: 404s for new API keys ("no longer available to new users").
// gemini-3.7-flash (newest): 503s under launch-week demand spikes.
// gemini-3.6-flash: explicitly recommended by Google's own 404 error message above,
// and confirmed available via a live /v1beta/models check — the sweet spot.
const MODEL = 'gemini-3.6-flash';

const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SYSTEM_PROMPT = `You are an expert OCR and receipt parsing assistant specialized in Israeli restaurant bills in Hebrew.
Analyze the provided image of a restaurant receipt and extract the structured data into JSON format.

Guidelines:
1. Extract item names accurately in Hebrew.
2. Extract quantities and unit prices or total prices per item.
3. Ignore sub-headings that are not distinct chargeable items.
4. Identify if there is a 'service' (שירות) line item and return it separately as serviceFee.
5. Extract the grand total printed on the receipt.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    restaurantName: { type: Type.STRING, nullable: true },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          price: { type: Type.NUMBER },
        },
        required: ['name', 'quantity', 'price'],
      },
    },
    serviceFee: { type: Type.NUMBER },
    rawTotal: { type: Type.NUMBER },
  },
  required: ['items', 'serviceFee', 'rawTotal'],
};

interface GeminiReceiptResult {
  restaurantName: string | null;
  items: { name: string; quantity: number; price: number }[];
  serviceFee: number;
  rawTotal: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:image/jpeg;base64," prefix — the API wants raw base64.
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export interface AnalyzeReceiptResult {
  billData: BillData;
  includeServiceInSplitDefault: boolean;
}

/** Duck-typed rather than an `instanceof ApiError` check, so callers don't need
 * to statically import (and bundle) @google/genai just to inspect an error. */
export function isGeminiOverloadedError(err: unknown): boolean {
  return err instanceof Error && 'status' in err && (err as { status?: unknown }).status === 503;
}

export async function analyzeReceipt(file: File): Promise<AnalyzeReceiptResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set');

  const { GoogleGenAI, ApiError } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const imageBase64 = await fileToBase64(file);

  let response;
  for (let attempt = 1; ; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: MODEL,
        contents: [
          { text: SYSTEM_PROMPT },
          { inlineData: { data: imageBase64, mimeType: file.type || 'image/jpeg' } },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      });
      break;
    } catch (err) {
      // 503 UNAVAILABLE ("model experiencing high demand") is transient — Google's
      // own guidance is "try again later". Anything else (bad key, invalid image,
      // quota exhausted) fails immediately instead of retrying pointlessly.
      const isTransient = err instanceof ApiError && err.status === 503;
      if (!isTransient || attempt >= MAX_ATTEMPTS) throw err;
      await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response');

  const parsed = JSON.parse(text) as GeminiReceiptResult;

  const billData: BillData = {
    restaurantName: parsed.restaurantName ?? null,
    currency: 'ILS',
    serviceFee: parsed.serviceFee ?? 0,
    rawTotal: parsed.rawTotal ?? 0,
    items: parsed.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
  };

  return { billData, includeServiceInSplitDefault: billData.serviceFee > 0 };
}
