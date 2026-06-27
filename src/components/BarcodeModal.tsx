import { useState, type FormEvent } from 'react';
import { ProductWithRec } from '../types';
import { X, Barcode as BarcodeIcon, Search, AlertCircle, Sparkles } from 'lucide-react';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductWithRec[];
  onSelectProduct: (p: ProductWithRec) => void;
}

export const BarcodeModal = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}: BarcodeModalProps) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleScanSubmit = (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanCode = barcodeInput.trim();
    if (!cleanCode) return;

    // Search by barcode or SKU exact match
    const found = products.find(
      (p: ProductWithRec) => p.barcode === cleanCode || p.sku.toLowerCase() === cleanCode.toLowerCase()
    );

    if (found) {
      onSelectProduct(found);
      setBarcodeInput('');
      onClose();
    } else {
      setErrorMsg(`No showroom product found with barcode "${cleanCode}"`);
    }
  };

  // Sample quick scan buttons for demo testing
  const demoBarcodes = ['8901234567890', '8901234567891', '8901234567892'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BarcodeIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Barcode / SKU Scanner</h3>
              <p className="text-xs text-slate-400">Scan showroom product label or enter barcode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Simulated Scanner View */}
          <div className="border-2 border-dashed border-emerald-500/40 rounded-2xl bg-slate-900 text-white p-8 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse" />
            <BarcodeIcon className="w-16 h-16 mx-auto text-emerald-400/80 mb-3" />
            <p className="text-xs font-mono text-emerald-400 font-bold tracking-widest uppercase">
              SCANNER ACTIVE • READY
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Point USB/Bluetooth scanner gun at barcode label
            </p>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleScanSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Or Enter Barcode / SKU Manually:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="e.g. 8901234567890 or GLS-001"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 pl-4 pr-4 py-3 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
              >
                <Search className="w-4 h-4" />
                <span>Lookup</span>
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Demo Testing Barcodes */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">
              ⚡ Quick Test Sample Barcodes:
            </p>
            <div className="flex flex-wrap gap-2">
              {demoBarcodes.map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setBarcodeInput(code);
                    const found = products.find((p: ProductWithRec) => p.barcode === code);
                    if (found) {
                      onSelectProduct(found);
                      onClose();
                    }
                  }}
                  className="bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{code}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
