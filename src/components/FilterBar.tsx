import { FilterTab } from '../types';
import { Filter, Layers, CheckCircle2, AlertTriangle, Clock, Sparkles } from 'lucide-react';

interface FilterBarProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
}

export const FilterBar = ({
  activeTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  categories
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Quick Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
        
        <button
          onClick={() => onTabChange('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Stock</span>
        </button>

        <button
          onClick={() => onTabChange('SELL_FIRST')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            activeTab === 'SELL_FIRST'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>★ Sell First (Priority)</span>
        </button>

        <button
          onClick={() => onTabChange('OVERSTOCK')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            activeTab === 'OVERSTOCK'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Overstock (&gt;300)</span>
        </button>

        <button
          onClick={() => onTabChange('OLD_STOCK')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            activeTab === 'OLD_STOCK'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Old Stock (&gt;90 Days)</span>
        </button>

        <button
          onClick={() => onTabChange('NEW_STOCK')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            activeTab === 'NEW_STOCK'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>New Arrivals</span>
        </button>

      </div>

      {/* Category Dropdown */}
      <div className="flex items-center space-x-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500">Category:</span>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-2 font-medium"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};
