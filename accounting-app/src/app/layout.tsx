"use client";

import { vazirmatn } from "@/lib/fonts";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" style={{ overflow: 'hidden' }}>
      <body
        className={`${vazirmatn.variable} font-sans antialiased`}
      >
        <ToastProvider>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we're on the login page
  const isLoginPage = pathname === '/login';
  
  if (isLoginPage) {
    return children;
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
      <Sidebar />
    </div>
  );
}
