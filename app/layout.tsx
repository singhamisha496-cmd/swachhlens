import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "SwachhLens",
  description: "Smart Waste Reporting System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col bg-[#F4F6F8]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}