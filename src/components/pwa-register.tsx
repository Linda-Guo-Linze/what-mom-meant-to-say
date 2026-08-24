"use client";

import { useCallback, useEffect, useState } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
declare global { interface Window { __wmInstallPrompt?: InstallPrompt } }

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js");
    }
    const capture = (event: Event) => {
      event.preventDefault();
      window.__wmInstallPrompt = event as InstallPrompt;
      window.dispatchEvent(new Event("wm-pwa-installable"));
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);
  return null;
}

export function usePwaInstall() {
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const update = () => {
      setInstallable(Boolean(window.__wmInstallPrompt));
      setInstalled(window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    };
    update();
    window.addEventListener("wm-pwa-installable", update);
    window.addEventListener("appinstalled", update);
    return () => { window.removeEventListener("wm-pwa-installable", update); window.removeEventListener("appinstalled", update); };
  }, []);
  const install = useCallback(async () => {
    const prompt = window.__wmInstallPrompt;
    if (!prompt) return false;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      window.__wmInstallPrompt = undefined;
      setInstallable(false);
      setInstalled(true);
      return true;
    }
    return false;
  }, []);
  return { installable, installed, install };
}
