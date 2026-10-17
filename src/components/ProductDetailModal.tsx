import React, { useState } from "react";
import { SpiceProduct } from "../types.ts";
import { useMarketplace } from "../context/MarketplaceContext.tsx";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Package,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

interface ProductDetailModalProps {
  product: SpiceProduct | null;
  onClose: () => void;
  onOpenPrivateLabel?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenPrivateLabel,
}) => {
  const { addToCart, calculateApplicablePrice } = useMarketplace();

  if (!product) return null;

  const [quantityKg, setQuantityKg] = useState<number>(product.moqKg);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const appliedUnitPrice = calculateApplicablePrice(product, quantityKg);
  const subtotal = appliedUnitPrice * quantityKg;
  const estimatedGst = Math.round(subtotal * 0.05); // 5% GST
  const estimatedTotal = subtotal + estimatedGst;

  const handleAddToCart = () => {
    const res = addToCart(product, quantityKg);
    if (res.success) {
      setFeedback({ type: "success", text: res.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1400);
    } else {
      setFeedback({ type: "error", text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-amber-950/10 overflow-hidden my-8">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              {product.brandName} · {product.category}
            </span>
            <h2 className="text-xl font-serif font-bold text-slate-900 leading-tight">
              {product.name}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">{product.hindiName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Product Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block">Origin Mandi</span>
              <span className="font-semibold text-slate-800">{product.originState}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tested Moisture</span>
              <span className="font-semibold text-slate-800 font-mono">
                {product.moisturePercent}% (Limit &lt; 10%)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Shelf Life</span>
              <span className="font-semibold text-slate-800">{product.shelfLifeMonths} Months</span>
            </div>
            <div>
              <span className="text-slate-500 block">Batch No.</span>
              <span className="font-mono font-semibold text-slate-800">{product.batchNo}</span>
            </div>
          </div>

          {/* Description & Aroma */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Quality & Processing Specs
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{product.description}</p>
            {product.aromaProfile && (
              <p className="text-xs text-amber-900 mt-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200/50">
                <span className="font-semibold">Aroma Profile:</span> {product.aromaProfile}
              </p>
            )}
          </div>

          {/* Bulk Tier Schedule */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-700" /> Quantity-Based Wholesale Pricing
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                Min. Order: {product.moqKg} kg
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.priceTiers.map((tier, idx) => {
                const isActive =
                  quantityKg >= tier.minKg &&
                  (tier.maxKg === undefined || quantityKg <= tier.maxKg);
                return (
                  <div
                    key={idx}
                    onClick={() => setQuantityKg(tier.minKg)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isActive
                        ? "border-amber-600 bg-amber-50/80 ring-2 ring-amber-600/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs text-slate-600 font-medium font-mono">
                      {tier.maxKg ? `${tier.minKg} - ${tier.maxKg} kg` : `${tier.minKg}+ kg`}
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                      ₹{tier.pricePerKg}
                      <span className="text-xs font-normal text-slate-500">/kg</span>
                    </div>
                    {tier.pricePerKg < product.basePricePerKg && (
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                        Save ₹{product.basePricePerKg - tier.pricePerKg}/kg
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Calculator Box */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-amber-950/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
              Order Calculator (Real-Time Calculation)
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-amber-950/10">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Enter Required Quantity (kg):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={product.moqKg}
                    max={product.availableStockKg}
                    step={5}
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Math.max(1, Number(e.target.value)))}
                    className="w-32 px-3 py-1.5 text-base font-bold font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <span className="text-xs text-slate-500">
                    Max: {product.availableStockKg.toLocaleString("en-IN")} kg
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Applied Unit Rate</span>
                <span className="text-xl font-bold font-mono text-amber-900">
                  ₹{appliedUnitPrice}
                  <span className="text-xs text-slate-500 font-normal">/kg</span>
                </span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({quantityKg} kg × ₹{appliedUnitPrice}):</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Applicable GST (5% on Spices):</span>
                <span className="font-mono tabular-nums text-slate-800">
                  ₹{estimatedGst.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 text-sm font-bold pt-2 border-t border-amber-950/10">
                <span>Total Estimated Payable:</span>
                <span className="font-mono tabular-nums text-amber-900">
                  ₹{estimatedTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Vendor Trust & Packaging options */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>
                Verified Supplier: <strong>{product.vendorName}</strong> ({product.vendorCity})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Package className="w-3.5 h-3.5" />
              <span>Packs: {product.packagingTypes.join(", ")}</span>
            </div>
          </div>

          {/* Private Label Callout */}
          {product.privateLabelAvailable && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-950 font-medium">
                  Custom Brand Packaging / Private Label available for this spice.
                </span>
              </div>
              {onOpenPrivateLabel && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPrivateLabel();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:text-emerald-950 underline cursor-pointer"
                >
                  Request RFQ Quote
                </button>
              )}
            </div>
          )}

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-rose-100 text-rose-900 border border-rose-300"
              }`}
            >
              {feedback.text}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleAddToCart}
            className="flex-1 max-w-xs px-5 py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Add {quantityKg} kg to Wholesale Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
