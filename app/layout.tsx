import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Билльярдын оноо",
  description: "Ганцаарчилсан болон багийн билльярдын оноо хөтлөх",
};

export const viewport: Viewport = { themeColor: "#0f6b3c" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
