"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

interface PayPalProviderProps {
  children: ReactNode;
}

export default function PayPalProvider({ children }: PayPalProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Check if PayPal Client ID is configured
  if (!clientId || clientId === "your_paypal_client_id_here") {
    console.error("❌ PayPal Client ID not configured properly");
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">⚠️ PayPal chưa được cấu hình</p>
        <p className="text-red-600 text-sm mt-1">
          Vui lòng cấu hình NEXT_PUBLIC_PAYPAL_CLIENT_ID trong .env.local
        </p>
      </div>
    );
  }

  const initialOptions = {
    clientId,
    currency: "VND",
    intent: "capture",
    components: "buttons,funding-eligibility",
    "enable-funding": "venmo,paylater",
    "disable-funding": "card", // Disable credit card if you only want PayPal
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
