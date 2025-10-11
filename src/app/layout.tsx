import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "47 Industries - 3D Printing, Web & App Development",
  description: "Leading provider of 3D printing services, custom manufacturing, and innovative web and app development solutions. Parent company to MotoRev.",
  keywords: ["3D printing", "custom manufacturing", "web development", "app development", "AI solutions"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {!isAdminRoute && <Navbar />}
        <main className={!isAdminRoute ? "pt-16" : ""}>
          {children}
        </main>
        {!isAdminRoute && <Footer />}
      </body>
    </html>
  );
}
