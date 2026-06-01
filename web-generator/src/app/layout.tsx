// file: web-generator/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Premium Web to APK Builder",
  description:
    "Ubah website apa pun menjadi aplikasi Android native tanpa menulis kode. Dirancang untuk developer dan kreator.",
  openGraph: {
    title: "Premium Web to APK Builder",
    description:
      "Konversi situs web menjadi APK Android dalam hitungan menit, aman dan elegan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
