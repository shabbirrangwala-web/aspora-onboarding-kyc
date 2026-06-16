import type { Metadata, Viewport } from "next";
import "./globals.css";
import { KYCProvider } from "@/lib/kyc-store";

export const metadata: Metadata = {
  title: "Aspora — KYC Onboarding",
  description: "Aspora KYC onboarding and CIP scenario flows for Alpaca Broker API.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-primary text-on-surface-primary antialiased">
        <KYCProvider>{children}</KYCProvider>
      </body>
    </html>
  );
}
