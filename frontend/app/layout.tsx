import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";
import CookieBanner from "@/components/CookieBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Doodly",
  description: "A casual drawing game",
  manifest: "/manifest.json",
};

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-press-start-2p",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 
{
  return (
    <html lang="en">
      <body className={`${pressStart2P.variable} antialiased`}>
        <ServiceWorkerRegistration />
        <UserProvider>
          <ClientNavbarWrapper />
          {children}
        </UserProvider>
        <footer>
          <CookieBanner />
        </footer>
      </body>
    </html>
  );
}
