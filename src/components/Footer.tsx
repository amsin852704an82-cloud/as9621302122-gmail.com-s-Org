import React from "react";
import { useMarketplace } from "../context/MarketplaceContext.tsx";
import { ShieldCheck, Scale, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  const { setPortalView } = useMarketplace();

  return (
    <footer className="bg-[#FAF7F2] border-t border-amber-950/10 text-slate-600 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-700 text-amber-50 flex items-center justify-center font-serif font-bold text-sm">
                M
              </div>
              <span className="font-serif font-bold text-slate-900 text-base">MasalaSetu B2B</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              India's trusted wholesale spice marketplace connecting local spice mills and APMC processors with retail grocery chains and kirana stores.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Sourcing Mandi Hubs
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li>Unjha Mandi, Gujarat (Cumin & Fennel)</li>
              <li>Salem & Erode, Tamil Nadu (Curcumin Turmeric)</li>
              <li>Guntur Mirchi Yard, Andhra Pradesh (Red Chilli)</li>
              <li>Ramganj Mandi, Rajasthan (Eagle Coriander)</li>
              <li>Wayanad, Kerala (Tellicherry Black Pepper)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Marketplace Portals
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => setPortalView("public")}
                  className="hover:text-amber-800 transition-colors cursor-pointer"
                >
                  Wholesale Spice Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPortalView("retailer")}
                  className="hover:text-amber-800 transition-colors cursor-pointer"
                >
                  Retailer Buyer Desk & Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPortalView("vendor")}
                  className="hover:text-amber-800 transition-colors cursor-pointer"
                >
                  Vendor Mill Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPortalView("admin")}
                  className="hover:text-amber-800 transition-colors cursor-pointer"
                >
                  Platform Owner Admin
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Regulatory Standards
            </h4>
            <div className="space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>FSSAI Central Food Safety Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>5% GST Agricultural Spices Schedule</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                All listed products require verified laboratory test certificates for moisture and foreign matter limits before dispatch.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-amber-950/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} MasalaSetu B2B Technologies Pvt. Ltd. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>GST Exemption Rule 128/2017</span>
            <span>·</span>
            <span>Agmark Grade Special</span>
            <span>·</span>
            <span>Direct Mandi Dispatch</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
