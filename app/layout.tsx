import { AppGuard } from "@/components/AppGuard";
import "./globals.css";
import { MobileShell } from "@/components/mobile-shell";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppGuard>
          <MobileShell>{children}</MobileShell>
        </AppGuard>
      </body>
    </html>
  );
}
