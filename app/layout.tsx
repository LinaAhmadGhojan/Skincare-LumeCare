import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import Shell from "@/components/Shell";
import "./globals.css";

const display = Plus_Jakarta_Sans({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "LumeCare – Concept demo by AtlasDev",
  description: "A concept store and back office for LumeCare, built by AtlasDev. Sample data.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
