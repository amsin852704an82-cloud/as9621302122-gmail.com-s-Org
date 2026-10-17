export type UserRole = "retailer" | "vendor" | "admin";

export type VerificationStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "suspended";

export type ProductStatus = "approved" | "pending_approval" | "rejected" | "delisted";

export type OrderStatus =
  | "placed"
  | "awaiting_vendor"
  | "confirmed"
  | "processing"
  | "ready_for_dispatch"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "completed"
  | "rejected"
  | "cancelled"
  | "disputed";

export type SettlementStatus = "unsettled" | "scheduled" | "settled" | "on_hold";

export type DisputeResolution =
  | "replacement"
  | "partial_refund"
  | "full_refund"
  | "vendor_credit"
  | "rejected";

export interface PriceTier {
  minKg: number;
  maxKg?: number; // undefined means "and above"
  pricePerKg: number;
}

export interface VendorProfile {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  businessType: "Manufacturer" | "Spice Mill & Processor" | "Wholesale Trader" | "Private-Label Producer";
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  fssaiNumber: string;
  fssaiDocName?: string;
  fssaiVerified: boolean;
  bankName: string;
  bankAccountMasked: string;
  ifscCode: string;
  categoriesSupplied: string[];
  monthlyCapacityKg: number;
  dispatchLeadTimeDays: number;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  rating: number;
  totalOrdersFulfilled: number;
  joinedDate: string;
}

export interface RetailerProfile {
  id: string;
  shopName: string;
  ownerName: string;
  businessType: "Kirana Store" | "Supermarket" | "Restaurant Chain" | "Hotel / Catering" | "Regional Distributor";
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  fssaiNumber?: string;
  favoriteVendorIds: string[];
}

export interface SpiceProduct {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCity: string;
  vendorState: string;
  vendorVerified: boolean;
  name: string;
  hindiName: string;
  category: "Turmeric" | "Red Chilli" | "Coriander" | "Cumin" | "Black Pepper" | "Garam Masala" | "Whole Spices" | "Blends";
  brandName: string;
  sku: string;
  description: string;
  aromaProfile: string;
  spiceForm: "Whole" | "Ground Powder" | "Crushed Flakes" | "Blend / Masala";
  originState: string;
  packagingTypes: string[];
  basePricePerKg: number;
  moqKg: number;
  availableStockKg: number;
  priceTiers: PriceTier[];
  packSizesAvailable: string[];
  leadTimeDays: number;
  shelfLifeMonths: number;
  storageInstruction: string;
  batchNo: string;
  moisturePercent: number;
  volatileOilMin?: string;
  returnEligible: boolean;
  privateLabelAvailable: boolean;
  status: ProductStatus;
  rejectionReason?: string;
  imageUrl?: string;
  fssaiCertified: boolean;
  createdAt: string;
}

export interface CartItem {
  product: SpiceProduct;
  quantityKg: number;
  appliedTierPrice: number;
  lineTotal: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  category: string;
  quantityKg: number;
  unitPrice: number;
  lineTotal: number;
  tierDescription: string;
  batchNo: string;
}

export interface OrderEvent {
  timestamp: string;
  title: string;
  note: string;
  actor: string;
}

export interface LogisticsDetails {
  carrierName?: string;
  trackingNumber?: string;
  pickupScheduledDate?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shippingCharges: number;
  pickupAddress: string;
  deliveryAddress: string;
  status: "pending_schedule" | "pickup_scheduled" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "failed";
}

export interface SubOrder {
  id: string;
  parentOrderId: string;
  retailerId: string;
  retailerName: string;
  retailerPhone: string;
  vendorId: string;
  vendorName: string;
  vendorState: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number; // 5% GST on spices
  shippingFee: number;
  totalPayable: number;
  commissionRatePercent: number;
  commissionAmount: number;
  vendorNetProceeds: number;
  status: OrderStatus;
  rejectionReason?: string;
  logistics: LogisticsDetails;
  settlementStatus: SettlementStatus;
  settlementId?: string;
  disputeId?: string;
  events: OrderEvent[];
  createdAt: string;
}

export interface MasterOrder {
  id: string;
  retailerId: string;
  retailerName: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pincode: string;
  subOrderIds: string[];
  totalGrossAmount: number;
  totalTaxAmount: number;
  totalShippingAmount: number;
  totalPayableAmount: number;
  paymentMode: "demo_upi" | "demo_netbanking" | "demo_neft_rtgs" | "credit_line_15d";
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  paymentReference: string;
  createdAt: string;
}

export interface CommissionSetting {
  id: string;
  targetType: "global" | "category" | "vendor";
  category?: string;
  vendorId?: string;
  ratePercent: number;
  effectiveDate: string;
  description: string;
}

export interface VendorSettlement {
  id: string;
  vendorId: string;
  vendorName: string;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  commissionDeducted: number;
  shippingDeducted: number;
  adjustments: number;
  netPayable: number;
  status: "pending_approval" | "approved" | "processed" | "on_hold";
  payoutDate?: string;
  transactionRef?: string;
  orderIds: string[];
  createdAt: string;
}

export interface PrivateLabelQuotation {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCity: string;
  quotedPricePerKg: number;
  moqOfferedKg: number;
  sampleLeadDays: number;
  productionLeadDays: number;
  packagingDetails: string;
  terms: string;
  sampleStatus: "pending" | "sample_sent" | "approved" | "revision_requested";
  status: "submitted" | "accepted" | "declined";
  submittedAt: string;
}

export interface PrivateLabelRFQ {
  id: string;
  retailerId: string;
  retailerName: string;
  retailerPhone: string;
  brandNameRequested: string;
  spiceCategory: string;
  targetMoqKg: number;
  targetPricePerKg?: number;
  packSizesRequested: string[];
  packagingPreference: string;
  customBlendNotes: string;
  artworkUploaded: boolean;
  requiredDeliveryDate: string;
  status: "submitted" | "under_admin_review" | "open_for_bids" | "quote_accepted" | "in_production" | "delivered" | "cancelled";
  selectedQuotationId?: string;
  quotations: PrivateLabelQuotation[];
  createdAt: string;
}

export interface OrderDispute {
  id: string;
  subOrderId: string;
  parentOrderId: string;
  retailerId: string;
  retailerName: string;
  vendorId: string;
  vendorName: string;
  issueType: "wrong_product" | "damaged_packaging" | "short_shipment" | "quality_moisture_concern" | "late_delivery" | "incorrect_invoice";
  description: string;
  evidenceNotes: string;
  requestedResolution: DisputeResolution;
  status: "open" | "investigating" | "approved" | "rejected";
  adminResolutionNotes?: string;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
}
