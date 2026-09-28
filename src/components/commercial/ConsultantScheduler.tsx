"use client";

import { useEffect, useRef } from "react";

type Props = {
  embedOrigin: string;
  calLink: string;
  onBooked: (uid: string) => void;
};

export function ConsultantScheduler({ embedOrigin, calLink, onBooked }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const origin = embedOrigin.replace(/\/$/, "");
    const namespace = "imersao";
    function boot() {
      const cal = (window as unknown as { Cal?: { (...args: unknown[]): void; ns?: Record<string, (...args: unknown[]) => void>; loaded?: boolean; q?: unknown[] } }).Cal;
      if (!cal) return;
      cal("init", namespace, { origin });
      const namespaced = cal.ns?.[namespace] || cal;
      namespaced("inline", {
        elementOrSelector: host.current,
        calLink,
        config: { theme: "dark", layout: "month_view" },
      });
      namespaced("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        cssVarsPerTheme: {
          dark: {
            "cal-brand": "#d71920",
            "cal-brand-emphasis": "#b8141b",
            "cal-bg": "#000000",
            "cal-bg-emphasis": "#0c0c0c",
            "cal-text": "#ffffff",
          },
        },
      });
      namespaced("on", {
        action: "bookingSuccessful",
        callback: (event: { detail?: { data?: { uid?: string; bookingUid?: string } } }) => {
          const uid = event.detail?.data?.uid || event.detail?.data?.bookingUid;
          if (uid) onBooked(uid);
        },
      });
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-cal-embed]");
    if (existing) {
      boot();
      return;
    }
    const script = document.createElement("script");
    script.src = `${origin}/embed/embed.js`;
    script.async = true;
    script.dataset.calEmbed = "true";
    script.onload = boot;
    document.body.appendChild(script);
  }, [calLink, embedOrigin, onBooked]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
      <div ref={host} className="min-h-[640px] w-full" />
    </div>
  );
}
