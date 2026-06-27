import { ProductWithRec } from '../types';
import { X, Download, FileSpreadsheet, AlertTriangle, Clock, AlertOctagon } from 'lucide-react';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductWithRec[];
}

export const ReportsModal = ({
  isOpen,
  onClose,
  products
}) => {
  if (!isOpen) return null;

  const generateCSV = (data: ProductWithRec[], reportTitle: string) => {
    if (data.length === 0) {
      alert('No data available for this report.');
      return;
    }

    const headers = ['SKU', 'Product Name', 'Category', 'Current Stock', 'Added Date', 'Days In Inventory', 'Priority Level', 'Recommendation Logic'];
    const rows = data.map(p => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.currentStock,
      p.dateAdded,
      p.rec.daysInInventory,
      p.rec.priorityLevel,
      `"${p.rec.recommendationTitle}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SL_SSPS_${reportTitle}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const overstockList = products.filter(p => p.currentStock > 300);
  const oldStockList = products.filter(p => p.rec.daysInInventory > 90);
  const outOfStockList = products.filter(p => p.currentStock === 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Download Inventory CSV Reports</h3>
              <p className="text-xs text-slate-400">PRD Section 16: Owner &amp; Manager Analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          
          {/* Report 1: Top Overstock */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 flex items-center justify-between gap-4 hover:shadow-md transition">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl mt-0.5 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Top Overstock Report</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Products with stock &gt; 300 units ({overstockList.length} SKUs found)
                </p>
              </div>
            </div>
            <button
              onClick={() => generateCSV(overstockList, 'Top_Overstock')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>

          {/* Report 2: Old Stock */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-center justify-between gap-4 hover:shadow-md transition">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl mt-0.5 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Old Stock Report</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Products in showroom &gt; 90 days ({oldStockList.length} SKUs found)
                </p>
              </div>
            </div>
            <button
              onClick={() => generateCSV(oldStockList, 'Old_Stock')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>

          {/* Report 3: Out of Stock */}
          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 flex items-center justify-between gap-4 hover:shadow-md transition">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl mt-0.5 shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Out of Stock Report</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  SKUs requiring urgent warehouse replenishment ({outOfStockList.length} SKUs)
                </p>
              </div>
            </div>
            <button
              onClick={() => generateCSV(outOfStockList, 'Out_Of_Stock')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>

          {/* Full Catalog Export */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => generateCSV(products, 'Full_Catalog')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 underline py-1 inline-flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download Full Showroom Catalog CSV ({products.length} items)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
