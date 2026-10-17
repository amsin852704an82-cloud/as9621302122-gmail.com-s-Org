import React from "react";
import { SpiceProduct } from "../types.ts";
import { ShieldCheck, Scale, MapPin } from "lucide-react";

interface ProductCardProps {
  product: SpiceProduct;
  onSelect: (product: SpiceProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  // Category-based gradient accents
  const getSpiceGradient = (category: string) => {
    switch (category) {
      case "Turmeric":
        return "from-amber-600/15 via-yellow-500/10 to-amber-700/20 text-amber-900 border-amber-300/40";
      case "Red Chilli":
        return "from-rose-600/15 via-red-500/10 to-rose-700/20 text-rose-900 border-rose-300/40";
      case "Coriander":
        return "from-emerald-600/15 via-teal-500/10 to-green-700/20 text-emerald-900 border-emerald-300/40";
      case "Cumin":
        return "from-amber-800/15 via-stone-600/10 to-amber-900/20 text-stone-900 border-amber-400/40";
      case "Black Pepper":
        return "from-slate-800/15 via-stone-700/10 to-slate-900/20 text-slate-900 border-slate-300/40";
      default:
        return "from-amber-700/15 via-orange-600/10 to-amber-900/20 text-amber-950 border-amber-300/40";
    }
  };

  const lowestTierPrice = product.priceTiers?.length
    ? Math.min(...product.priceTiers.map((t) => t.pricePerKg))
    : product.basePricePerKg;

  return (
    <div className="group bg-white rounded-xl border border-amber-950/10 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Visual Container with resilient fallback */}
      <div
        className={`relative h-44 bg-gradient-to-br ${getSpiceGradient(
          product.category
        )} p-4 flex flex-col justify-between overflow-hidden border-b`}
      >
        {/* Subtle decorative background pattern */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/30 blur-xl pointer-events-none" />

        {/* Top unboxed status row */}
        <div className="relative z-10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span>{product.originState}</span>
            <span aria-hidden="true">·</span>
            <span>{product.spiceForm}</span>
          </div>

          {product.fssaiCertified && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>FSSAI Certified</span>
            </div>
          )}
        </div>

        {/* Center Title Display */}
        <div className="relative z-10 my-auto">
          <p className="text-xs uppercase tracking-wider text-amber-900/70 font-semibold">
            {product.brandName}
          </p>
          <h3 className="text-lg font-serif font-bold text-slate-900 leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 font-sans line-clamp-1">
            {product.hindiName}
          </p>
        </div>

        {/* Bottom subtle metadata */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-black/5">
          <span className="truncate max-w-[170px]">Mfd by {product.vendorName}</span>
          <span className="font-mono tabular-nums text-slate-700 font-medium">
            Stock: {product.availableStockKg.toLocaleString("en-IN")} kg
          </span>
        </div>
      </div>

      {/* Content & Commercial Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Aroma & Sensory note */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {product.aromaProfile || product.description}
          </p>

          {/* Pricing Tiers Snapshot */}
          <div className="bg-[#FAF7F2] rounded-lg p-2.5 border border-amber-950/5 mb-3">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Scale className="w-3 h-3 text-amber-700" /> Bulk Tiers
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                MOQ: {product.moqKg} kg
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              {product.priceTiers.slice(0, 3).map((tier, idx) => (
                <div key={idx} className="bg-white/90 rounded px-1.5 py-1 border border-amber-950/5">
                  <div className="text-[10px] text-slate-500 font-mono">
                    {tier.maxKg ? `${tier.minKg}-${tier.maxKg}kg` : `${tier.minKg}kg+`}
                  </div>
                  <div className="font-bold font-mono tabular-nums text-amber-950 text-xs">
                    ₹{tier.pricePerKg}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-500 block">Wholesale from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                ₹{lowestTierPrice}
              </span>
              <span className="text-xs text-slate-500">/kg</span>
            </div>
          </div>

          <button
            onClick={() => onSelect(product)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-amber-800 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            Calculate & Order
          </button>
        </div>
      </div>
    </div>
  );
};
