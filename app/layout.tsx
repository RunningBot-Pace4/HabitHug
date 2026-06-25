import type { Metadata } from "next";
import "./globals.css";
import { GlobalLoadingProvider } from "@/components/GlobalLoadingProvider";

export const metadata: Metadata = {
  title: "HabitHug",
  description: "Cute visual habit tracker with battle rooms."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><GlobalLoadingProvider />{children}</body>
    </html>
  );
}
