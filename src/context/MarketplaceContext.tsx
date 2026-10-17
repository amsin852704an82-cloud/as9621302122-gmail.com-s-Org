import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserRole,
  VendorProfile,
  RetailerProfile,
  SpiceProduct,
  CartItem,
  MasterOrder,
  SubOrder,
  CommissionSetting,
  VendorSettlement,
  PrivateLabelRFQ,
  OrderDispute,
  AuditLogItem,
  OrderStatus,
  DisputeResolution,
} from "../types.ts";
import {
  initialVendors,
  initialRetailers,
  initialProducts,
  initialOrders,
  initialCommissionSettings,
  initialSettlements,
  initialPrivateLabelRFQs,
  initialDisputes,
  initialAuditLogs,
} from "../data/initialData.ts";

export type ActivePortalView = "public" | "retailer" | "vendor" | "admin";

interface MarketplaceContextType {
  // Navigation & Role
  portalView: ActivePortalView;
  setPortalView: (view: ActivePortalView) => void;
  activeRole: UserRole;
  currentVendorId: string;
  setCurrentVendorId: (id: string) => void;
  currentRetailerId: string;
  setCurrentRetailerId: (id: string) => void;

  // Data
  vendors: VendorProfile[];
  retailers: RetailerProfile[];
  products: SpiceProduct[];
  masterOrders: MasterOrder[];
  subOrders: SubOrder[];
  commissionSettings: CommissionSetting[];
  settlements: VendorSettlement[];
  privateLabelRFQs: PrivateLabelRFQ[];
  disputes: OrderDispute[];
  auditLogs: AuditLogItem[];

  // Cart
  cart: CartItem[];
  addToCart: (product: SpiceProduct, quantityKg: number) => { success: boolean; message: string };
  updateCartQuantity: (productId: string, quantityKg: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotalGross: number;
  cartTotalTax: number;
  cartTotalShipping: number;
  cartTotalPayable: number;
  cartByVendor: { [vendorId: string]: CartItem[] };

  // Actions
  checkoutCart: (params: {
    paymentMode: "demo_upi" | "demo_netbanking" | "demo_neft_rtgs" | "credit_line_15d";
    deliveryAddress: string;
    city: string;
    state: string;
    pincode: string;
  }) => { success: boolean; masterOrderId?: string; error?: string };

  // Vendor Actions
  registerVendor: (data: Partial<VendorProfile>) => void;
  updateVendorStatus: (vendorId: string, status: VendorProfile["verificationStatus"], reason?: string) => void;
  addProduct: (product: Omit<SpiceProduct, "id" | "createdAt" | "status">) => void;
  updateProduct: (productId: string, updates: Partial<SpiceProduct>) => void;
  updateSubOrderStatus: (subOrderId: string, newStatus: OrderStatus, note?: string, reason?: string) => void;

  // Admin Actions
  moderateProduct: (productId: string, status: "approved" | "rejected", reason?: string) => void;
  updateCommissionRate: (id: string, rate: number) => void;
  addCommissionRule: (rule: Omit<CommissionSetting, "id">) => void;
  assignLogistics: (
    subOrderId: string,
    details: { carrierName: string; trackingNumber: string; estimatedDeliveryDate: string }
  ) => void;
  approveSettlement: (settlementId: string) => void;
  resolveDispute: (disputeId: string, resolution: DisputeResolution, notes: string, refundAmount?: number) => void;

  // Private Label Actions
  createPrivateLabelRFQ: (rfq: Omit<PrivateLabelRFQ, "id" | "createdAt" | "status" | "quotations">) => void;
  submitPrivateLabelQuote: (rfqId: string, quote: {
    vendorId: string;
    vendorName: string;
    vendorCity: string;
    quotedPricePerKg: number;
    moqOfferedKg: number;
    sampleLeadDays: number;
    productionLeadDays: number;
    packagingDetails: string;
    terms: string;
  }) => void;
  acceptPrivateLabelQuote: (rfqId: string, quoteId: string) => void;

  // Disputes
  submitDispute: (params: {
    subOrderId: string;
    parentOrderId: string;
    issueType: OrderDispute["issueType"];
    description: string;
    evidenceNotes: string;
    requestedResolution: DisputeResolution;
  }) => void;

  // Helpers
  calculateApplicablePrice: (product: SpiceProduct, quantityKg: number) => number;
  getCommissionRateForVendor: (vendorId: string, category?: string) => number;
  currentVendor: VendorProfile | undefined;
  currentRetailer: RetailerProfile | undefined;
  resetToSampleData: () => void;
}

const STORAGE_PREFIX = "masalasetu_b2b_v1_";

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role states
  const [portalView, setPortalView] = useState<ActivePortalView>(() => {
    return (localStorage.getItem(STORAGE_PREFIX + "portal") as ActivePortalView) || "public";
  });

  const [currentVendorId, setCurrentVendorId] = useState<string>("v_unjha");
  const [currentRetailerId, setCurrentRetailerId] = useState<string>("r_sharma");

  // Core entities
  const [vendors, setVendors] = useState<VendorProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "vendors");
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [retailers, setRetailers] = useState<RetailerProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "retailers");
    return saved ? JSON.parse(saved) : initialRetailers;
  });

  const [products, setProducts] = useState<SpiceProduct[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "products");
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [masterOrders, setMasterOrders] = useState<MasterOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "masterOrders");
    return saved ? JSON.parse(saved) : initialOrders.masterOrders;
  });

  const [subOrders, setSubOrders] = useState<SubOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "subOrders");
    return saved ? JSON.parse(saved) : initialOrders.subOrders;
  });

  const [commissionSettings, setCommissionSettings] = useState<CommissionSetting[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "commission");
    return saved ? JSON.parse(saved) : initialCommissionSettings;
  });

  const [settlements, setSettlements] = useState<VendorSettlement[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "settlements");
    return saved ? JSON.parse(saved) : initialSettlements;
  });

  const [privateLabelRFQs, setPrivateLabelRFQs] = useState<PrivateLabelRFQ[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "rfqs");
    return saved ? JSON.parse(saved) : initialPrivateLabelRFQs;
  });

  const [disputes, setDisputes] = useState<OrderDispute[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "disputes");
    return saved ? JSON.parse(saved) : initialDisputes;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "logs");
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "portal", portalView);
  }, [portalView]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "vendors", JSON.stringify(vendors));
  }, [vendors]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "products", JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "masterOrders", JSON.stringify(masterOrders));
  }, [masterOrders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "subOrders", JSON.stringify(subOrders));
  }, [subOrders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "commission", JSON.stringify(commissionSettings));
  }, [commissionSettings]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "settlements", JSON.stringify(settlements));
  }, [settlements]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "rfqs", JSON.stringify(privateLabelRFQs));
  }, [privateLabelRFQs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "disputes", JSON.stringify(disputes));
  }, [disputes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "logs", JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "cart", JSON.stringify(cart));
  }, [cart]);

  const addAuditLog = (action: string, details: string, role: UserRole = "admin") => {
    const newLog: AuditLogItem = {
      id: "LOG-" + Date.now(),
      timestamp: new Date().toISOString(),
      actor: role === "admin" ? "Platform Mediator" : role === "vendor" ? "Vendor Portal" : "Retailer Buyer",
      role,
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Pricing & Commission Helpers
  const calculateApplicablePrice = (product: SpiceProduct, quantityKg: number): number => {
    if (!product.priceTiers || product.priceTiers.length === 0) {
      return product.basePricePerKg;
    }
    // Sort tiers descending by minKg
    const sortedTiers = [...product.priceTiers].sort((a, b) => b.minKg - a.minKg);
    for (const tier of sortedTiers) {
      if (quantityKg >= tier.minKg) {
        if (tier.maxKg === undefined || quantityKg <= tier.maxKg) {
          return tier.pricePerKg;
        }
      }
    }
    return product.basePricePerKg;
  };

  const getCommissionRateForVendor = (vendorId: string, category?: string): number => {
    // Priority: Vendor specific -> Category specific -> Global default
    const vendorRule = commissionSettings.find((r) => r.targetType === "vendor" && r.vendorId === vendorId);
    if (vendorRule) return vendorRule.ratePercent;

    if (category) {
      const catRule = commissionSettings.find((r) => r.targetType === "category" && r.category === category);
      if (catRule) return catRule.ratePercent;
    }

    const globalRule = commissionSettings.find((r) => r.targetType === "global");
    return globalRule ? globalRule.ratePercent : 5.0;
  };

  // Cart operations
  const addToCart = (product: SpiceProduct, quantityKg: number) => {
    if (quantityKg < product.moqKg) {
      return {
        success: false,
        message: `Quantity (${quantityKg} kg) is below Minimum Order Quantity (${product.moqKg} kg).`,
      };
    }
    if (quantityKg > product.availableStockKg) {
      return {
        success: false,
        message: `Available stock is only ${product.availableStockKg} kg.`,
      };
    }

    const appliedTierPrice = calculateApplicablePrice(product, quantityKg);
    const lineTotal = appliedTierPrice * quantityKg;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantityKg + quantityKg;
        const newPrice = calculateApplicablePrice(product, newQty);
        updated[existingIndex] = {
          product,
          quantityKg: newQty,
          appliedTierPrice: newPrice,
          lineTotal: newPrice * newQty,
        };
        return updated;
      } else {
        return [...prev, { product, quantityKg, appliedTierPrice, lineTotal }];
      }
    });

    return {
      success: true,
      message: `Added ${quantityKg} kg of ${product.name} to wholesale cart.`,
    };
  };

  const updateCartQuantity = (productId: string, quantityKg: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            if (quantityKg <= 0) return null;
            const appliedTierPrice = calculateApplicablePrice(item.product, quantityKg);
            return {
              ...item,
              quantityKg,
              appliedTierPrice,
              lineTotal: appliedTierPrice * quantityKg,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Group cart items by vendor
  const cartByVendor: { [vendorId: string]: CartItem[] } = {};
  cart.forEach((item) => {
    const vId = item.product.vendorId;
    if (!cartByVendor[vId]) cartByVendor[vId] = [];
    cartByVendor[vId].push(item);
  });

  const cartTotalGross = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const cartTotalTax = Math.round(cartTotalGross * 0.05); // 5% GST on spices
  // Standard freight base: ₹400 per vendor shipment
  const numberOfVendors = Object.keys(cartByVendor).length;
  const cartTotalShipping = numberOfVendors > 0 ? numberOfVendors * 450 : 0;
  const cartTotalPayable = cartTotalGross + cartTotalTax + cartTotalShipping;

  // Checkout: Split Cart into Vendor Sub-Orders
  const checkoutCart = (params: {
    paymentMode: "demo_upi" | "demo_netbanking" | "demo_neft_rtgs" | "credit_line_15d";
    deliveryAddress: string;
    city: string;
    state: string;
    pincode: string;
  }) => {
    if (cart.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    const currentRetailer = retailers.find((r) => r.id === currentRetailerId) || retailers[0];
    const timestamp = new Date().toISOString();
    const parentOrderId = "ORD-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const createdSubOrders: SubOrder[] = [];
    const subOrderIds: string[] = [];

    let vendorIndex = 0;
    const vendorLetterCodes = ["A", "B", "C", "D", "E", "F"];

    for (const vendorId in cartByVendor) {
      const items = cartByVendor[vendorId];
      const vendor = vendors.find((v) => v.id === vendorId);
      const subOrderId = `SUB-${parentOrderId.replace("ORD-", "")}-${vendorLetterCodes[vendorIndex] || vendorIndex}`;
      vendorIndex++;

      const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
      const taxAmount = Math.round(subtotal * 0.05);
      const shippingFee = 450;
      const totalPayable = subtotal + taxAmount + shippingFee;

      const commRate = getCommissionRateForVendor(vendorId, items[0]?.product.category);
      const commissionAmount = Math.round((subtotal * commRate) / 100);
      const vendorNetProceeds = subtotal - commissionAmount;

      const orderItems = items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        category: i.product.category,
        quantityKg: i.quantityKg,
        unitPrice: i.appliedTierPrice,
        lineTotal: i.lineTotal,
        tierDescription: `${i.quantityKg} kg tier (@ ₹${i.appliedTierPrice}/kg)`,
        batchNo: i.product.batchNo || "BATCH-" + Math.floor(100 + Math.random() * 900),
      }));

      const newSubOrder: SubOrder = {
        id: subOrderId,
        parentOrderId,
        retailerId: currentRetailer.id,
        retailerName: currentRetailer.shopName,
        retailerPhone: currentRetailer.phone,
        vendorId,
        vendorName: vendor ? vendor.businessName : "Spice Vendor",
        vendorState: vendor ? vendor.state : "India",
        items: orderItems,
        subtotal,
        taxAmount,
        shippingFee,
        totalPayable,
        commissionRatePercent: commRate,
        commissionAmount,
        vendorNetProceeds,
        status: "placed",
        logistics: {
          pickupAddress: vendor ? `${vendor.address}, ${vendor.city}, ${vendor.state}` : "Warehouse Yard",
          deliveryAddress: `${params.deliveryAddress}, ${params.city}, ${params.state} - ${params.pincode}`,
          shippingCharges: shippingFee,
          status: "pending_schedule",
        },
        settlementStatus: "unsettled",
        events: [
          {
            timestamp,
            title: "Order Placed",
            note: `Bulk order placed by ${currentRetailer.shopName}. Routed to vendor for confirmation.`,
            actor: currentRetailer.shopName,
          },
        ],
        createdAt: timestamp,
      };

      createdSubOrders.push(newSubOrder);
      subOrderIds.push(subOrderId);

      // Decrement stock in products
      setProducts((prev) =>
        prev.map((prod) => {
          const item = items.find((i) => i.product.id === prod.id);
          if (item) {
            const newStock = Math.max(0, prod.availableStockKg - item.quantityKg);
            return { ...prod, availableStockKg: newStock };
          }
          return prod;
        })
      );
    }

    const masterOrder: MasterOrder = {
      id: parentOrderId,
      retailerId: currentRetailer.id,
      retailerName: currentRetailer.shopName,
      deliveryAddress: params.deliveryAddress,
      city: params.city,
      state: params.state,
      pincode: params.pincode,
      subOrderIds,
      totalGrossAmount: cartTotalGross,
      totalTaxAmount: cartTotalTax,
      totalShippingAmount: cartTotalShipping,
      totalPayableAmount: cartTotalPayable,
      paymentMode: params.paymentMode,
      paymentStatus: "paid",
      paymentReference: "DEMO-PAY-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      createdAt: timestamp,
    };

    setMasterOrders((prev) => [masterOrder, ...prev]);
    setSubOrders((prev) => [...createdSubOrders, ...prev]);
    clearCart();

    addAuditLog(
      "Bulk Order Created",
      `Order ${parentOrderId} placed with ${subOrderIds.length} vendor sub-orders totalling ₹${cartTotalPayable.toLocaleString(
        "en-IN"
      )}.`,
      "retailer"
    );

    return { success: true, masterOrderId: parentOrderId };
  };

  // Vendor & Product Actions
  const registerVendor = (data: Partial<VendorProfile>) => {
    const id = "v_" + Math.random().toString(36).substring(2, 7);
    const newVendor: VendorProfile = {
      id,
      businessName: data.businessName || "New Spice Mill",
      ownerName: data.ownerName || "Business Owner",
      phone: data.phone || "",
      email: data.email || "",
      businessType: data.businessType || "Manufacturer",
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || "",
      gstin: data.gstin || "",
      fssaiNumber: data.fssaiNumber || "",
      fssaiVerified: false,
      bankName: data.bankName || "",
      bankAccountMasked: data.bankAccountMasked || "•••• •••• " + Math.floor(1000 + Math.random() * 9000),
      ifscCode: data.ifscCode || "",
      categoriesSupplied: data.categoriesSupplied || ["Whole Spices"],
      monthlyCapacityKg: data.monthlyCapacityKg || 20000,
      dispatchLeadTimeDays: data.dispatchLeadTimeDays || 3,
      verificationStatus: "submitted",
      rating: 5.0,
      totalOrdersFulfilled: 0,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setVendors((prev) => [newVendor, ...prev]);
    setCurrentVendorId(id);
    addAuditLog("Vendor Registration Submitted", `Vendor ${newVendor.businessName} applied for verification.`, "vendor");
  };

  const updateVendorStatus = (
    vendorId: string,
    status: VendorProfile["verificationStatus"],
    reason?: string
  ) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const fssaiVerified = status === "approved" ? true : v.fssaiVerified;
          return { ...v, verificationStatus: status, fssaiVerified, rejectionReason: reason };
        }
        return v;
      })
    );
    addAuditLog(
      `Vendor Status Changed: ${status}`,
      `Vendor ${vendorId} status changed to ${status}${reason ? `. Reason: ${reason}` : ""}`,
      "admin"
    );
  };

  const addProduct = (prodData: Omit<SpiceProduct, "id" | "createdAt" | "status">) => {
    const id = "p_" + Math.random().toString(36).substring(2, 8);
    const newProduct: SpiceProduct = {
      ...prodData,
      id,
      status: "pending_approval",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    addAuditLog("Product Submitted", `Product ${newProduct.name} submitted for admin moderation.`, "vendor");
  };

  const updateProduct = (productId: string, updates: Partial<SpiceProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
  };

  const moderateProduct = (productId: string, status: "approved" | "rejected", reason?: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status, rejectionReason: reason } : p))
    );
    addAuditLog(
      `Product Moderation: ${status}`,
      `Product ${productId} marked ${status}${reason ? `. Note: ${reason}` : ""}`,
      "admin"
    );
  };

  const updateSubOrderStatus = (
    subOrderId: string,
    newStatus: OrderStatus,
    note?: string,
    reason?: string
  ) => {
    const timestamp = new Date().toISOString();
    setSubOrders((prev) =>
      prev.map((order) => {
        if (order.id === subOrderId) {
          const events = [
            ...order.events,
            {
              timestamp,
              title: `Status updated to ${newStatus.replace(/_/g, " ").toUpperCase()}`,
              note: note || reason || `Order status transitioned to ${newStatus}`,
              actor: "Order Manager",
            },
          ];
          return { ...order, status: newStatus, rejectionReason: reason, events };
        }
        return order;
      })
    );
    addAuditLog(`Order ${subOrderId} Status`, `Updated to ${newStatus}`, "vendor");
  };

  const assignLogistics = (
    subOrderId: string,
    details: { carrierName: string; trackingNumber: string; estimatedDeliveryDate: string }
  ) => {
    const timestamp = new Date().toISOString();
    setSubOrders((prev) =>
      prev.map((order) => {
        if (order.id === subOrderId) {
          return {
            ...order,
            status: "dispatched",
            logistics: {
              ...order.logistics,
              carrierName: details.carrierName,
              trackingNumber: details.trackingNumber,
              estimatedDeliveryDate: details.estimatedDeliveryDate,
              dispatchDate: timestamp.split("T")[0],
              status: "picked_up",
            },
            events: [
              ...order.events,
              {
                timestamp,
                title: "Logistics Assigned & Dispatched",
                note: `Carrier: ${details.carrierName}, Tracking: ${details.trackingNumber}`,
                actor: "Platform Logistics Desk",
              },
            ],
          };
        }
        return order;
      })
    );
    addAuditLog("Logistics Dispatched", `Shipment for ${subOrderId} booked on ${details.carrierName}`, "admin");
  };

  const updateCommissionRate = (id: string, rate: number) => {
    setCommissionSettings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ratePercent: rate } : item))
    );
  };

  const addCommissionRule = (rule: Omit<CommissionSetting, "id">) => {
    const newRule: CommissionSetting = {
      ...rule,
      id: "comm_" + Math.random().toString(36).substring(2, 7),
    };
    setCommissionSettings((prev) => [...prev, newRule]);
  };

  const approveSettlement = (settlementId: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === settlementId
          ? {
              ...s,
              status: "processed",
              payoutDate: new Date().toISOString().split("T")[0],
              transactionRef: "NEFT-DISB-" + Math.floor(100000 + Math.random() * 900000),
            }
          : s
      )
    );
    addAuditLog("Settlement Disbursed", `Settlement ${settlementId} approved and disbursed.`, "admin");
  };

  const resolveDispute = (
    disputeId: string,
    resolution: DisputeResolution,
    notes: string,
    refundAmount?: number
  ) => {
    const timestamp = new Date().toISOString();
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: resolution === "rejected" ? "rejected" : "approved",
              requestedResolution: resolution,
              adminResolutionNotes: notes,
              refundAmount,
              resolvedAt: timestamp,
            }
          : d
      )
    );
    addAuditLog("Dispute Resolved", `Dispute ${disputeId} closed with resolution: ${resolution}`, "admin");
  };

  const createPrivateLabelRFQ = (
    rfqData: Omit<PrivateLabelRFQ, "id" | "createdAt" | "status" | "quotations">
  ) => {
    const id = "RFQ-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
    const newRfq: PrivateLabelRFQ = {
      ...rfqData,
      id,
      status: "open_for_bids",
      quotations: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setPrivateLabelRFQs((prev) => [newRfq, ...prev]);
    addAuditLog("Private Label RFQ Submitted", `RFQ ${id} for brand '${rfqData.brandNameRequested}' opened for vendor quotations.`, "retailer");
  };

  const submitPrivateLabelQuote = (
    rfqId: string,
    quote: {
      vendorId: string;
      vendorName: string;
      vendorCity: string;
      quotedPricePerKg: number;
      moqOfferedKg: number;
      sampleLeadDays: number;
      productionLeadDays: number;
      packagingDetails: string;
      terms: string;
    }
  ) => {
    const quoteId = "QUO-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    setPrivateLabelRFQs((prev) =>
      prev.map((rfq) => {
        if (rfq.id === rfqId) {
          const newQuotations = [
            ...rfq.quotations,
            {
              id: quoteId,
              ...quote,
              sampleStatus: "pending" as const,
              status: "submitted" as const,
              submittedAt: new Date().toISOString().split("T")[0],
            },
          ];
          return { ...rfq, quotations: newQuotations };
        }
        return rfq;
      })
    );
    addAuditLog("Private Label Quote Submitted", `Vendor ${quote.vendorName} quoted ₹${quote.quotedPricePerKg}/kg on RFQ ${rfqId}`, "vendor");
  };

  const acceptPrivateLabelQuote = (rfqId: string, quoteId: string) => {
    setPrivateLabelRFQs((prev) =>
      prev.map((rfq) => {
        if (rfq.id === rfqId) {
          const updatedQuotes = rfq.quotations.map((q) =>
            q.id === quoteId ? { ...q, status: "accepted" as const } : { ...q, status: "declined" as const }
          );
          return {
            ...rfq,
            status: "quote_accepted",
            selectedQuotationId: quoteId,
            quotations: updatedQuotes,
          };
        }
        return rfq;
      })
    );
    addAuditLog("Private Label Quote Accepted", `Retailer accepted quotation ${quoteId} on RFQ ${rfqId}`, "retailer");
  };

  const submitDispute = (params: {
    subOrderId: string;
    parentOrderId: string;
    issueType: OrderDispute["issueType"];
    description: string;
    evidenceNotes: string;
    requestedResolution: DisputeResolution;
  }) => {
    const sub = subOrders.find((s) => s.id === params.subOrderId);
    const disputeId = "DSP-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
    const newDispute: OrderDispute = {
      id: disputeId,
      subOrderId: params.subOrderId,
      parentOrderId: params.parentOrderId,
      retailerId: sub?.retailerId || currentRetailerId,
      retailerName: sub?.retailerName || "Retailer",
      vendorId: sub?.vendorId || "",
      vendorName: sub?.vendorName || "Vendor",
      issueType: params.issueType,
      description: params.description,
      evidenceNotes: params.evidenceNotes,
      requestedResolution: params.requestedResolution,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setDisputes((prev) => [newDispute, ...prev]);
    // update order status
    updateSubOrderStatus(params.subOrderId, "disputed", `Dispute opened: ${params.issueType}`);
    addAuditLog("Order Dispute Opened", `Dispute ${disputeId} logged against order ${params.subOrderId}`, "retailer");
  };

  const resetToSampleData = () => {
    localStorage.clear();
    setVendors(initialVendors);
    setRetailers(initialRetailers);
    setProducts(initialProducts);
    setMasterOrders(initialOrders.masterOrders);
    setSubOrders(initialOrders.subOrders);
    setCommissionSettings(initialCommissionSettings);
    setSettlements(initialSettlements);
    setPrivateLabelRFQs(initialPrivateLabelRFQs);
    setDisputes(initialDisputes);
    setAuditLogs(initialAuditLogs);
    setCart([]);
  };

  const activeRole: UserRole =
    portalView === "vendor" ? "vendor" : portalView === "admin" ? "admin" : "retailer";

  const currentVendor = vendors.find((v) => v.id === currentVendorId);
  const currentRetailer = retailers.find((r) => r.id === currentRetailerId);

  return (
    <MarketplaceContext.Provider
      value={{
        portalView,
        setPortalView,
        activeRole,
        currentVendorId,
        setCurrentVendorId,
        currentRetailerId,
        setCurrentRetailerId,
        vendors,
        retailers,
        products,
        masterOrders,
        subOrders,
        commissionSettings,
        settlements,
        privateLabelRFQs,
        disputes,
        auditLogs,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotalGross,
        cartTotalTax,
        cartTotalShipping,
        cartTotalPayable,
        cartByVendor,
        checkoutCart,
        registerVendor,
        updateVendorStatus,
        addProduct,
        updateProduct,
        updateSubOrderStatus,
        moderateProduct,
        updateCommissionRate,
        addCommissionRule,
        assignLogistics,
        approveSettlement,
        resolveDispute,
        createPrivateLabelRFQ,
        submitPrivateLabelQuote,
        acceptPrivateLabelQuote,
        submitDispute,
        calculateApplicablePrice,
        getCommissionRateForVendor,
        currentVendor,
        currentRetailer,
        resetToSampleData,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
};
