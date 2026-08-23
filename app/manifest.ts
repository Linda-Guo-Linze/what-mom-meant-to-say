import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "What Mom Meant to Say", short_name: "Mom Meant",
    description: "A gentle, private reflection tool for dementia caregivers.",
    start_url: "/", scope: "/", display: "standalone", background_color: "#f4eee4", theme_color: "#17332c", orientation: "any",
    categories: ["health", "lifestyle", "medical"],
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    shortcuts: [
      { name: "Describe a moment", short_name: "New moment", url: "/", icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] },
      { name: "Care knowledge", short_name: "Knowledge", url: "/", icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] },
    ],
  };
}
