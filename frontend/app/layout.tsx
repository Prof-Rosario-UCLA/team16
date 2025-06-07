import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";
import CookieBanner from "@/components/CookieBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const APP_NAME = "doodly";
const APP_DEFAULT_TITLE = "doodly";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "A fun drawing game to play with friends!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  }
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
}>) {
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
