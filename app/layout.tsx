import type { Metadata } from "next";
import "./globals.css";
import { PwaRegister } from "../src/components/pwa-register";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "What Mom Meant to Say",
    template: "%s · What Mom Meant to Say",
  },
  description:
    "A source-informed, fictional demo for finding gentler responses to difficult dementia-care moments.",
  applicationName: "What Mom Meant to Say",
  appleWebApp: {
    capable: true,
    title: "What Mom Meant to Say",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    title: "What Mom Meant to Say",
    description:
      "Hear the feeling beneath the words, then find a gentler way to respond.",
    images: [
      {
        url: "/social-card.png",
        width: 1536,
        height: 1024,
        alt: "Two speech ribbons form a heart above a gentle path.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Mom Meant to Say",
    description:
      "Hear the feeling beneath the words, then find a gentler way to respond.",
    images: ["/social-card.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#17332c" />
      </head>
      <body><PwaRegister />{children}</body>
    </html>
  );
}


