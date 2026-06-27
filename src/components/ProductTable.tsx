import { useState } from 'react';
import { ProductWithRec, UserRole } from '../types';
import { Sparkles, Eye, ArrowUpDown, LayoutGrid, List } from 'lucide-react';

interface ProductTableProps {
  products: ProductWithRec[];
  onSelectProduct: (product: ProductWithRec) => void;
  userRole: UserRole;
  onQuickShow: (product: ProductWithRec) => void;
}

export const ProductTable = ({
  products,
  onSelectProduct,
  userRole,
  onQuickShow
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<'score' | 'stock' | 'age' | 'name'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let valA: number | string = 0;
    let valB: number | string = 0;

    if (sortField === 'score') {
      valA = a.rec.score;
      valB = b.rec.score;
    } else if (sortField === 'stock') {
      valA = a.currentStock;
      valB = b.currentStock;
    } else if (sortField === 'age') {
      valA = a.rec.daysInInventory;
      valB = b.rec.daysInInventory;
    } else if (sortField === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Helper for Badge Styling (PRD Section 13)
  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400/30';
      case 'orange':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-md shadow-orange-500/20 border-orange-600 animate-pulse';
      case 'green':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30';
      case 'yellow':
      default:
        return 'bg-amber-50 text-amber-900 border-amber-300';
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Eye className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No matching showroom products found</h3>
        <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Showroom Stock Priorities
          </span>
          <span className="bg-slate-200 text-slate-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
            {products.length} SKUs
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold transition ${
                viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold transition ${
                viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-16">Image</th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>SKU &amp; Product Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center cursor-pointer hover:bg-slate-200/60 transition" onClick={() => handleSort('stock')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Current Stock</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:bg-slate-200/60 transition" onClick={() => handleSort('age')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Age</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4">Recommendation</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {sortedProducts.map((p) => {
                const isUrgent = p.rec.badgeColor === 'orange';
                return (
                  <tr 
                    key={p.sku}
                    onClick={() => onSelectProduct(p)}
                    className={`hover:bg-amber-50/40 transition cursor-pointer ${
                      p.currentStock === 0 ? 'bg-red-50/20 opacity-75' : isUrgent ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    {/* Image */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-sm relative">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        {isUrgent && (
                          <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] font-black px-1 rounded-bl">
                            ★
                          </div>
                        )}
                      </div>
                    </td>

                    {/* SKU & Name */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded w-max border border-amber-200 mb-1">
                        {p.sku}
                      </div>
                      <div className="font-bold text-slate-900 line-clamp-1 hover:text-amber-600 transition">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">₹{p.price} • {p.location || 'Showroom'}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600 font-semibold">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        {p.category}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`text-base font-extrabold ${
                        p.currentStock === 0 ? 'text-red-600' : p.currentStock > 300 ? 'text-orange-600' : 'text-slate-800'
                      }`}>
                        {p.currentStock}
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase">units</span>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-4 text-center whitespace-nowrap text-xs">
                      <span className="font-bold text-slate-700">{p.rec.daysInInventory}</span>
                      <span className="text-slate-400 text-[10px] block">Days</span>
                    </td>

                    {/* Priority Stars */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="text-amber-500 font-black tracking-widest text-sm">
                        {'★'.repeat(p.rec.stars)}
                        <span className="text-slate-200">{'★'.repeat(5 - p.rec.stars)}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mt-0.5">
                        {p.rec.priorityLevel}
                      </span>
                    </td>

                    {/* Recommendation Title */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs border font-bold ${getBadgeStyle(p.rec.badgeColor)}`}>
                        {p.rec.recommendationTitle}
                      </span>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-normal">
                        {p.rec.actionSubtitle}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onQuickShow(p)}
                        disabled={p.currentStock === 0}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1 ml-auto ${
                          p.currentStock === 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isUrgent
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20 animate-bounce-once'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>SHOW FIRST</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID CARD VIEW (Great for Tablets/Mobile Sales Staff) */}
      {viewMode === 'grid' && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50">
          {sortedProducts.map((p) => {
            const isUrgent = p.rec.badgeColor === 'orange';
            return (
              <div
                key={p.sku}
                onClick={() => onSelectProduct(p)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
                  p.currentStock === 0 ? 'border-red-200 bg-red-50/10' : isUrgent ? 'border-orange-400 bg-orange-50/20 ring-1 ring-orange-400/30' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-black border ${getBadgeStyle(p.rec.badgeColor)}`}>
                        {p.rec.recommendationTitle}
                      </span>
                      <div className="text-amber-500 font-black text-xs mt-1">
                        {'★'.repeat(p.rec.stars)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {p.sku}
                    </span>
                    <span className="text-xs font-bold text-slate-500">₹{p.price}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mt-1">
                    {p.name}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Stock</span>
                      <span className={`text-sm font-extrabold ${p.currentStock === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {p.currentStock} units
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block uppercase">Inventory Age</span>
                      <span className="text-sm font-extrabold text-slate-700">{p.rec.daysInInventory} days</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-slate-500 font-medium truncate">{p.category}</span>
                  <button
                    onClick={() => onQuickShow(p)}
                    disabled={p.currentStock === 0}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-sm w-full sm:w-auto ${
                      p.currentStock === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isUrgent
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    SHOW TO CUSTOMER
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
