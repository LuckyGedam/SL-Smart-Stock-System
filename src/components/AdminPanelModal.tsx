import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Product, ProductWithRec } from '../types';
import { X, Upload, Plus, Trash2, Edit3, Save, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { addOrUpdateProductApi, deleteProductApi, updateStock, uploadProductsApi } from '../api/sspsApi';


interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductWithRec[];
  onUpdateProducts: (newProducts: Product[]) => void;
  onRefreshProducts?: () => Promise<void> | void;
}

export const AdminPanelModal = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  onRefreshProducts,
}: AdminPanelModalProps) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'upload' | 'add'>('manage');
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editStockVal, setEditStockVal] = useState(0);
  const [toastMsg, setToastMsg] = useState('');

  // Form state for adding new SKU
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Glassware');
  const [newStock, setNewStock] = useState('100');
  const [newPrice, setNewPrice] = useState('500');
  const [newLocation, setNewLocation] = useState('Rack A1');

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveStock = async (sku: string) => {
    try {
      await updateStock(sku, editStockVal);
      await onRefreshProducts?.();
      setEditingSku(null);
      showNotice(`Stock updated for ${sku} to ${editStockVal}`);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Unable to update stock');
    }
  };

  const handleDeleteProduct = async (sku: string) => {
    if (confirm(`Are you sure you want to delete SKU ${sku}?`)) {
      try {
        await deleteProductApi(sku);
        await onRefreshProducts?.();
        showNotice(`Deleted product ${sku}`);
      } catch (error) {
        showNotice(error instanceof Error ? error.message : 'Unable to delete product');
      }
    }
  };

  const handleAddNewProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSku || !newName) return;

    if (products.some(p => p.sku.toUpperCase() === newSku.toUpperCase())) {
      alert('SKU already exists!');
      return;
    }

    const newProd: Product = {
      sku: newSku.toUpperCase(),
      name: newName,
      category: newCat,
      currentStock: parseInt(newStock) || 0,
      price: parseInt(newPrice) || 0,
      dateAdded: new Date().toISOString().split('T')[0],
      barcode: '890' + Math.floor(1000000000 + Math.random() * 9000000000),
      image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&w=600&q=80',
      location: newLocation
    };

    try {
      await addOrUpdateProductApi(newProd);
      await onRefreshProducts?.();
      setNewSku('');
      setNewName('');
      showNotice(`Added new SKU ${newProd.sku}`);
      setActiveTab('manage');
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Unable to create product');
    }
  };

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadProductsApi(file);
      await onRefreshProducts?.();
      showNotice(`Upload complete: inserted ${result.inserted}, updated ${result.updated}, skipped ${result.skipped}, errors ${result.errors}`);
      setActiveTab('manage');
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Excel upload failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Admin Panel • Catalog &amp; Inventory Manager</h3>
              <p className="text-xs text-slate-400">PRD Section 17 &amp; 18: Upload Excel, Update Stock &amp; Manage SKUs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'manage' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manage Stock ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'upload' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Excel Sheet</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'add' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New SKU</span>
            </button>
          </div>

          {toastMsg && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full animate-bounce flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {toastMsg}
            </span>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {/* TAB 1: MANAGE STOCK */}
          {activeTab === 'manage' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => (
                    <tr key={p.sku} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-amber-700">{p.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{p.category}</td>
                      <td className="py-3 px-4 text-center font-bold">
                        {editingSku === p.sku ? (
                          <input
                            type="number"
                            value={editStockVal}
                            onChange={(e) => setEditStockVal(parseInt(e.target.value) || 0)}
                            className="w-20 bg-slate-100 border border-amber-500 px-2 py-1 rounded text-center font-bold text-slate-900 focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className={p.currentStock === 0 ? 'text-red-600 font-extrabold' : 'text-slate-800'}>
                            {p.currentStock}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {editingSku === p.sku ? (
                          <button
                            onClick={() => handleSaveStock(p.sku)}
                            className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold inline-flex items-center gap-1 shadow"
                          >
                            <Save className="w-3 h-3" /> Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSku(p.sku);
                              setEditStockVal(p.currentStock);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Stock
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProduct(p.sku)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded transition"
                          title="Delete SKU"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: EXCEL UPLOAD */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto py-8 space-y-6">
              <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-300 text-center hover:border-amber-500 transition shadow-sm">
                <FileSpreadsheet className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h4 className="text-lg font-black text-slate-900">Upload Showroom Excel (.xlsx / .csv)</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  PRD Section 18: Bulk upload SKUs, categories, stock counts, and barcode IDs.
                </p>
                
                <div className="mt-6">
                  <label className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer shadow-lg inline-block">
                    Select Excel File
                    <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 mt-3">The uploaded sheet is validated and imported directly into the SQLite database.</p>
              </div>

              {/* PRD Section 18 Expected Format Specification */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3">
                  📋 PRD Section 18: Expected Excel Header Format
                </h5>
                <div className="font-mono bg-slate-900 text-amber-400 p-4 rounded-xl text-xs overflow-x-auto">
                  SKU, Product Name, Category, Stock, Added Date, Barcode<br/>
                  <span className="text-slate-400 font-normal">
                    GLS001, Whisky Glass, Glassware, 325, 2026-03-01, 890123456789
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW SKU */}
          {activeTab === 'add' && (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Add Individual Showroom Product</span>
              </h4>

              <form onSubmit={handleAddNewProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SKU Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GLS-999"
                      value={newSku}
                      onChange={e => setNewSku(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                    <select
                      value={newCat}
                      onChange={e => setNewCat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Glassware">Glassware</option>
                      <option value="Dinnerware">Dinnerware</option>
                      <option value="Tea & Coffee">Tea &amp; Coffee</option>
                      <option value="Cutlery">Cutlery</option>
                      <option value="Serveware">Serveware</option>
                      <option value="Storage">Storage</option>
                      <option value="Kitchenware">Kitchenware</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bohemian Crystal Whisky Jug 1L"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Qty</label>
                    <input
                      type="number"
                      required
                      value={newStock}
                      onChange={e => setNewStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition transform active:scale-98"
                  >
                    SAVE &amp; ADD TO SHOWROOM CATALOG
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
