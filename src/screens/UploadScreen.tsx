import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { UploadHero } from '../components/upload/UploadHero';
import { BrandHeader } from '../components/upload/BrandHeader';
import { AnalyzingOverlay } from '../components/upload/AnalyzingOverlay';
import { MockReceiptPicker } from '../components/upload/MockReceiptPicker';
import { useDraftBill } from '../draft/DraftBillContext';
import { analyzeReceipt, isGeminiOverloadedError } from '../lib/gemini/analyzeReceipt';
import { mockAnalyzeReceipt } from '../mock/mockAnalyze';
import type { MockReceiptKey } from '../mock/receipts';

export function UploadScreen() {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setBillData } = useDraftBill();
  const navigate = useNavigate();

  async function handleCapture(file: File) {
    setError(null);
    setAnalyzing(true);
    try {
      const result = await analyzeReceipt(file);
      setBillData(result.billData, result.includeServiceInSplitDefault);
      navigate('/review');
    } catch (err) {
      setError(
        isGeminiOverloadedError(err)
          ? 'השירות עמוס כרגע. נסו שוב בעוד רגע.'
          : 'לא הצלחנו לנתח את החשבונית. נסו שוב עם תמונה ברורה יותר.',
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleMockPick(key: MockReceiptKey) {
    setAnalyzing(true);
    const result = await mockAnalyzeReceipt(key);
    setBillData(result.billData, result.includeServiceInSplitDefault);
    navigate('/review');
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <BrandHeader />
          <UploadHero onCapture={handleCapture} />
          {error && <p className="text-center text-sm text-brand-coral-400">{error}</p>}
          {import.meta.env.DEV && <MockReceiptPicker onPick={handleMockPick} />}
        </div>
      </PageTransition>
      <AnimatePresence>{analyzing && <AnalyzingOverlay />}</AnimatePresence>
    </AppShell>
  );
}
