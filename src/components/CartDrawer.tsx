import React, { useState } from "react";
import { useMarketplace } from "../context/MarketplaceContext.tsx";
import {
  X,
  Trash2,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MapPin,
  Truck,
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted?: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderCompleted }) => {
  const {
    cart,
    cartByVendor,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotalGross,
    cartTotalTax,
    cartTotalShipping,
    cartTotalPayable,
    checkoutCart,
    currentRetailer,
  } = useMarketplace();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "success">("cart");
  const [address, setAddress] = useState(currentRetailer?.address || "Shop 14-16, Chaura Rasta, Johari Bazar");
  const [city, setCity] = useState(currentRetailer?.city || "Jaipur");
  const [state, setState] = useState(currentRetailer?.state || "Rajasthan");
  const [pincode, setPincode] = useState(currentRetailer?.pincode || "302003");
  const [paymentMode, setPaymentMode] = useState<
    "demo_upi" | "demo_netbanking" | "demo_neft_rtgs" | "credit_line_15d"
  >("demo_upi");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCheckoutSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const res = checkoutCart({
        paymentMode,
        deliveryAddress: address,
        city,
        state,
        pincode,
      });
      setIsSubmitting(false);
      if (res.success && res.masterOrderId) {
        setCreatedOrderId(res.masterOrderId);
        setCheckoutStep("success");
        if (onOrderCompleted) onOrderCompleted(res.masterOrderId);
      }
    }, 600);
  };

  const vendorCount = Object.keys(cartByVendor).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-amber-950/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900">
              Wholesale Order Cart
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {cart.length > 0
                ? `${cart.length} product(s) across ${vendorCount} spice vendor(s)`
                : "Your wholesale cart is empty"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {checkoutStep === "cart" && (
            <>
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl font-serif">
                    M
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">
                    No spices in cart
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Explore verified spice manufacturers and suppliers from Unjha, Salem, Guntur, and Ramganj.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Browse Wholesale Spices
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Notice of multi-vendor order split */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Multi-Vendor Direct Fulfillment:</span>
                      Cart will automatically generate separate vendor sub-orders for direct mandi dispatch with unified master billing.
                    </div>
                  </div>

                  {/* Grouped by Vendor */}
                  {Object.keys(cartByVendor).map((vendorId) => {
                    const items = cartByVendor[vendorId];
                    const vendorName = items[0]?.product.vendorName || "Spice Vendor";
                    const vendorCity = items[0]?.product.vendorCity;
                    const vendorSubtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

                    return (
                      <div
                        key={vendorId}
                        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                      >
                        {/* Vendor Sub-header */}
                        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-amber-700" />
                            <span>{vendorName}</span>
                            {vendorCity && <span className="text-slate-500 font-normal">({vendorCity})</span>}
                          </div>
                          <span className="font-mono text-slate-600">
                            Subtotal: ₹{vendorSubtotal.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Items under this vendor */}
                        <div className="divide-y divide-slate-100 p-3 space-y-3">
                          {items.map((item) => (
                            <div key={item.product.id} className="pt-2 first:pt-0">
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                    {item.product.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                    <span>Rate: ₹{item.appliedTierPrice}/kg</span>
                                    <span aria-hidden="true">·</span>
                                    <span>MOQ: {item.product.moqKg}kg</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Quantity Stepper and Line Total */}
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-600 font-medium">Qty (kg):</span>
                                  <input
                                    type="number"
                                    min={item.product.moqKg}
                                    step={5}
                                    value={item.quantityKg}
                                    onChange={(e) =>
                                      updateCartQuantity(item.product.id, Number(e.target.value))
                                    }
                                    className="w-20 px-2 py-1 text-xs font-mono font-semibold bg-white border border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-600"
                                  />
                                </div>

                                <div className="text-right">
                                  <span className="text-xs font-bold font-mono text-slate-900">
                                    ₹{item.lineTotal.toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {checkoutStep === "address" && (
            <div className="space-y-5 text-xs">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900">
                <span className="font-semibold block">Retailer Billing & Delivery Address:</span>
                Order will be dispatched to this Kirana / Supermarket facility.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Store / Facility Address:
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-700 font-medium block mb-1">City:</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-medium block mb-1">State:</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-medium block mb-1">Pincode:</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Select B2B Settlement / Payment Method:
                  </label>
                  <div className="space-y-2 mt-2">
                    {[
                      {
                        id: "demo_upi",
                        label: "Instant Mandi UPI QR (Commercial)",
                        desc: "Zero surcharge direct bank transfer",
                      },
                      {
                        id: "demo_netbanking",
                        label: "Corporate NetBanking (HDFC / ICICI / SBI)",
                        desc: "Direct escrow payment via partner bank",
                      },
                      {
                        id: "demo_neft_rtgs",
                        label: "NEFT / RTGS Bank Transfer",
                        desc: "Standard high-value wholesale clearing",
                      },
                      {
                        id: "credit_line_15d",
                        label: "15-Day Kirana Trade Credit Line",
                        desc: "Pre-approved retailer working capital line",
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          paymentMode === opt.id
                            ? "border-amber-600 bg-amber-50/70"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={paymentMode === opt.id}
                          onChange={() => setPaymentMode(opt.id as any)}
                          className="mt-0.5 text-amber-700 focus:ring-amber-600"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{opt.label}</div>
                          <div className="text-[11px] text-slate-500">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {checkoutStep === "success" && (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                Wholesale Order Confirmed!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your Master Order <strong className="font-mono text-amber-950 font-bold">{createdOrderId}</strong> has been created and split into vendor sub-orders for mill packing.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Retailer:</span>
                  <span className="font-semibold text-slate-800">{currentRetailer?.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery To:</span>
                  <span className="font-semibold text-slate-800">{city}, {state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total B2B Invoice:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{cartTotalPayable.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => {
                    setCheckoutStep("cart");
                    onClose();
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
                >
                  Track in Buyer Orders
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Financial Summary */}
        {cart.length > 0 && checkoutStep !== "success" && (
          <div className="p-6 bg-[#FAF7F2] border-t border-amber-950/10 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Product Subtotal:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">
                  ₹{cartTotalGross.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5% Agricultural Spices):</span>
                <span className="font-mono tabular-nums text-slate-800">
                  ₹{cartTotalTax.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  Direct Mandi Freight ({vendorCount} vendor{vendorCount > 1 ? "s" : ""}):
                </span>
                <span className="font-mono tabular-nums text-slate-800">
                  ₹{cartTotalShipping.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 text-sm font-bold pt-2 border-t border-amber-950/10">
                <span>Total Amount Payable:</span>
                <span className="font-mono tabular-nums text-amber-900">
                  ₹{cartTotalPayable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-2">
              {checkoutStep === "cart" ? (
                <button
                  onClick={() => setCheckoutStep("address")}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Delivery & Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutStep("cart")}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Splitting Sub-Orders...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Place Bulk Order (₹{cartTotalPayable.toLocaleString("en-IN")})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
