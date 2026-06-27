import type { ReactNode } from 'react';
import { ProductWithRec } from '../types';
import { Package, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface DashboardStatsProps {
  products: ProductWithRec[];
  onSelectFilter: (filter: 'ALL' | 'SELL_FIRST' | 'OVERSTOCK' | 'OUT_OF_STOCK') => void;
  activeFilter: string;
}

export const DashboardStats = ({
  products,
  onSelectFilter,
  activeFilter
}) => {
  const totalProducts = products.length;
  const availableCount = products.filter(p => p.currentStock > 0).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  const overstockCount = products.filter(p => p.currentStock > 300).length;
  const sellFirstCount = products.filter(p => p.rec.badgeColor === 'orange' || p.rec.agingCategory === 'SELL_FIRST').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Total Products Card */}
      <div 
        onClick={() => onSelectFilter('ALL')}
        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer hover:shadow-md ${
          activeFilter === 'ALL' ? 'border-slate-800 ring-2 ring-slate-800/10 shadow-md bg-slate-50/50' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{totalProducts}</h3>
            <p className="text-xs text-slate-400 mt-1">Showroom SKUs</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Available Card */}
      <div 
        onClick={() => onSelectFilter('ALL')}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Available</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{availableCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Ready to present</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Overstock & Urgent Sell Card */}
      <div 
        onClick={() => onSelectFilter('OVERSTOCK')}
        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer hover:shadow-md ${
          activeFilter === 'OVERSTOCK' ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md bg-orange-50/30' : 'border-slate-200 hover:border-orange-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Overstock (&gt;300)</p>
              <span className="animate-pulse bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                Priority
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-orange-600 mt-1">{overstockCount}</h3>
            <p className="text-xs text-orange-600/80 mt-1 font-medium">{sellFirstCount} items aged &amp; overstocked</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Out of Stock Card */}
      <div 
        onClick={() => onSelectFilter('OUT_OF_STOCK')}
        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer hover:shadow-md ${
          activeFilter === 'OUT_OF_STOCK' ? 'border-red-500 ring-2 ring-red-500/20 shadow-md bg-red-50/30' : 'border-slate-200 hover:border-red-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-1">{outOfStockCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Needs restock</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

    </div>
  );
};
