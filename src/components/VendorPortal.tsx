import React, { useState } from "react";
import { useMarketplace } from "../context/MarketplaceContext.tsx";
import { SpiceProduct, SubOrder, PrivateLabelRFQ } from "../types.ts";
import {
  Factory,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  ShieldCheck,
  Scale,
  RefreshCw,
  Building2,
  DollarSign,
  ChevronRight,
  Send,
} from "lucide-react";

export const VendorPortal: React.FC = () => {
  const {
    currentVendor,
    products,
    addProduct,
    updateProduct,
    subOrders,
    updateSubOrderStatus,
    settlements,
    privateLabelRFQs,
    submitPrivateLabelQuote,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<"orders" | "catalog" | "rfqs" | "settlements" | "compliance">("orders");

  // New product form state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [pName, setPName] = useState("");
  const [pHindiName, setPHindiName] = useState("");
  const [pCategory, setPCategory] = useState<SpiceProduct["category"]>("Cumin");
  const [pBrand, setPBrand] = useState(currentVendor?.businessName || "Mandi Pure");
  const [pOrigin, setPOrigin] = useState(currentVendor?.state || "Gujarat");
  const [pMoq, setPMoq] = useState(25);
  const [pStock, setPStock] = useState(2500);
  const [pBasePrice, setPBasePrice] = useState(240);
  const [pTier1Min, setPTier1Min] = useState(25);
  const [pTier1Max, setPTier1Max] = useState(49);
  const [pTier1Price, setPTier1Price] = useState(240);
  const [pTier2Min, setPTier2Min] = useState(50);
  const [pTier2Max, setPTier2Max] = useState(99);
  const [pTier2Price, setPTier2Price] = useState(225);
  const [pTier3Min, setPTier3Min] = useState(100);
  const [pTier3Price, setPTier3Price] = useState(210);
  const [pDesc, setPDesc] = useState("");
  const [pAroma, setPAroma] = useState("");
  const [pPackaging, setPPackaging] = useState("HDPE Poly Woven Sacks");
  const [pPrivateLabel, setPPrivateLabel] = useState(true);

  // AI loading state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Quote form state
  const [selectedRfqForQuote, setSelectedRfqForQuote] = useState<PrivateLabelRFQ | null>(null);
  const [quotePrice, setQuotePrice] = useState(410);
  const [quoteMoq, setQuoteMoq] = useState(100);
  const [quoteSampleDays, setQuoteSampleDays] = useState(5);
  const [quoteProdDays, setQuoteProdDays] = useState(12);
  const [quoteDetails, setQuoteDetails] = useState("3-layer food grade pouch with cylinder print");

  const myProducts = products.filter((p) => p.vendorId === currentVendor?.id);
  const mySubOrders = subOrders.filter((s) => s.vendorId === currentVendor?.id);
  const mySettlements = settlements.filter((s) => s.vendorId === currentVendor?.id);

  // Calculate Vendor Metrics
  const grossSales = mySubOrders
    .filter((s) => s.status !== "rejected" && s.status !== "cancelled")
    .reduce((sum, s) => sum + s.subtotal, 0);

  const pendingAcceptanceOrders = mySubOrders.filter((s) => s.status === "placed" || s.status === "awaiting_vendor");
  const activeProcessingOrders = mySubOrders.filter((s) => s.status === "confirmed" || s.status === "processing");
  const dispatchedOrders = mySubOrders.filter((s) => s.status === "dispatched" || s.status === "in_transit" || s.status === "delivered");
  const totalCommissionPaid = mySubOrders.reduce((sum, s) => sum + s.commissionAmount, 0);
  const netEarnings = grossSales - totalCommissionPaid;

  // AI Pricing & Catalog Optimizer
  const handleAiOptimizePricing = async () => {
    if (!pName) return;
    setIsAiLoading(true);
    setAiInsight("Querying Gemini 3.8 Flash for APMC Mandi benchmarks...");

    try {
      const res = await fetch("/api/gemini/price-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spiceName: pName,
          category: pCategory,
          originState: pOrigin,
          currentMandiRate: pBasePrice,
          quantityKg: pStock,
        }),
      });
      const data = await res.json();
      if (data.tiers && data.tiers.length >= 3) {
        setPTier1Price(data.tiers[0].pricePerKg);
        setPTier2Price(data.tiers[1].pricePerKg);
        setPTier3Price(data.tiers[2].pricePerKg);
        setPBasePrice(data.suggestedBasePrice || data.tiers[0].pricePerKg);
        setPMoq(data.recommendedMoqKg || 25);
        setAiInsight(`AI Advisor: ${data.marketInsight} (${data.fssaiNotes})`);
      }
    } catch (e) {
      console.error(e);
      setAiInsight("Applied standard APMC benchmark margin of 10% volume discount.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiOptimizeCatalog = async () => {
    if (!pName) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/gemini/catalog-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spiceName: pName,
          category: pCategory,
          origin: pOrigin,
          packaging: pPackaging,
        }),
      });
      const data = await res.json();
      if (data.description) setPDesc(data.description);
      if (data.aromaProfile) setPAroma(data.aromaProfile);
      if (data.hindiTitle) setPHindiName(data.hindiTitle);
      setAiInsight("Gemini generated sensory profile, Agmark grade specs, and storage guidelines.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVendor) return;

    addProduct({
      vendorId: currentVendor.id,
      vendorName: currentVendor.businessName,
      vendorCity: currentVendor.city,
      vendorState: currentVendor.state,
      vendorVerified: currentVendor.fssaiVerified,
      name: pName,
      hindiName: pHindiName || pName,
      category: pCategory,
      brandName: pBrand,
      sku: "MS-" + pCategory.substring(0, 3).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900),
      description: pDesc || "Export and wholesale grade cleaned spice.",
      aromaProfile: pAroma || "Warm, aromatic, unadulterated.",
      spiceForm: "Whole",
      originState: pOrigin,
      packagingTypes: [pPackaging],
      basePricePerKg: pBasePrice,
      moqKg: pMoq,
      availableStockKg: pStock,
      priceTiers: [
        { minKg: pTier1Min, maxKg: pTier1Max, pricePerKg: pTier1Price },
        { minKg: pTier2Min, maxKg: pTier2Max, pricePerKg: pTier2Price },
        { minKg: pTier3Min, pricePerKg: pTier3Price },
      ],
      packSizesAvailable: ["10 kg", "25 kg", "50 kg"],
      leadTimeDays: currentVendor.dispatchLeadTimeDays,
      shelfLifeMonths: 18,
      storageInstruction: "Store in ventilated dry warehouse.",
      batchNo: "BATCH-" + new Date().getFullYear() + "-" + Math.floor(10 + Math.random() * 90),
      moisturePercent: 8.5,
      returnEligible: true,
      privateLabelAvailable: pPrivateLabel,
      fssaiCertified: currentVendor.fssaiVerified,
    });

    setShowAddProductModal(false);
    setPName("");
    setPDesc("");
    setAiInsight(null);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfqForQuote || !currentVendor) return;

    submitPrivateLabelQuote(selectedRfqForQuote.id, {
      vendorId: currentVendor.id,
      vendorName: currentVendor.businessName,
      vendorCity: `${currentVendor.city}, ${currentVendor.state}`,
      quotedPricePerKg: quotePrice,
      moqOfferedKg: quoteMoq,
      sampleLeadDays: quoteSampleDays,
      productionLeadDays: quoteProdDays,
      packagingDetails: quoteDetails,
      terms: "50% advance on sample signoff, balance on dispatch.",
    });

    setSelectedRfqForQuote(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Vendor Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-800 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
            {currentVendor?.businessName.charAt(0) || "V"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-slate-900">
                {currentVendor?.businessName}
              </h1>
              {currentVendor?.fssaiVerified && (
                <span className="text-xs text-emerald-800 bg-emerald-50 font-medium px-2 py-0.5 rounded inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  FSSAI Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Owner: {currentVendor?.ownerName}</span>
              <span aria-hidden="true">·</span>
              <span>{currentVendor?.city}, {currentVendor?.state}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">FSSAI: {currentVendor?.fssaiNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Spice Listing</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Gross Sales Value</span>
          <div className="text-2xl font-serif font-bold font-mono text-slate-900 mt-1">
            ₹{grossSales.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">From confirmed wholesale orders</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Awaiting Confirmation</span>
          <div className="text-2xl font-serif font-bold font-mono text-amber-800 mt-1">
            {pendingAcceptanceOrders.length} Orders
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Requires inventory verification</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">In Production / Packed</span>
          <div className="text-2xl font-serif font-bold font-mono text-slate-900 mt-1">
            {activeProcessingOrders.length} Orders
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting carrier pickup</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Net Payout Proceeds</span>
          <div className="text-2xl font-serif font-bold font-mono text-emerald-800 mt-1">
            ₹{netEarnings.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">After ~5.5% platform commission</span>
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
          Orders Awaiting Action ({pendingAcceptanceOrders.length + activeProcessingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === "catalog"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          My Spice Catalog ({myProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("rfqs")}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === "rfqs"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Private-Label RFQ Opportunities ({privateLabelRFQs.length})
        </button>
        <button
          onClick={() => setActiveTab("settlements")}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === "settlements"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Settlements & Commissions ({mySettlements.length})
        </button>
        <button
          onClick={() => setActiveTab("compliance")}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === "compliance"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Compliance & Documents
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {mySubOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              No orders assigned to your mill yet.
            </div>
          ) : (
            <div className="space-y-4">
              {mySubOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{order.id}</span>
                        <span className="text-slate-500">· Master: {order.parentOrderId}</span>
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold uppercase text-[10px]">
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1">
                        Retail Buyer: <strong>{order.retailerName}</strong> ({order.retailerPhone})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        ₹{order.subtotal.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Commission: {order.commissionRatePercent}% (₹{order.commissionAmount}) · Net Payout: ₹{order.vendorNetProceeds}
                      </div>
                    </div>
                  </div>

                  {/* Order Line Items */}
                  <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-medium text-slate-800">
                          {item.productName} ({item.quantityKg} kg @ ₹{item.unitPrice}/kg)
                        </span>
                        <span className="font-mono font-semibold">₹{item.lineTotal.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  {/* Vendor Action Buttons based on state */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-500 text-[11px]">
                      Destination: {order.logistics.deliveryAddress}
                    </span>

                    <div className="flex items-center gap-2">
                      {(order.status === "placed" || order.status === "awaiting_vendor") && (
                        <>
                          <button
                            onClick={() =>
                              updateSubOrderStatus(
                                order.id,
                                "rejected",
                                "Vendor rejected order due to stock allocation shortage",
                                "Insufficient stock"
                              )
                            }
                            className="px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md font-semibold cursor-pointer"
                          >
                            Decline Order
                          </button>
                          <button
                            onClick={() =>
                              updateSubOrderStatus(
                                order.id,
                                "confirmed",
                                "Vendor verified stock availability; batch reserved for packing."
                              )
                            }
                            className="px-4 py-1.5 text-white bg-emerald-700 hover:bg-emerald-800 rounded-md font-bold cursor-pointer"
                          >
                            Accept Order & Reserve Stock
                          </button>
                        </>
                      )}

                      {order.status === "confirmed" && (
                        <button
                          onClick={() =>
                            updateSubOrderStatus(
                              order.id,
                              "ready_for_dispatch",
                              "Spices packaged in food-grade sacks, weighed, and labeled for courier pickup."
                            )
                          }
                          className="px-4 py-1.5 text-white bg-purple-700 hover:bg-purple-800 rounded-md font-bold cursor-pointer"
                        >
                          Mark as Packed & Ready for Dispatch
                        </button>
                      )}

                      {order.status === "ready_for_dispatch" && (
                        <span className="text-slate-500 italic">
                          Awaiting mediator logistics desk to assign pickup carrier.
                        </span>
                      )}

                      {order.status === "in_transit" && (
                        <span className="text-sky-800 font-medium">
                          Carrier {order.logistics.carrierName} in transit (AWB: {order.logistics.trackingNumber})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Catalog Tab */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Active wholesale listings manufactured by {currentVendor?.businessName}
            </span>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-700 rounded-lg hover:bg-amber-800 cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Spice
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProducts.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-semibold uppercase">
                      {p.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">{p.hindiName}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      p.status === "approved"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Wholesale Rate:</span>
                    <span className="font-bold text-slate-900">₹{p.basePricePerKg}/kg</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Available Stock:</span>
                    <span className="font-bold text-slate-900">{p.availableStockKg} kg</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>MOQ:</span>
                    <span>{p.moqKg} kg</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-[11px]">Batch: {p.batchNo}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateProduct(p.id, {
                          availableStockKg: p.availableStockKg + 500,
                        })
                      }
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium cursor-pointer"
                    >
                      +500kg Stock
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RFQ Bids Tab */}
      {activeTab === "rfqs" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-base font-serif font-bold text-slate-900">
              Retailer Private-Label Manufacturing Demands
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Supermarket chains and kirana stores requesting customized packaging and formulation quotes.
            </p>
          </div>

          <div className="space-y-3">
            {privateLabelRFQs.map((rfq) => {
              const myQuote = rfq.quotations.find((q) => q.vendorId === currentVendor?.id);

              return (
                <div key={rfq.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="font-mono font-bold text-amber-900">{rfq.id}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        Brand: {rfq.brandNameRequested} ({rfq.spiceCategory})
                      </h4>
                      <p className="text-slate-600 mt-0.5">
                        Target Quantity: {rfq.targetMoqKg} kg · Target Price: ₹{rfq.targetPricePerKg}/kg
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500">Retailer: {rfq.retailerName}</span>
                      <div className="text-[11px] text-slate-400">Required by: {rfq.requiredDeliveryDate}</div>
                    </div>
                  </div>

                  <p className="bg-[#FAF7F2] p-2.5 rounded-lg border border-amber-950/5 text-slate-700">
                    <span className="font-semibold text-slate-900">Specifications:</span> {rfq.customBlendNotes} · {rfq.packagingPreference}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    {myQuote ? (
                      <span className="text-emerald-800 font-semibold">
                        Quotation Submitted: ₹{myQuote.quotedPricePerKg}/kg ({myQuote.status})
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedRfqForQuote(rfq);
                          setQuotePrice(rfq.targetPricePerKg || 400);
                          setQuoteMoq(rfq.targetMoqKg);
                        }}
                        className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Submit Quotation Bid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settlements & Commission Tab */}
      {activeTab === "settlements" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-base font-serif font-bold text-slate-900">
              Vendor Payout Statements & Commission Reconciliation
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Net proceeds after marketplace commission and transport deductions. Handled via direct NEFT bank transfer.
            </p>
          </div>

          <div className="space-y-3">
            {mySettlements.map((s) => (
              <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm">{s.id}</span>
                    <div className="text-slate-500 mt-0.5">
                      Period: {s.periodStart} to {s.periodEnd}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      s.status === "processed"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Gross Orders:</span>
                    <span className="font-bold text-slate-900">₹{s.grossSales.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Platform Commission:</span>
                    <span className="font-bold text-rose-700">-₹{s.commissionDeducted.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Shipping Deductions:</span>
                    <span className="font-bold text-slate-700">-₹{s.shippingDeducted.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Net Bank Payable:</span>
                    <span className="font-bold text-emerald-800 text-xs">
                      ₹{s.netPayable.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {s.transactionRef && (
                  <div className="text-[11px] text-slate-500">
                    Bank Reference: <span className="font-mono font-medium text-slate-800">{s.transactionRef}</span> (Paid on {s.payoutDate})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === "compliance" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 text-xs">
          <h3 className="text-base font-serif font-bold text-slate-900">
            FSSAI Food Safety & Tax Registration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block">FSSAI 14-Digit Central License</span>
              <div className="font-mono font-bold text-base text-slate-900">
                {currentVendor?.fssaiNumber}
              </div>
              <div className="text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified with Central Food Licensing Authority</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block">GSTIN / Tax Registration</span>
              <div className="font-mono font-bold text-base text-slate-900">
                {currentVendor?.gstin}
              </div>
              <div className="text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active 5% GST Commodity Exemption Schedule</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-slate-700 font-bold block">Settlement Bank Account</span>
            <div className="text-slate-600">
              Bank: <strong>{currentVendor?.bankName}</strong> · Account: <strong>{currentVendor?.bankAccountMasked}</strong> · IFSC: <strong className="font-mono">{currentVendor?.ifscCode}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal with AI features */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 text-xs border border-slate-200 my-8 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Add New Wholesale Spice Listing
                </h4>
                <p className="text-[11px] text-slate-500">
                  Mill: {currentVendor?.businessName} ({currentVendor?.city})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* AI Assistant Banner inside form */}
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  Gemini Mandi Intelligence
                </span>
                <span className="text-[11px] text-amber-800 block mt-0.5">
                  Automatically recommend bulk pricing tiers, MOQ, and optimize sensory descriptions.
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAiOptimizePricing}
                  disabled={isAiLoading || !pName}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  AI Pricing Tiers
                </button>
                <button
                  type="button"
                  onClick={handleAiOptimizeCatalog}
                  disabled={isAiLoading || !pName}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  AI Description
                </button>
              </div>
            </div>

            {aiInsight && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed text-[11px]">
                {aiInsight}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Spice Commercial Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salem Swarna Turmeric Powder"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Hindi Title (Devanagari):</label>
                <input
                  type="text"
                  placeholder="e.g. सलेम स्वर्णा शुद्ध हल्दी पाउडर"
                  value={pHindiName}
                  onChange={(e) => setPHindiName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Category:</label>
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="Turmeric">Turmeric</option>
                  <option value="Cumin">Cumin (Jeera)</option>
                  <option value="Red Chilli">Red Chilli</option>
                  <option value="Coriander">Coriander (Dhaniya)</option>
                  <option value="Black Pepper">Black Pepper</option>
                  <option value="Garam Masala">Garam Masala</option>
                  <option value="Whole Spices">Whole Spices</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Available Stock (kg):</label>
                <input
                  type="number"
                  min={50}
                  value={pStock}
                  onChange={(e) => setPStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Minimum Order Qty (kg):</label>
                <input
                  type="number"
                  min={10}
                  value={pMoq}
                  onChange={(e) => setPMoq(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            {/* Pricing Tiers Inputs */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Quantity Price Breaks (₹/kg):</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-500 text-[10px] block">Tier 1 ({pTier1Min}-{pTier1Max}kg):</label>
                  <input
                    type="number"
                    value={pTier1Price}
                    onChange={(e) => setPTier1Price(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block">Tier 2 ({pTier2Min}-{pTier2Max}kg):</label>
                  <input
                    type="number"
                    value={pTier2Price}
                    onChange={(e) => setPTier2Price(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block">Tier 3 ({pTier3Min}kg+):</label>
                  <input
                    type="number"
                    value={pTier3Price}
                    onChange={(e) => setPTier3Price(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Catalog Description:</label>
              <textarea
                rows={3}
                placeholder="Details of cleaning, sorting, sun drying, and purity specs..."
                value={pDesc}
                onChange={(e) => setPDesc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
              >
                Submit Listing for Moderation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quote Submission Modal */}
      {selectedRfqForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleQuoteSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-xs border border-slate-200"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Submit Private-Label Quotation
                </h4>
                <p className="text-[11px] text-slate-500">
                  For: {selectedRfqForQuote.brandNameRequested} ({selectedRfqForQuote.spiceCategory})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRfqForQuote(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Quoted Rate (₹/kg):</label>
                <input
                  type="number"
                  required
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Min Batch (kg):</label>
                <input
                  type="number"
                  value={quoteMoq}
                  onChange={(e) => setQuoteMoq(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Sample Lead (Days):</label>
                <input
                  type="number"
                  value={quoteSampleDays}
                  onChange={(e) => setQuoteSampleDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Production Lead (Days):</label>
                <input
                  type="number"
                  value={quoteProdDays}
                  onChange={(e) => setQuoteProdDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Packaging & Quality Offer:</label>
              <textarea
                rows={2}
                value={quoteDetails}
                onChange={(e) => setQuoteDetails(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRfqForQuote(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
              >
                Send Official Bid
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
