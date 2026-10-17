import React from "react";
import { useMarketplace } from "../context/MarketplaceContext.tsx";
import { ShoppingBag, Sparkles, Store, Factory, ShieldCheck, Globe } from "lucide-react";

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenAssistant }) => {
  const {
    portalView,
    setPortalView,
    cart,
    currentVendor,
    currentRetailer,
    vendors,
    setCurrentVendorId,
    retailers,
    setCurrentRetailerId,
  } = useMarketplace();

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantityKg, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-amber-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top zone adhering to Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setPortalView("public")}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-700 text-amber-50 flex items-center justify-center font-serif text-xl font-bold shadow-sm transition-transform group-hover:scale-105">
              M
            </div>
            <div>
              <span className="text-xl font-serif font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 block leading-none">
                MasalaSetu
              </span>
              <span className="text-[10px] font-medium tracking-wider text-amber-800 uppercase block mt-0.5">
                Wholesale Spices B2B
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
            <button
              onClick={() => setPortalView("public")}
              className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                portalView === "public" ? "text-amber-800 font-semibold" : ""
              }`}
            >
              Wholesale Catalog
            </button>
            <button
              onClick={() => setPortalView("retailer")}
              className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                portalView === "retailer" ? "text-amber-800 font-semibold" : ""
              }`}
            >
              Buyer Desk
            </button>
            <button
              onClick={() => setPortalView("vendor")}
              className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                portalView === "vendor" ? "text-amber-800 font-semibold" : ""
              }`}
            >
              Vendor Portal
            </button>
            <button
              onClick={() => setPortalView("admin")}
              className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                portalView === "admin" ? "text-amber-800 font-semibold" : ""
              }`}
            >
              Mediator Admin
            </button>
          </nav>

          {/* Zone 3: Primary Action & Role Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAssistant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100/70 border border-amber-300/60 rounded-md hover:bg-amber-200/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Open Gemini AI Spice Mandi Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">AI Mandi Advisor</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
              aria-label="View wholesale cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-950 text-amber-100 rounded text-[10px] tabular-nums font-mono">
                  {cartItemCount}kg
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sub-bar: Workspace / Role Indicator Strip */}
        <div className="py-2 border-t border-amber-950/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-amber-900/5 p-1 rounded-lg">
            <button
              onClick={() => setPortalView("public")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                portalView === "public"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              Public Marketplace
            </button>
            <button
              onClick={() => setPortalView("retailer")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                portalView === "retailer"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-700" />
              Retailer Buyer
            </button>
            <button
              onClick={() => setPortalView("vendor")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                portalView === "vendor"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Factory className="w-3.5 h-3.5 text-amber-700" />
              Spice Vendor Mill
            </button>
            <button
              onClick={() => setPortalView("admin")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                portalView === "admin"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-700" />
              Admin Mediator
            </button>
          </div>

          {/* Active Persona Context Switcher */}
          <div className="flex items-center gap-3 text-slate-500">
            {portalView === "vendor" && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Active Vendor:</span>
                <select
                  value={currentVendor?.id}
                  onChange={(e) => setCurrentVendorId(e.target.value)}
                  className="bg-white border border-amber-950/15 rounded px-2 py-0.5 text-xs text-slate-800 font-medium focus:outline-none"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.businessName} ({v.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {portalView === "retailer" && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Active Buyer:</span>
                <select
                  value={currentRetailer?.id}
                  onChange={(e) => setCurrentRetailerId(e.target.value)}
                  className="bg-white border border-amber-950/15 rounded px-2 py-0.5 text-xs text-slate-800 font-medium focus:outline-none"
                >
                  {retailers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.shopName} ({r.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {portalView === "admin" && (
              <span className="text-[11px] text-amber-900 font-medium">
                Admin Control: Platform Mediation, Logistics & Settlements
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
