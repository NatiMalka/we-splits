import type { BillData } from '../../types';
import { reconcileItems } from './reconcileItems';

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

// The previous version of this prompt said "extract quantities and unit prices OR
// total prices per item", which let the model choose either column. On rows with
// quantity 1 both readings agree, so it looked fine — but on a `כמות: 2` row the
// app then multiplied an already-multiplied figure and doubled it (a real ₪369
// receipt was billed as ₪489). Both columns are now requested explicitly and
// separately, and reconcileItems() cross-checks them against the printed total.
const SYSTEM_PROMPT = `You are an expert OCR and receipt parsing assistant specialized in Israeli restaurant bills in Hebrew.
Analyze the provided image of a restaurant receipt and extract the structured data into JSON format.

Israeli receipts usually lay out item rows in four columns, right to left:
  תאור פריט (description) | מחיר (price for ONE unit) | כמות (quantity) | סך הכל (total for the row)

Guidelines:
1. Extract item names accurately in Hebrew, exactly as printed.
2. For each row return THREE separate numbers:
   - "quantity": the כמות column (how many units).
   - "unitPrice": the מחיר column — the price of a SINGLE unit. Never the row total.
   - "lineTotal": the סך הכל column — the total for the whole row.
   These are different columns. Do not copy one into the other.
   Consistency check: unitPrice × quantity must equal lineTotal. For example a row
   reading "קולה  14.00  2  28.00" is unitPrice 14, quantity 2, lineTotal 28 —
   NOT unitPrice 28.
   If the receipt shows only one price column, put the same figure in both and set
   quantity from the כמות column.
3. A leading number inside an item's name is part of the NAME, not the quantity.
   "2 ערב.קבב שיפודי  72.00  1  72.00" has quantity 1, not 2.
4. Ignore sub-headings and lines that are not distinct chargeable items.
5. If a service charge (שירות / דמי שירות) is listed as its own line, return it as
   serviceFee and do NOT also include it as an item. Text such as
   "המחיר לא כולל שירות" means service was NOT charged — return serviceFee 0.
6. "rawTotal" is the grand total printed on the receipt (סך לתשלום / סך הכל לתשלום).`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    restaurantName: { type: Type.STRING, nullable: true },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Item name in Hebrew, as printed' },
          quantity: { type: Type.NUMBER, description: 'The כמות column — how many units' },
          unitPrice: {
            type: Type.NUMBER,
            description: 'The מחיר column — price of ONE unit. Never the row total.',
          },
          lineTotal: {
            type: Type.NUMBER,
            description: 'The סך הכל column — total for the row, i.e. unitPrice × quantity',
          },
        },
        required: ['name', 'quantity', 'unitPrice', 'lineTotal'],
      },
    },
    serviceFee: {
      type: Type.NUMBER,
      description: 'Service charge if listed as its own line, else 0',
    },
    rawTotal: { type: Type.NUMBER, description: 'Grand total printed on the receipt' },
  },
  required: ['items', 'serviceFee', 'rawTotal'],
};

interface GeminiReceiptResult {
  restaurantName: string | null;
  items: { name: string; quantity: number; unitPrice: number; lineTotal?: number }[];
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
  const serviceFee = parsed.serviceFee ?? 0;
  const rawTotal = parsed.rawTotal ?? 0;

  // Don't trust either price column on its own — check both against the printed
  // total and keep whichever reconciles. Silent by design: when this can't be
  // resolved the review screen's mismatch warning is what surfaces it.
  const reconciled = reconcileItems(parsed.items ?? [], serviceFee, rawTotal);
  if (reconciled.repairedItemNames.length > 0) {
    console.info('Reconciled receipt rows against the printed total:', reconciled.repairedItemNames);
  }

  const billData: BillData = {
    restaurantName: parsed.restaurantName ?? null,
    currency: 'ILS',
    serviceFee,
    rawTotal,
    items: reconciled.items,
  };

  return { billData, includeServiceInSplitDefault: serviceFee > 0 };
}
