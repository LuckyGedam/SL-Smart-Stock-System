import { UserRole } from '../types';
import { ShieldCheck, UserCheck, Sparkles, Barcode, FileSpreadsheet, FileText, Layers } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenBarcode: () => void;
  onOpenReports: () => void;
  onOpenAdmin: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const Header = ({
  currentRole,
  onRoleChange,
  onOpenBarcode,
  onOpenReports,
  onOpenAdmin,
  searchTerm,
  onSearchChange
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          
          {/* Logo & Suite Branding */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl tracking-tighter">
              SL
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">SL Crockeries</span>
                <span className="text-xs bg-slate-800 text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Smart Sales Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 inline" />
                Smart Stock Priority System (SSPS v1.0)
              </p>
            </div>
          </div>

          {/* Center Search Bar (Accessible everywhere) */}
          <div className="flex-1 max-w-md mx-auto w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Whisky glass, DIN-104, Dinnerware..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center justify-between md:justify-end space-x-2 sm:space-x-3">
            
            {/* Barcode Scanner Action */}
            <button
              onClick={onOpenBarcode}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
            >
              <Barcode className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </button>

            {/* Manager / Admin Reports Button */}
            {(currentRole === 'admin' || currentRole === 'manager') && (
              <button
                onClick={onOpenReports}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-medium transition"
                title="Download CSV Reports"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Reports</span>
              </button>
            )}

            {/* Admin Excel & Stock Button */}
            {currentRole === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-semibold transition"
                title="Manage Catalog & Upload Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline">Admin Panel</span>
              </button>
            )}

            {/* Role Switcher Pills */}
            <div className="bg-slate-950 p-1 rounded-xl flex items-center border border-slate-800 text-xs font-medium">
              <button
                onClick={() => onRoleChange('sales')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                  currentRole === 'sales'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Sales Girl Role: View priorities & Show to customer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sales</span>
              </button>

              <button
                onClick={() => onRoleChange('manager')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                  currentRole === 'manager'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Manager Role: Reports & Stock Updates"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Manager</span>
              </button>

              <button
                onClick={() => onRoleChange('admin')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                  currentRole === 'admin'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Owner/Admin Role: Full Access"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
