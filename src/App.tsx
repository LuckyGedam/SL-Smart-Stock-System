/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';

import { Product, UserRole, FilterTab, ProductWithRec } from './types';
import { enrichProducts } from './utils/priorityLogic';
import { fetchProducts } from './api/sspsApi';

// Components
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { FilterBar } from './components/FilterBar';
import { ProductTable } from './components/ProductTable';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BarcodeModal } from './components/BarcodeModal';
import { ReportsModal } from './components/ReportsModal';
import { AdminPanelModal } from './components/AdminPanelModal';

export default function App() {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const loadFromBackend = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setIsAuthError(false);
      const productsFromApi = await fetchProducts();
      setRawProducts(productsFromApi);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to load products';
      const authFailure = message.toLowerCase().includes('auth');
      setLoadError(message);
      setIsAuthError(authFailure);
      setRawProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFromBackend();
  }, []);
  const [currentRole, setCurrentRole] = useState<UserRole>('sales'); // default role sales girl
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal Visibility States
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<ProductWithRec | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Enrich raw product data with age & priority calculations (PRD Sections 6, 7, 8)
  const enrichedProducts = useMemo(() => {
    return enrichProducts(rawProducts);
  }, [rawProducts]);

  // Extract unique categories for filter dropdown
  const allCategories = useMemo(() => {
    const cats = Array.from(new Set(rawProducts.map(p => p.category))).sort();
    return cats;
  }, [rawProducts]);

  // Apply Search and Filters
  const filteredProducts = useMemo(() => {
    return enrichedProducts.filter(p => {
      // Search Matching (PRD Section 11)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        const matchesBarcode = p.barcode.includes(query);
        if (!matchesName && !matchesSku && !matchesCat && !matchesBarcode) {
          return false;
        }
      }

      // Category Filtering (PRD Section 14)
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Status Tab Filtering (PRD Section 14)
      if (activeFilterTab === 'SELL_FIRST') {
        return p.rec.badgeColor === 'orange' || p.rec.agingCategory === 'SELL_FIRST';
      }
      if (activeFilterTab === 'OVERSTOCK') {
        return p.currentStock > 300;
      }
      if (activeFilterTab === 'OLD_STOCK') {
        return p.rec.daysInInventory > 90;
      }
      if (activeFilterTab === 'NEW_STOCK') {
        return p.rec.agingCategory === 'NEW';
      }
      if (activeFilterTab === 'OUT_OF_STOCK') {
        return p.currentStock === 0;
      }

      return true;
    });
  }, [enrichedProducts, searchTerm, selectedCategory, activeFilterTab]);

  // Quick Action: Show To Customer Confirmation (Reduces stock or logs event)
  const handleShowToCustomerConfirm = (sku: string) => {
    // In a live showroom, presenting might optionally decrement display unit or log timestamp
    // For MVP demonstration, let's keep stock intact or log to console
    console.log(`[SSPS Event] Sales girl presented SKU ${sku} to customer.`);
  };

  const handleQuickStatClick = (tab: FilterTab) => {
    setActiveFilterTab(tab);
    setSelectedCategory('ALL');
  };

  const handleRetryBackend = () => {
    void loadFromBackend();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Persistent Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenBarcode={() => setIsBarcodeModalOpen(true)}
        onOpenReports={() => setIsReportsModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Role Context Notification Banner */}
        <div className="mb-6 flex items-center justify-between p-3.5 bg-slate-900 text-slate-200 rounded-2xl text-xs shadow-md border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Active Role: <strong className="text-amber-400 uppercase font-bold tracking-wider">{currentRole}</strong> • 
              {currentRole === 'sales' && ' Showing recommended items first to clear warehouse space.'}
              {currentRole === 'manager' && ' Manager view: Monitor stock turnover & export analytics.'}
              {currentRole === 'admin' && ' Owner/Admin view: Full catalog control enabled.'}
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[11px] text-slate-400">
            SL Smart Sales System
          </span>
        </div>

        {/* Top Dashboard Stat Cards (PRD Section 9) */}
        <DashboardStats
          products={enrichedProducts}
          onSelectFilter={(filter: FilterTab) => handleQuickStatClick(filter)}
          activeFilter={activeFilterTab}
        />

        {/* Filter & Category Controls (PRD Section 14) */}
        <FilterBar
          activeTab={activeFilterTab}
          onTabChange={setActiveFilterTab}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={allCategories}
        />

        {loadError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="font-semibold">Backend connection issue:</div>
            <div>{loadError}</div>
            {isAuthError && (
              <div className="mt-2 text-xs text-slate-700">
                Authentication failed. You can retry the request below.
              </div>
            )}
            <button
              type="button"
              onClick={handleRetryBackend}
              className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading live inventory from the backend...
          </div>
        ) : (
          <ProductTable
            products={filteredProducts}
            onSelectProduct={(p: ProductWithRec) => setSelectedProductForDetail(p)}
            userRole={currentRole}
            onQuickShow={(p: ProductWithRec) => setSelectedProductForDetail(p)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-700">
            SL Crockeries • Smart Stock Priority System 
          </p>
          <p>
            
          </p>
        </div>
      </footer>

      {/* MODALS */}
      
      {/* Product Detail Modal (PRD Section 12) */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onShowToCustomerConfirm={handleShowToCustomerConfirm}
      />

      {/* Barcode Search Modal (PRD Section 15) */}
      <BarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        products={enrichedProducts}
        onSelectProduct={(p: ProductWithRec) => setSelectedProductForDetail(p)}
      />

      {/* CSV Reports Modal (PRD Section 16) */}
      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        products={enrichedProducts}
      />

      {/* Admin Catalog & Upload Panel (PRD Section 17 & 18) */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        products={enrichedProducts}
        onUpdateProducts={setRawProducts}
        onRefreshProducts={loadFromBackend}
      />

    </div>
  );
}

