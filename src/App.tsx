/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MarketplaceProvider, useMarketplace } from "./context/MarketplaceContext.tsx";
import { Header } from "./components/Header.tsx";
import { Footer } from "./components/Footer.tsx";
import { PublicMarketplace } from "./components/PublicMarketplace.tsx";
import { RetailerPortal } from "./components/RetailerPortal.tsx";
import { VendorPortal } from "./components/VendorPortal.tsx";
import { AdminPortal } from "./components/AdminPortal.tsx";
import { ProductDetailModal } from "./components/ProductDetailModal.tsx";
import { CartDrawer } from "./components/CartDrawer.tsx";
import { GeminiAssistantModal } from "./components/GeminiAssistantModal.tsx";
import { SpiceProduct } from "./types.ts";

const AppContent: React.FC = () => {
  const { portalView, setPortalView } = useMarketplace();

  const [selectedProduct, setSelectedProduct] = useState<SpiceProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-slate-800">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1">
        {portalView === "public" && (
          <PublicMarketplace
            onSelectProduct={(product) => setSelectedProduct(product)}
            onOpenPrivateLabelModal={() => {
              setPortalView("retailer");
            }}
          />
        )}

        {portalView === "retailer" && (
          <RetailerPortal
            onSelectProduct={(product) => setSelectedProduct(product)}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {portalView === "vendor" && <VendorPortal />}

        {portalView === "admin" && <AdminPortal />}
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenPrivateLabel={() => setPortalView("retailer")}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderCompleted={(_orderId) => {
          setPortalView("retailer");
        }}
      />

      <GeminiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <AppContent />
    </MarketplaceProvider>
  );
}
