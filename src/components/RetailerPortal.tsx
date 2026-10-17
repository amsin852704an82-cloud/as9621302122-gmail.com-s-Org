import React, { useState } from "react";
import { useMarketplace } from "../context/MarketplaceContext.tsx";
import { ProductCard } from "./ProductCard.tsx";
import { SpiceProduct, SubOrder, OrderDispute, DisputeResolution } from "../types.ts";
import {
  Store,
  Package,
  Truck,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Send,
  Scale,
  FileText,
  MapPin,
  Building2,
} from "lucide-react";

interface RetailerPortalProps {
  onSelectProduct: (product: SpiceProduct) => void;
  onOpenCart: () => void;
}

export const RetailerPortal: React.FC<RetailerPortalProps> = ({ onSelectProduct, onOpenCart }) => {
  const {
    currentRetailer,
    products,
    masterOrders,
    subOrders,
    privateLabelRFQs,
    createPrivateLabelRFQ,
    acceptPrivateLabelQuote,
    disputes,
    submitDispute,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<"catalog" | "orders" | "privatelabel" | "disputes">("orders");
  const [selectedSubOrderForTracking, setSelectedSubOrderForTracking] = useState<SubOrder | null>(null);

  // Dispute form state
  const [disputeModalSubOrder, setDisputeModalSubOrder] = useState<SubOrder | null>(null);
  const [disputeIssueType, setDisputeIssueType] = useState<OrderDispute["issueType"]>("damaged_packaging");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeResolution, setDisputeResolution] = useState<DisputeResolution>("partial_refund");

  // Private label form state
  const [showRfqForm, setShowRfqForm] = useState(false);
  const [rfqBrandName, setRfqBrandName] = useState("");
  const [rfqCategory, setRfqCategory] = useState("Garam Masala");
  const [rfqTargetMoq, setRfqTargetMoq] = useState(100);
  const [rfqTargetPrice, setRfqTargetPrice] = useState(380);
  const [rfqPackaging, setRfqPackaging] = useState("Nitrogen flushed stand-up zip pouch");
  const [rfqBlendNotes, setRfqBlendNotes] = useState("");
  const [rfqDeliveryDate, setRfqDeliveryDate] = useState("2026-03-30");

  const myMasterOrders = masterOrders.filter((o) => o.retailerId === currentRetailer?.id);
  const mySubOrders = subOrders.filter((s) => s.retailerId === currentRetailer?.id);
  const myRFQs = privateLabelRFQs.filter((r) => r.retailerId === currentRetailer?.id);
  const myDisputes = disputes.filter((d) => d.retailerId === currentRetailer?.id);

  const handleCreateRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqBrandName || !currentRetailer) return;

    createPrivateLabelRFQ({
      retailerId: currentRetailer.id,
      retailerName: currentRetailer.shopName,
      retailerPhone: currentRetailer.phone,
      brandNameRequested: rfqBrandName,
      spiceCategory: rfqCategory,
      targetMoqKg: Number(rfqTargetMoq),
      targetPricePerKg: Number(rfqTargetPrice),
      packSizesRequested: ["100g Pouch", "250g Pouch", "500g Jar"],
      packagingPreference: rfqPackaging,
      customBlendNotes: rfqBlendNotes,
      artworkUploaded: true,
      requiredDeliveryDate: rfqDeliveryDate,
    });

    setShowRfqForm(false);
    setRfqBrandName("");
    setRfqBlendNotes("");
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeModalSubOrder) return;

    submitDispute({
      subOrderId: disputeModalSubOrder.id,
      parentOrderId: disputeModalSubOrder.parentOrderId,
      issueType: disputeIssueType,
      description: disputeDescription,
      evidenceNotes: "Photographs of damaged packaging and freight bill counter-signed by transport driver.",
      requestedResolution: disputeResolution,
    });

    setDisputeModalSubOrder(null);
    setDisputeDescription("");
    setActiveTab("disputes");
  };

  const getOrderStatusBadge = (status: SubOrder["status"]) => {
    switch (status) {
      case "placed":
        return <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium">Placed</span>;
      case "awaiting_vendor":
        return <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium">Awaiting Vendor</span>;
      case "confirmed":
        return <span className="text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-medium">Mill Confirmed</span>;
      case "ready_for_dispatch":
        return <span className="text-purple-800 bg-purple-50 px-2 py-0.5 rounded text-[11px] font-medium">Packed & Ready</span>;
      case "in_transit":
        return <span className="text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-[11px] font-medium">In Transit</span>;
      case "delivered":
      case "completed":
        return <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium">Delivered</span>;
      case "disputed":
        return <span className="text-rose-800 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-medium">Disputed</span>;
      default:
        return <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Retailer Store Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
            {currentRetailer?.shopName.charAt(0) || "R"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-slate-900">
                {currentRetailer?.shopName}
              </h1>
              <span className="text-xs text-emerald-800 bg-emerald-50 font-medium px-2 py-0.5 rounded">
                {currentRetailer?.businessType}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Owner: {currentRetailer?.ownerName}</span>
              <span aria-hidden="true">·</span>
              <span>{currentRetailer?.city}, {currentRetailer?.state}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">GSTIN: {currentRetailer?.gstin}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
          >
            Open Wholesale Cart
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === "orders"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          My Wholesale Orders ({myMasterOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === "catalog"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Browse Mandi Catalog
        </button>
        <button
          onClick={() => setActiveTab("privatelabel")}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === "privatelabel"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Private-Label RFQs ({myRFQs.length})
        </button>
        <button
          onClick={() => setActiveTab("disputes")}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === "disputes"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Disputes & Resolution ({myDisputes.length})
        </button>
      </div>

      {/* Tab 1: Orders List with Multi-vendor sub-orders */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {myMasterOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No wholesale orders placed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Browse our verified spice mills in Unjha, Salem, and Guntur to place your first bulk order.
              </p>
              <button
                onClick={() => setActiveTab("catalog")}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-amber-800 cursor-pointer"
              >
                Browse Wholesale Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myMasterOrders.map((master) => {
                const subOrdersForMaster = subOrders.filter((s) => s.parentOrderId === master.id);

                return (
                  <div
                    key={master.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                  >
                    {/* Master Order Top Bar */}
                    <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Master Order</span>
                        <div className="font-mono font-bold text-slate-900 text-sm">{master.id}</div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Date Placed</span>
                        <div className="text-slate-700">
                          {new Date(master.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Invoice (Inc. GST)</span>
                        <div className="font-mono font-bold text-slate-900">
                          ₹{master.totalPayableAmount.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Payment Status</span>
                        <div className="text-emerald-700 font-semibold uppercase">{master.paymentStatus}</div>
                      </div>
                    </div>

                    {/* Sub-Orders Grid */}
                    <div className="p-5 divide-y divide-slate-100 space-y-4">
                      {subOrdersForMaster.map((sub) => (
                        <div key={sub.id} className="pt-4 first:pt-0 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-amber-700" />
                              <span className="text-xs font-bold text-slate-900">{sub.vendorName}</span>
                              <span className="text-xs text-slate-500 font-mono">({sub.id})</span>
                              {getOrderStatusBadge(sub.status)}
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              {sub.logistics.carrierName && (
                                <button
                                  onClick={() => setSelectedSubOrderForTracking(sub)}
                                  className="px-2.5 py-1 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Track Shipment</span>
                                </button>
                              )}

                              <button
                                onClick={() => setDisputeModalSubOrder(sub)}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Report Issue / Return</span>
                              </button>
                            </div>
                          </div>

                          {/* Items Table */}
                          <div className="bg-[#FAF7F2] rounded-lg p-3 text-xs space-y-2 border border-amber-950/5">
                            {sub.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center">
                                <div>
                                  <span className="font-semibold text-slate-900">{item.productName}</span>
                                  <span className="text-slate-500 ml-2 font-mono">
                                    {item.quantityKg} kg × ₹{item.unitPrice}/kg
                                  </span>
                                  <span className="text-[11px] text-amber-900 ml-2">({item.tierDescription})</span>
                                </div>
                                <span className="font-mono font-bold text-slate-900">
                                  ₹{item.lineTotal.toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}

                            <div className="pt-2 border-t border-amber-950/10 flex justify-between text-slate-600 text-[11px]">
                              <span>Subtotal: ₹{sub.subtotal} + 5% GST: ₹{sub.taxAmount} + Freight: ₹{sub.shippingFee}</span>
                              <span className="font-bold text-slate-900 font-mono text-xs">
                                Sub-Order Total: ₹{sub.totalPayable.toLocaleString("en-IN")}
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
        </div>
      )}

      {/* Tab 2: Catalog view */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products
            .filter((p) => p.status === "approved")
            .map((prod) => (
              <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
            ))}
        </div>
      )}

      {/* Tab 3: Private Label RFQ Desk */}
      {activeTab === "privatelabel" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Custom Private-Label Spice RFQ Desk
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Request quotations from certified spice processors to manufacture and pack spices under your retail store brand.
              </p>
            </div>
            <button
              onClick={() => setShowRfqForm(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New Private-Label RFQ</span>
            </button>
          </div>

          {/* New RFQ Modal/Form */}
          {showRfqForm && (
            <form
              onSubmit={handleCreateRfq}
              className="bg-white p-6 rounded-xl border-2 border-amber-600 shadow-md space-y-4 text-xs"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">
                  New Private-Label Manufacturing Request (RFQ)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowRfqForm(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Your Brand Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma Royal Spices"
                    value={rfqBrandName}
                    onChange={(e) => setRfqBrandName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Spice Category:</label>
                  <select
                    value={rfqCategory}
                    onChange={(e) => setRfqCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="Garam Masala">Royal Garam Masala Blend</option>
                    <option value="Turmeric">Pure Salem Turmeric Powder</option>
                    <option value="Red Chilli">Kashmiri Ruby Red Chilli Powder</option>
                    <option value="Coriander">Eagle Coriander Powder</option>
                    <option value="Kitchen King">Kitchen King All-Rounder Blend</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Target Batch MOQ (kg):</label>
                  <input
                    type="number"
                    min={50}
                    step={25}
                    value={rfqTargetMoq}
                    onChange={(e) => setRfqTargetMoq(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Packaging Format:</label>
                  <input
                    type="text"
                    value={rfqPackaging}
                    onChange={(e) => setRfqPackaging(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Target Max Price (₹/kg):</label>
                  <input
                    type="number"
                    value={rfqTargetPrice}
                    onChange={(e) => setRfqTargetPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Custom Formulation Notes:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Higher aroma notes with green cardamom and cinnamon, low heat for family kitchen consumption."
                  value={rfqBlendNotes}
                  onChange={(e) => setRfqBlendNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRfqForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
                >
                  Post RFQ to Verified Spice Mills
                </button>
              </div>
            </form>
          )}

          {/* List of active RFQs */}
          <div className="space-y-4">
            {myRFQs.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-amber-900 bg-amber-50 font-bold px-2 py-0.5 rounded uppercase">
                      Brand: {rfq.brandNameRequested}
                    </span>
                    <h4 className="text-base font-serif font-bold text-slate-900 mt-1">
                      {rfq.spiceCategory} · {rfq.targetMoqKg} kg Batch
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">{rfq.customBlendNotes}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                      Status: {rfq.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <div className="text-xs text-slate-500 mt-1">
                      Target Rate: ₹{rfq.targetPricePerKg}/kg
                    </div>
                  </div>
                </div>

                {/* Quotations Received */}
                <div className="pt-3 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-slate-800 mb-2">
                    Vendor Quotations Received ({rfq.quotations.length}):
                  </h5>

                  {rfq.quotations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Awaiting bids from matched spice processors.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rfq.quotations.map((quote) => (
                        <div
                          key={quote.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-900">{quote.vendorName}</span>
                              <div className="text-[11px] text-slate-500">{quote.vendorCity}</div>
                            </div>
                            <span className="font-mono font-bold text-amber-900 text-sm">
                              ₹{quote.quotedPricePerKg}/kg
                            </span>
                          </div>

                          <p className="text-slate-600 text-[11px]">{quote.packagingDetails}</p>

                          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <span>Sample Lead: {quote.sampleLeadDays} days</span>
                            <span>Prod Lead: {quote.productionLeadDays} days</span>
                          </div>

                          {rfq.status === "open_for_bids" && (
                            <button
                              onClick={() => acceptPrivateLabelQuote(rfq.id, quote.id)}
                              className="w-full mt-1 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-amber-800 rounded-md transition-colors cursor-pointer"
                            >
                              Accept This Quotation
                            </button>
                          )}
                          {quote.status === "accepted" && (
                            <span className="block text-center text-xs font-bold text-emerald-800 bg-emerald-100 py-1 rounded">
                              Quotation Accepted
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Disputes & Resolution Desk */}
      {activeTab === "disputes" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-base font-serif font-bold text-slate-900">
              Retailer Dispute & Return Resolutions
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Platform owner acts as independent mediator. Transit damage, moisture variance, and weight discrepancies are investigated and refunded.
            </p>
          </div>

          {myDisputes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              No disputes logged. Your orders are progressing smoothly!
            </div>
          ) : (
            <div className="space-y-3">
              {myDisputes.map((d) => (
                <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900 font-mono">{d.id}</span>
                      <span className="text-slate-500 ml-2">Order: {d.subOrderId}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                        d.status === "approved"
                          ? "bg-emerald-50 text-emerald-800"
                          : d.status === "rejected"
                          ? "bg-rose-50 text-rose-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <p className="text-slate-700 font-medium">Issue: {d.issueType.replace(/_/g, " ")}</p>
                  <p className="text-slate-600">{d.description}</p>

                  {d.adminResolutionNotes && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2 text-slate-700">
                      <span className="font-bold text-amber-900 block">Mediator Resolution:</span>
                      {d.adminResolutionNotes}
                      {d.refundAmount && (
                        <span className="block mt-1 font-bold text-emerald-700">
                          Approved Refund: ₹{d.refundAmount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tracking Modal */}
      {selectedSubOrderForTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Live Dispatch & Logistics Tracking
                </h4>
                <p className="text-[11px] text-slate-500">
                  Sub-Order: {selectedSubOrderForTracking.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubOrderForTracking(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-amber-950/10 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Carrier:</span>
                <span className="font-bold text-slate-900">{selectedSubOrderForTracking.logistics.carrierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tracking AWB:</span>
                <span className="font-mono font-bold text-amber-900">
                  {selectedSubOrderForTracking.logistics.trackingNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Delivery:</span>
                <span className="text-slate-800 font-medium">
                  {selectedSubOrderForTracking.logistics.estimatedDeliveryDate}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h5 className="font-bold text-slate-800">Tracking Event Timeline:</h5>
              <div className="relative border-l-2 border-amber-700 pl-4 space-y-3">
                {selectedSubOrderForTracking.events.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-700" />
                    <div className="font-bold text-slate-900">{event.title}</div>
                    <div className="text-slate-600 text-[11px]">{event.note}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(event.timestamp).toLocaleString("en-IN")} · {event.actor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalSubOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleDisputeSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-xs border border-slate-200"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Raise Issue / Return for {disputeModalSubOrder.id}
              </h4>
              <button
                type="button"
                onClick={() => setDisputeModalSubOrder(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Issue Category:</label>
              <select
                value={disputeIssueType}
                onChange={(e) => setDisputeIssueType(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="damaged_packaging">Damaged Packaging / Spillage</option>
                <option value="wrong_product">Incorrect Product Delivered</option>
                <option value="quality_moisture_concern">Moisture / Aroma Quality Concern</option>
                <option value="short_shipment">Short Shipment / Weight Shortage</option>
                <option value="late_delivery">Excessive Delivery Delay</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Issue Description:</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the discrepancy with batch numbers or damage details..."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Preferred Resolution:</label>
              <select
                value={disputeResolution}
                onChange={(e) => setDisputeResolution(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="partial_refund">Partial Refund / Credit Note</option>
                <option value="replacement">Free Batch Replacement</option>
                <option value="full_refund">Full Return & Refund</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDisputeModalSubOrder(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg cursor-pointer"
              >
                Submit Dispute to Platform Mediator
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
