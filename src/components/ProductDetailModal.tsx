import React, { useState } from 'react';
import { ProductWithRec } from '../types';
import { X, Calendar, Clock, MapPin, Tag, Barcode as BarcodeIcon, CheckCircle, Sparkles, Share2 } from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductWithRec | null;
  onClose: () => void;
  onShowToCustomerConfirm: (sku: string) => void;
}

export const ProductDetailModal = ({
  product,
  onClose,
  onShowToCustomerConfirm,
}: ProductDetailModalProps) => {
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!product) return null;

  const handleShowConfirm = () => {
    setShowSuccessToast(true);
    onShowToCustomerConfirm(product.sku);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1800);
  };

  const isUrgent = product.rec.badgeColor === 'orange';
  const isOOS = product.currentStock === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Banner / Close Header */}
        <div className={`p-4 sm:p-6 text-white relative flex items-center justify-between ${
          isOOS ? 'bg-red-600' : isUrgent ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500' : 'bg-slate-900'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 backdrop-blur text-white text-xs px-2.5 py-1 rounded-xl font-mono font-bold tracking-wider">
              {product.sku}
            </span>
            {isUrgent && (
              <span className="bg-white text-orange-600 font-extrabold text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                PRIORITY SELL FIRST
              </span>
            )}
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Product Image */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md relative">
              <img
                src={product.image_url || product.image || "/placeholder.png"}
                alt={product.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white px-2 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                <BarcodeIcon className="w-3.5 h-3.5" />
                {product.barcode}
              </div>
            </div>
            
            <div className="w-full mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-400 block uppercase font-semibold">Catalog Unit Price</span>
              <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
            </div>
          </div>

          {/* Right Column: Metadata & PRD Requirements */}
          <div className="md:col-span-7 space-y-4">
            
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 leading-tight">
                {product.name}
              </h2>
              {product.location && (
                <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Showroom Location: <span className="text-slate-800 font-bold">{product.location}</span>
                </p>
              )}
            </div>

            {/* Recommendation Box */}
            <div className={`p-4 rounded-2xl border ${
              isOOS ? 'bg-red-50 border-red-200 text-red-900' : isUrgent ? 'bg-orange-50 border-orange-300 text-orange-950' : 'bg-amber-50/60 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase opacity-75">Recommendation Logic</span>
                <span className="text-amber-500 font-black tracking-widest text-base">
                  {'★'.repeat(product.rec.stars)}
                  <span className="text-slate-300">{'★'.repeat(5 - product.rec.stars)}</span>
                </span>
              </div>
              <h3 className="text-lg font-black mt-1 uppercase">{product.rec.recommendationTitle}</h3>
              <p className="text-xs mt-1 leading-relaxed opacity-90 font-medium">
                {product.rec.actionSubtitle}
              </p>
            </div>

            {/* Key Data Grid (PRD Section 12) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" /> Current Stock
                </span>
                <p className={`text-xl font-black mt-1 ${isOOS ? 'text-red-600' : 'text-slate-900'}`}>
                  {product.currentStock} <span className="text-xs font-normal text-slate-500">units</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Inventory Age
                </span>
                <p className="text-xl font-black mt-1 text-slate-900">
                  {product.rec.daysInInventory} <span className="text-xs font-normal text-slate-500">Days</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> Added Date:
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">{product.dateAdded}</span>
              </div>
            </div>

            {/* PRD Section 12: Large Green Button */}
            <div className="pt-4">
              {showSuccessToast ? (
                <div className="w-full py-4 px-6 bg-emerald-600 text-white font-black text-center rounded-2xl shadow-lg flex items-center justify-center space-x-2 animate-bounce">
                  <CheckCircle className="w-6 h-6" />
                  <span>PRESENTING TO CUSTOMER! STOCK LOGGED.</span>
                </div>
              ) : (
                <button
                  onClick={handleShowConfirm}
                  disabled={isOOS}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-base tracking-wide shadow-xl transition-all transform active:scale-98 flex items-center justify-center space-x-2.5 ${
                    isOOS
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 border-b-4 border-emerald-800'
                  }`}
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>SHOW TO CUSTOMER</span>
                </button>
              )}
              {isOOS && (
                <p className="text-center text-xs text-red-600 font-bold mt-2">
                  ⚠️ This item is Out of Stock. Cannot recommend to customer.
                </p>
              )}
            </div>

          </div>

        </div>

        {/* Footer info tip */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Priority logic calculated automatically via SSPS Engine v1.0</span>
          <button onClick={onClose} className="hover:text-slate-800 font-bold">Dismiss</button>
        </div>

      </div>
    </div>
  );
};
