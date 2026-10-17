import React, { useState } from "react";
import { useMarketplace } from "../context/MarketplaceContext.tsx";
import { VendorProfile, SpiceProduct, SubOrder, CommissionSetting, OrderDispute, DisputeResolution } from "../types.ts";
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Building2,
  Users,
  AlertTriangle,
  Truck,
  CheckCircle2,
  XCircle,
  Percent,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

export const AdminPortal: React.FC = () => {
  const {
    vendors,
    updateVendorStatus,
    products,
    moderateProduct,
    subOrders,
    assignLogistics,
    commissionSettings,
    updateCommissionRate,
    addCommissionRule,
    settlements,
    approveSettlement,
    disputes,
    resolveDispute,
    auditLogs,
    resetToSampleData,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<
    "vendors" | "products" | "orders" | "commission" | "settlements" | "disputes" | "audit"
  >("vendors");

  // Logistics assignment modal state
  const [assigningSubOrder, setAssigningSubOrder] = useState<SubOrder | null>(null);
  const [carrierName, setCarrierName] = useState("Delhivery Surface Freight");
  const [trackingNumber, setTrackingNumber] = useState("DLH-7781-9921-IN");
  const [estDeliveryDate, setEstDeliveryDate] = useState("2026-02-28");

  // Dispute resolution state
  const [resolvingDispute, setResolvingDispute] = useState<OrderDispute | null>(null);
  const [disputeNotes, setDisputeNotes] = useState("");
  const [disputeRefundAmt, setDisputeRefundAmt] = useState(900);

  // New commission rule state
  const [showAddCommModal, setShowAddCommModal] = useState(false);
  const [newCommTarget, setNewCommTarget] = useState<CommissionSetting["targetType"]>("category");
  const [newCommCategory, setNewCommCategory] = useState("Turmeric");
  const [newCommRate, setNewCommRate] = useState(5.5);

  // Financial calculations
  const totalGMV = subOrders
    .filter((s) => s.status !== "rejected" && s.status !== "cancelled")
    .reduce((sum, s) => sum + s.subtotal, 0);

  const totalCommissionRevenue = subOrders
    .filter((s) => s.status !== "rejected" && s.status !== "cancelled")
    .reduce((sum, s) => sum + s.commissionAmount, 0);

  const pendingVendorApprovals = vendors.filter((v) => v.verificationStatus === "submitted" || v.verificationStatus === "under_review");
  const pendingProductModerations = products.filter((p) => p.status === "pending_approval");
  const openDisputes = disputes.filter((d) => d.status === "open" || d.status === "investigating");

  const handleAssignLogisticsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSubOrder) return;
    assignLogistics(assigningSubOrder.id, {
      carrierName,
      trackingNumber,
      estimatedDeliveryDate: estDeliveryDate,
    });
    setAssigningSubOrder(null);
  };

  const handleResolveDisputeSubmit = (resolution: DisputeResolution) => {
    if (!resolvingDispute) return;
    resolveDispute(
      resolvingDispute.id,
      resolution,
      disputeNotes || "Mediator verified transit report and authorized resolution.",
      resolution === "partial_refund" ? disputeRefundAmt : undefined
    );
    setResolvingDispute(null);
    setDisputeNotes("");
  };

  const handleExportCsv = () => {
    const headers = ["Order ID", "Retailer", "Vendor", "Subtotal", "GST", "Commission", "Net Proceeds", "Status", "Date"];
    const rows = subOrders.map((s) => [
      s.id,
      `"${s.retailerName}"`,
      `"${s.vendorName}"`,
      s.subtotal,
      s.taxAmount,
      s.commissionAmount,
      s.vendorNetProceeds,
      s.status,
      s.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MasalaSetu_Orders_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Platform Owner Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-600 text-slate-950 flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
            MS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-white">
                MasalaSetu Platform Control Center
              </h1>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                Mediator Admin
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Overseeing APMC vendor onboarding, order splitting, logistics dispatch, commission reconciliation, and disputes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Orders CSV</span>
          </button>
          <button
            onClick={resetToSampleData}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset storage to default sample mandi data"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Admin KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Total GMV</span>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
            ₹{totalGMV.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-slate-400">Total volume</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Commission Revenue</span>
          <div className="text-lg font-bold font-mono text-emerald-800 mt-0.5">
            ₹{totalCommissionRevenue.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-slate-400">~5-6% brokerage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Active Vendors</span>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
            {vendors.filter((v) => v.verificationStatus === "approved").length} Mills
          </div>
          <span className="text-[10px] text-slate-400">
            {pendingVendorApprovals.length} review pending
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Marketplace Orders</span>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
            {subOrders.length} Sub-Orders
          </div>
          <span className="text-[10px] text-slate-400">Split by mill</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Pending Moderation</span>
          <div className="text-lg font-bold font-mono text-amber-800 mt-0.5">
            {pendingProductModerations.length} Spices
          </div>
          <span className="text-[10px] text-slate-400">Catalog queue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Open Disputes</span>
          <div className="text-lg font-bold font-mono text-rose-800 mt-0.5">
            {openDisputes.length} Cases
          </div>
          <span className="text-[10px] text-slate-400">Needs mediation</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-medium pb-1">
        <button
          onClick={() => setActiveTab("vendors")}
          className={`pb-2.5 px-3 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "vendors"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Vendor Verification & FSSAI ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-2.5 px-3 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "products"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Product Moderation ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-2.5 px-3 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "orders"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Orders & Logistics Coordinator ({subOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("commission")}
          className={`pb-2.5 px-3 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "commission"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Commission Rules Engine
        </button>
        <button
          onClick={() => setActiveTab("settlements")}
          className={`pb-2.5 px-3 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "settlements"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Vendor Settlements Ledger ({settlements.length})
        </button>
        <button
          onClick={() => setActiveTab("disputes")}
          className={`pb-2.5 px-3 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "disputes"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Dispute Desk ({disputes.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-2.5 px-3 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
            activeTab === "audit"
              ? "border-amber-700 text-amber-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Platform Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Vendor Verification */}
      {activeTab === "vendors" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">
              Mandi Vendor Directory & Document Authentication
            </span>
            <span className="text-slate-500">
              Validate 14-digit FSSAI licenses before enabling public checkout
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50/70 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Vendor Mill</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">FSSAI / GSTIN</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{v.businessName}</div>
                      <div className="text-[11px] text-slate-500">
                        {v.ownerName} · {v.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {v.city}, {v.state}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      <div className="text-slate-800">FSSAI: {v.fssaiNumber}</div>
                      <div className="text-slate-500 text-[10px]">GSTIN: {v.gstin}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {v.monthlyCapacityKg.toLocaleString("en-IN")} kg/mo
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          v.verificationStatus === "approved"
                            ? "bg-emerald-50 text-emerald-800"
                            : v.verificationStatus === "rejected"
                            ? "bg-rose-50 text-rose-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {v.verificationStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.verificationStatus !== "approved" && (
                          <button
                            onClick={() => updateVendorStatus(v.id, "approved")}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer"
                          >
                            Approve FSSAI
                          </button>
                        )}
                        {v.verificationStatus === "approved" && (
                          <button
                            onClick={() => updateVendorStatus(v.id, "suspended", "Audit document renewal pending")}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Product Moderation */}
      {activeTab === "products" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">
              Spice Listings Moderation Queue
            </span>
            <span className="text-slate-500">
              Audit sensory details, moisture %, and wholesale price tiers before public publishing
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50/70 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Vendor Mill</th>
                  <th className="px-4 py-3">Base Price</th>
                  <th className="px-4 py-3">Moisture & Batch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.hindiName}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {p.vendorName} ({p.originState})
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      ₹{p.basePricePerKg}/kg
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {p.moisturePercent}% · {p.batchNo}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          p.status === "approved"
                            ? "bg-emerald-50 text-emerald-800"
                            : p.status === "rejected"
                            ? "bg-rose-50 text-rose-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === "pending_approval" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => moderateProduct(p.id, "approved")}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => moderateProduct(p.id, "rejected", "Batch lab test not attached")}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : p.status === "approved" ? (
                        <button
                          onClick={() => moderateProduct(p.id, "delisted" as any, "Delisted by admin")}
                          className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          Delist
                        </button>
                      ) : (
                        <button
                          onClick={() => moderateProduct(p.id, "approved")}
                          className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
                        >
                          Re-approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Orders & Logistics Dispatch Coordinator */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-slate-900 block">
                Central Orders Dispatch & Logistics Coordinator
              </span>
              <span className="text-slate-500">
                Assign surface freight couriers (Delhivery, VRL, Rivigo) and manage pickup scheduling
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {subOrders.map((sub) => (
              <div key={sub.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{sub.id}</span>
                      <span className="text-slate-400">· Master: {sub.parentOrderId}</span>
                      <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded font-semibold uppercase text-[10px]">
                        {sub.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      From: <strong>{sub.vendorName}</strong> ({sub.vendorState}) → To: <strong>{sub.retailerName}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      ₹{sub.totalPayable.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      Platform Fee: ₹{sub.commissionAmount} ({sub.commissionRatePercent}%)
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg flex flex-wrap justify-between items-center text-[11px] text-slate-600">
                  <div>
                    <span>Items: </span>
                    <strong className="text-slate-800">
                      {sub.items.map((i) => `${i.productName} (${i.quantityKg}kg)`).join(", ")}
                    </strong>
                  </div>
                  <div>
                    <span>Freight: ₹{sub.shippingFee}</span>
                  </div>
                </div>

                {/* Logistics Action */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-slate-500">
                    {sub.logistics.carrierName ? (
                      <span className="text-slate-800 font-medium">
                        Carrier: <strong>{sub.logistics.carrierName}</strong> (AWB: <span className="font-mono text-amber-900">{sub.logistics.trackingNumber}</span>) · Est: {sub.logistics.estimatedDeliveryDate}
                      </span>
                    ) : (
                      <span className="text-amber-800 italic">Logistics carrier not yet assigned</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAssigningSubOrder(sub);
                        setCarrierName("Delhivery Surface Freight");
                        setTrackingNumber("DLH-" + Math.floor(1000 + Math.random() * 9000) + "-IN");
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-amber-800 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{sub.logistics.carrierName ? "Update Carrier / AWB" : "Assign Freight Carrier"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Commission Rules Engine */}
      {activeTab === "commission" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-900">
                Marketplace Brokerage & Commission Engine
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Configure default platform commission, category overrides, or negotiated vendor volume tiers.
              </p>
            </div>
            <button
              onClick={() => setShowAddCommModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
            >
              Add Commission Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {commissionSettings.map((rule) => (
              <div key={rule.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded font-semibold uppercase">
                    {rule.targetType} rule
                  </span>
                  <div className="flex items-baseline gap-1 font-mono font-bold text-2xl text-slate-900">
                    <span>{rule.ratePercent}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900">
                    {rule.targetType === "global"
                      ? "Global Default Platform Rate"
                      : rule.targetType === "category"
                      ? `Category: ${rule.category}`
                      : `Vendor: ${rule.vendorId}`}
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-1">{rule.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Effective: {rule.effectiveDate}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCommissionRate(rule.id, Math.max(1, rule.ratePercent - 0.5))}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer"
                    >
                      -0.5%
                    </button>
                    <button
                      onClick={() => updateCommissionRate(rule.id, rule.ratePercent + 0.5)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer"
                    >
                      +0.5%
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Vendor Settlements Ledger */}
      {activeTab === "settlements" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">
              Vendor Payout Reconciliation & Bank Disbursements
            </span>
            <span className="text-slate-500">
              Settlements calculated after gross sales minus platform brokerage and freight fees
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50/70 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Settlement ID</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Gross Sales</th>
                  <th className="px-4 py-3">Brokerage Fee</th>
                  <th className="px-4 py-3">Net Payable</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {s.id}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {s.periodStart} to {s.periodEnd}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{s.vendorName}</td>
                    <td className="px-4 py-3 font-mono">₹{s.grossSales.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 font-mono text-rose-700">
                      -₹{s.commissionDeducted.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-800">
                      ₹{s.netPayable.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          s.status === "processed"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.status !== "processed" ? (
                        <button
                          onClick={() => approveSettlement(s.id)}
                          className="px-3 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer"
                        >
                          Authorize Payout
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ref: {s.transactionRef}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Dispute Desk */}
      {activeTab === "disputes" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-base font-serif font-bold text-slate-900">
              Buyer Quality & Transit Discrepancy Desk
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Review proof photos, transit weight slips, and moisture meter reports to arbitrate settlements.
            </p>
          </div>

          <div className="space-y-3">
            {disputes.map((d) => (
              <div key={d.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm">{d.id}</span>
                    <span className="text-slate-400 ml-2">Order: {d.subOrderId}</span>
                    <div className="text-slate-600 mt-0.5">
                      Buyer: <strong>{d.retailerName}</strong> · Vendor: <strong>{d.vendorName}</strong>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
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

                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <div className="font-bold text-slate-800">Issue: {d.issueType.replace(/_/g, " ").toUpperCase()}</div>
                  <p className="text-slate-700">{d.description}</p>
                  <p className="text-slate-500 text-[11px] italic">Evidence: {d.evidenceNotes}</p>
                </div>

                {d.status === "open" || d.status === "investigating" ? (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-slate-500">Requested Resolution: <strong>{d.requestedResolution}</strong></span>
                    <button
                      onClick={() => setResolvingDispute(d)}
                      className="px-4 py-1.5 font-bold text-white bg-slate-900 hover:bg-amber-800 rounded-lg cursor-pointer"
                    >
                      Arbitrate & Resolve Case
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 text-slate-600 text-[11px]">
                    <span className="font-semibold text-slate-900">Resolution Decision: </span>
                    {d.adminResolutionNotes} (Resolved at: {d.resolvedAt})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Audit Logs */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-800">Platform Governance Audit Trail</span>
            <span className="text-slate-500">Immutable chronological events recorded across users and mediators</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex justify-between items-start gap-4 hover:bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded uppercase">
                      {log.role}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.details}</p>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logistics Assignment Modal */}
      {assigningSubOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleAssignLogisticsSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-xs border border-slate-200"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Assign Surface Freight: {assigningSubOrder.id}
              </h4>
              <button
                type="button"
                onClick={() => setAssigningSubOrder(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Logistics Carrier:</label>
              <select
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="Delhivery Surface Freight">Delhivery Surface Freight (Full Truckload / PTL)</option>
                <option value="VRL Logistics Heavy Parcel">VRL Logistics Heavy Commercial</option>
                <option value="Rivigo Surface Express">Rivigo Relay Express</option>
                <option value="Blue Dart Heavy Cargo">Blue Dart Mandi Logistics</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Consignment / Tracking AWB:</label>
              <input
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Estimated Delivery Date:</label>
              <input
                type="date"
                required
                value={estDeliveryDate}
                onChange={(e) => setEstDeliveryDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigningSubOrder(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
              >
                Dispatch & Notify Buyer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-xs border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Arbitrate Dispute {resolvingDispute.id}
              </h4>
              <button
                onClick={() => setResolvingDispute(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-slate-700 space-y-1">
              <div>Issue: <strong>{resolvingDispute.issueType}</strong></div>
              <p>{resolvingDispute.description}</p>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Mediator Ruling & Notes:</label>
              <textarea
                rows={3}
                placeholder="Details of transit insurance claim or vendor replacement agreement..."
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Approved Refund Amount (₹):</label>
              <input
                type="number"
                value={disputeRefundAmt}
                onChange={(e) => setDisputeRefundAmt(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleResolveDisputeSubmit("rejected")}
                className="px-3 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-semibold"
              >
                Reject Claim
              </button>
              <button
                onClick={() => handleResolveDisputeSubmit("partial_refund")}
                className="px-4 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
              >
                Approve Partial Refund
              </button>
              <button
                onClick={() => handleResolveDisputeSubmit("replacement")}
                className="px-4 py-2 font-bold text-white bg-slate-900 hover:bg-amber-800 rounded-lg cursor-pointer"
              >
                Dispatch Replacement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
