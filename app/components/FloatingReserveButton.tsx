"use client";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

export default function FloatingReserveButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#reservation"
      onClick={(e) => {
        e.preventDefault();
        const el = document.getElementById("reservation");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-xs tracking-[0.15em] uppercase font-sans font-medium transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-label="ご予約はこちら"
    >
      <Calendar size={14} strokeWidth={1.5} />
      ご予約
    </a>
  );
}
