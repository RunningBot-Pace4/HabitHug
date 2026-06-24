import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HabitHug",
  description: "Cute visual habit tracker with battle rooms."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
