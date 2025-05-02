import type { Metadata } from "next";
import { vazirmatn } from "@/lib/fonts";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "سیستم حسابداری کسب و کار کوچک",
  description: "اپلیکیشن حسابداری برای کسب و کارهای کوچک",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa">
      <body
        className={`${vazirmatn.variable} font-sans antialiased`}
      >
        <div className="flex h-screen bg-background">
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
          <Sidebar />
        </div>
      </body>
    </html>
  );
}
