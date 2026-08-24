import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "What Mom Meant to Say", short_name: "Mom Meant",
    description: "A gentle, private reflection tool for dementia caregivers.",
    start_url: "/", scope: "/", display: "standalone", background_color: "#f4eee4", theme_color: "#17332c", orientation: "any",
    categories: ["health", "lifestyle", "medical"],
    icons: [
      { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Describe a moment", short_name: "New moment", url: "/", icons: [{ src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Care knowledge", short_name: "Knowledge", url: "/", icons: [{ src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" }] },
    ],
  };
}
