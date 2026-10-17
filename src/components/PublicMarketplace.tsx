import React, { useState } from "react";
import { useMarketplace } from "../context/MarketplaceContext.tsx";
import { ProductCard } from "./ProductCard.tsx";
import { SpiceProduct } from "../types.ts";
import {
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Truck,
  Building2,
  Scale,
  Award,
} from "lucide-react";

interface PublicMarketplaceProps {
  onSelectProduct: (product: SpiceProduct) => void;
  onOpenPrivateLabelModal: () => void;
}

export const PublicMarketplace: React.FC<PublicMarketplaceProps> = ({
  onSelectProduct,
  onOpenPrivateLabelModal,
}) => {
  const { products, vendors, setPortalView } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [privateLabelOnly, setPrivateLabelOnly] = useState(false);

  const categories = [
    "All",
    "Turmeric",
    "Cumin",
    "Red Chilli",
    "Coriander",
    "Black Pepper",
    "Garam Masala",
    "Whole Spices",
  ];

  const approvedProducts = products.filter((p) => p.status === "approved");

  const filteredProducts = approvedProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hindiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.originState.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;

    const matchesState =
      selectedState === "All" || p.originState === selectedState;

    const matchesVerified = !verifiedOnly || p.vendorVerified;
    const matchesPrivateLabel = !privateLabelOnly || p.privateLabelAvailable;

    return matchesSearch && matchesCategory && matchesState && matchesVerified && matchesPrivateLabel;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5EFE6] to-[#FAF7F2] py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-950/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-md border border-amber-300/50">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
              <span>India's Verified B2B Wholesale Spice Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-950 tracking-tight leading-[1.15] text-balance">
              From Local Spice Makers <br className="hidden sm:inline" />
              to Retail Shelves.
            </h1>

            <p className="text-base text-slate-700 leading-relaxed max-w-xl">
              Connect directly with verified spice millers and APMC processors in Unjha, Salem, Guntur, and Ramganj. Transparent tiered wholesale pricing, batch FSSAI purity compliance, and managed freight.
            </p>

            {/* Quick stats strip */}
            <div className="grid grid-cols-3 gap-4 pt-2 max-w-lg text-slate-800">
              <div className="border-l-2 border-amber-700 pl-3">
                <div className="text-xl font-bold font-mono text-slate-900">100%</div>
                <div className="text-xs text-slate-500">FSSAI Batch Tested</div>
              </div>
              <div className="border-l-2 border-amber-700 pl-3">
                <div className="text-xl font-bold font-mono text-slate-900">5 Mandis</div>
                <div className="text-xs text-slate-500">Direct Sourcing Hubs</div>
              </div>
              <div className="border-l-2 border-amber-700 pl-3">
                <div className="text-xl font-bold font-mono text-slate-900">Tiered</div>
                <div className="text-xs text-slate-500">Volume Discounts</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setPortalView("retailer")}
                className="px-5 py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2"
              >
                <span>Enter Buyer Portal (Kirana / Retail)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPortalView("vendor")}
                className="px-5 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Register as Spice Mill / Vendor
              </button>
            </div>
          </div>

          {/* Hero Visual Card / Mandi Hubs showcase */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-xl border border-amber-950/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Direct Mandi Origin Hubs
              </span>
              <span className="text-xs font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Live Trade Network
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  hub: "Unjha APMC Mandi, Gujarat",
                  spices: "Cumin (Jeera 99.5%), Fennel (Saunf), Dill Seeds",
                  rate: "Jeera from ₹265/kg",
                },
                {
                  hub: "Salem & Erode, Tamil Nadu",
                  spices: "Curcumin Rich Turmeric Fingers & Powder (Curcumin > 3.8%)",
                  rate: "Haldi from ₹172/kg",
                },
                {
                  hub: "Guntur Mirchi Yard, Andhra Pradesh",
                  spices: "Kashmiri Mild Red Chilli, Stemless Teja S17 Hot",
                  rate: "Mirch from ₹198/kg",
                },
                {
                  hub: "Ramganj Mandi, Rajasthan",
                  spices: "Eagle Quality Whole Coriander Seeds (Dhaniya)",
                  rate: "Dhaniya from ₹128/kg",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/50 transition-colors border border-slate-100"
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-slate-900">{item.hub}</span>
                    <span className="font-mono font-semibold text-amber-900">{item.rate}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">{item.spices}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={onOpenPrivateLabelModal}
                className="w-full py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg transition-colors border border-emerald-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Launch Your Private Label Spice Brand</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Explorer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Wholesale Spice Catalog
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">
              Verified Wholesale Listings & Tiered Rates
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Showing {filteredProducts.length} approved commercial spice listings
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spice, origin, or vendor..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-amber-700 focus:ring-amber-600"
              />
              <span>FSSAI Verified Only</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={privateLabelOnly}
                onChange={(e) => setPrivateLabelOnly(e.target.checked)}
                className="rounded text-amber-700 focus:ring-amber-600"
              />
              <span>Private-Label Ready</span>
            </label>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
            <Scale className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-700">
              No spices matching your criteria
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your category selection or search keywords.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setVerifiedOnly(false);
                setPrivateLabelOnly(false);
              }}
              className="px-4 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 rounded-md hover:bg-amber-100 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* Verified Vendors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-t border-slate-200 pt-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Certified Manufacturing Network
          </span>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Verified Mandi Millers & Processors
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Every vendor undergoes 14-digit FSSAI authentication and mandi yard verification before listing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{v.businessName}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {v.city}, {v.state}
                  </div>
                </div>
                {v.fssaiVerified ? (
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">
                    Review Pending
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Capacity:</span>
                  <span className="font-mono font-medium">
                    {v.monthlyCapacityKg.toLocaleString("en-IN")} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch SLA:</span>
                  <span>{v.dispatchLeadTimeDays} business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Orders Fulfilled:</span>
                  <span className="font-mono">{v.totalOrdersFulfilled}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 truncate">
                Speciality: {v.categoriesSupplied.join(", ")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Private Label Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-900/40 px-3 py-1 rounded-md border border-amber-600/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Private-Label Spice Manufacturing</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
              Launch Your Own Kirana Brand With Custom Packaging & Blends.
            </h3>
            <p className="text-sm text-amber-100/80 leading-relaxed">
              Submit your formulation requirements (Garam Masala, Kitchen King, Sambar, Kashmiri Chilli) and desired packaging. Verified millers compete to offer bulk quotes, lab testing, and pouch printing.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onOpenPrivateLabelModal}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Submit Private-Label Request (RFQ)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Fair & Transparent Marketplace
          </span>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            How MasalaSetu Works
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            A three-sided wholesale workflow designed for Indian spice commerce
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-lg font-bold font-mono">
              01
            </div>
            <h4 className="text-base font-bold text-slate-900">Vendors List With Lab Tests</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Local spice mills upload Agmark / FSSAI batch parameters, moisture percentages, and quantity-tiered pricing directly from the mandi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-lg font-bold font-mono">
              02
            </div>
            <h4 className="text-base font-bold text-slate-900">Retailers Place Split Orders</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kirana stores order multiple spices. Our engine splits the order by vendor while providing one unified invoice with 5% GST calculation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-lg font-bold font-mono">
              03
            </div>
            <h4 className="text-base font-bold text-slate-900">Platform Manages Fulfillment</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              MasalaSetu coordinates surface freight carriers, tracks live dispatch, holds funds in escrow, and settles vendor proceeds seamlessly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
