"use client";

import { useState, useEffect, useRef } from "react";
import RankingCarousel from "./components/RankingCarousel";
import StaffSection from "./components/StaffSection";
import {
  useStaff,
  useRankingCourses,
  useSiteSettings,
  useAbout,
  useMenuCategoriesCMS,
  useAccess,
} from "./hooks/useMicroCMS";
import gsap from "gsap";

// ── Instagram ギャラリー用ダミー画像（Graph API 取得後に差し替え） ──
const DUMMY_GALLERY_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1599351507-9efdc63de3b5?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&h=600&fit=crop",
];

// About テキストを段落・行に分解して JSX 化
function renderAboutContent(content: string) {
  const paragraphs = content.split("\n\n").filter(p => p.trim());
  return paragraphs.map((para, i) => {
    const lines = para.split("\n").filter(l => l.trim());
    return (
      <p key={i} style={{ color: "#c8c8c8", fontSize: "0.95rem", lineHeight: "1.9", margin: 0 }}>
        {lines.map((line, j) => (
          <span key={j} data-about-line style={{ display: "block" }}>{line}</span>
        ))}
      </p>
    );
  });
}

export default function Page() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryImages] = useState<string[]>(DUMMY_GALLERY_IMAGES);

  // ── MicroCMS フック ────────────────────────────────────────
  const { settings } = useSiteSettings();
  const { about } = useAbout();
  const { menuCats } = useMenuCategoriesCMS();
  const { courses } = useRankingCourses();
  const { staff } = useStaff();
  const { access } = useAccess();

  // Refs for GSAP animations
  const heroFullOverlayRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const heroLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonRef = useRef<HTMLAnchorElement>(null);
  const scrollIconRef = useRef<HTMLAnchorElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const logoLettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuNavItemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const menuReserveBtnRef = useRef<HTMLAnchorElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const isMenuMounted = useRef(false);
  const aboutLineRef = useRef<HTMLDivElement>(null);
  const aboutTextRef = useRef<HTMLDivElement>(null);
  const galleryItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const galleryGridRef = useRef<HTMLDivElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (heroFullOverlayRef.current) {
      gsap.set(heroFullOverlayRef.current, { clipPath: "inset(0% 0% 0% 0% round 0px)" });
    }

    const letters = heroLetterRefs.current.filter((el): el is HTMLSpanElement => el !== null);
    if (letters.length > 0) {
      gsap.set(letters, { clipPath: "inset(0 105% 0 0)" });
      gsap.to(letters, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.35,
        stagger: 0.07,
        ease: "power2.inOut",
        delay: 0.1,
      });
    }

    const clipTimer = setTimeout(() => {
      if (!heroFullOverlayRef.current || !heroOverlayRef.current) return;
      const overlayRect = heroFullOverlayRef.current.getBoundingClientRect();
      const boxRect = heroOverlayRef.current.getBoundingClientRect();
      if (boxRect.width === 0 || boxRect.height === 0) {
        heroFullOverlayRef.current.style.display = "none";
        return;
      }
      const insetT = Math.max(0, boxRect.top - overlayRect.top);
      const insetB = Math.max(0, overlayRect.bottom - boxRect.bottom);
      const insetL = Math.max(0, boxRect.left - overlayRect.left);
      const insetR = Math.max(0, overlayRect.right - boxRect.right);
      gsap.to(heroFullOverlayRef.current, {
        clipPath: `inset(${insetT}px ${insetR}px ${insetB}px ${insetL}px round 24px)`,
        duration: 0.65,
        ease: "power3.inOut",
        onComplete: () => {
          if (heroFullOverlayRef.current) heroFullOverlayRef.current.style.display = "none";
          if (heroOverlayRef.current) {
            heroOverlayRef.current.style.background = "rgba(10,10,10,0.48)";
            heroOverlayRef.current.style.backdropFilter = "blur(14px)";
            (heroOverlayRef.current.style as CSSStyleDeclaration & { WebkitBackdropFilter: string }).WebkitBackdropFilter = "blur(14px)";
            heroOverlayRef.current.style.borderColor = "rgba(212,175,55,0.13)";
            heroOverlayRef.current.style.boxShadow = "0 8px 48px rgba(0,0,0,0.38)";
          }
        },
      });
    }, 1650);

    const fallbackTimer = setTimeout(() => {
      if (heroFullOverlayRef.current) heroFullOverlayRef.current.style.display = "none";
    }, 2600);

    if (heroSubtitleRef.current) {
      gsap.to(heroSubtitleRef.current, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.75,
        delay: 2.3,
        ease: "power2.inOut",
      });
    }

    if (heroButtonRef.current) {
      gsap.fromTo(
        heroButtonRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, delay: 2.6, ease: "power2.out" }
      );
    }
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.65, delay: 2.6, ease: "power2.out" }
      );
    }

    if (scrollIconRef.current) {
      gsap.fromTo(
        scrollIconRef.current,
        { opacity: 0, y: 8 },
        {
          opacity: 1, y: 0, duration: 0.35, delay: 2.85, ease: "power2.out",
          onComplete: () => {
            if (scrollIconRef.current) {
              gsap.to(scrollIconRef.current, {
                y: -8, duration: 0.55, repeat: -1, yoyo: true, ease: "sine.inOut",
              });
            }
          },
        }
      );
    }

    return () => { clearTimeout(clipTimer); clearTimeout(fallbackTimer); };
  }, []);

  // ─── メニュー開閉アニメーション ─────────────────────────────
  useEffect(() => {
    if (!isMenuMounted.current) {
      isMenuMounted.current = true;
      return;
    }
    const logoLetters = logoLettersRef.current.filter((el): el is HTMLSpanElement => el !== null);
    const navItems = menuNavItemsRef.current.filter((el): el is HTMLLIElement => el !== null);
    if (menuOverlayRef.current) gsap.killTweensOf(menuOverlayRef.current);
    if (mainRef.current) gsap.killTweensOf(mainRef.current);
    if (menuReserveBtnRef.current) gsap.killTweensOf(menuReserveBtnRef.current);
    gsap.killTweensOf(logoLetters);
    gsap.killTweensOf(navItems);

    if (mobileMenuOpen) {
      const sw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (sw > 0) {
        document.body.style.paddingRight = `${sw}px`;
        const headerEl = document.querySelector("header") as HTMLElement | null;
        if (headerEl) headerEl.style.paddingRight = `${sw}px`;
      }
      if (menuOverlayRef.current) {
        gsap.set(menuOverlayRef.current, { pointerEvents: "auto" });
        gsap.to(menuOverlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" });
      }
      if (mainRef.current) {
        gsap.to(mainRef.current, { x: 50, duration: 0.35, ease: "power2.out" });
      }
      if (logoRef.current) {
        const navEl = logoRef.current.closest("nav") as HTMLElement;
        if (navEl) {
          const navRect = navEl.getBoundingClientRect();
          const logoRect = logoRef.current.getBoundingClientRect();
          const offset = (navRect.left + navRect.width / 2) - (logoRect.left + logoRect.width / 2);
          if (logoLetters.length > 0) {
            gsap.to(logoLetters, {
              x: offset,
              stagger: { each: 0.05, from: "end" },
              duration: 0.2,
              ease: "power2.out",
              delay: 0.05,
            });
          }
        }
      }
      gsap.fromTo(
        navItems,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.06, duration: 0.28, ease: "power2.out", delay: 0.15 }
      );
      if (menuReserveBtnRef.current) {
        gsap.fromTo(menuReserveBtnRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", delay: 0.55 }
        );
      }
    } else {
      if (menuReserveBtnRef.current) {
        gsap.to(menuReserveBtnRef.current, { opacity: 0, y: 8, duration: 0.18, ease: "power2.in" });
      }
      if (navItems.length > 0) {
        gsap.to(navItems, {
          x: 40, opacity: 0,
          stagger: { each: 0.05, from: "end" },
          duration: 0.2,
          ease: "power2.in",
        });
      }
      if (logoLetters.length > 0) {
        gsap.to(logoLetters, {
          x: 0,
          stagger: { each: 0.05, from: "start" },
          duration: 0.2,
          ease: "power2.out",
          delay: 0.1,
          clearProps: "transform",
        });
      }
      if (mainRef.current) {
        gsap.to(mainRef.current, { x: 0, duration: 0.3, ease: "power2.out", delay: 0.1, clearProps: "transform" });
      }
      if (menuOverlayRef.current) {
        gsap.to(menuOverlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          delay: 0.25,
          onComplete: () => {
            if (menuOverlayRef.current) gsap.set(menuOverlayRef.current, { pointerEvents: "none" });
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            const headerEl = document.querySelector("header") as HTMLElement | null;
            if (headerEl) headerEl.style.paddingRight = "";
          },
        });
      }
    }
  }, [mobileMenuOpen]);

  // ─── スクロールリビール ─────────────────────────────────────
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll("[data-reveal]")) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = parseFloat(el.dataset.revealDelay || "0");
          const dir = el.dataset.revealDir || "up";
          const fromX = dir === "left" ? -40 : dir === "right" ? 40 : 0;
          const fromY = dir === "up" ? 30 : 0;
          gsap.fromTo(
            el,
            { opacity: 0, y: fromY, x: fromX, scale: 0.97 },
            { opacity: 1, y: 0, x: 0, scale: 1, duration: 1.05, delay, ease: "expo.out" }
          );
          observer.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el) => {
      gsap.set(el, { opacity: 0 });
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // ─── About セクション：縦線→テキスト シーケンシャルアニメーション ───
  useEffect(() => {
    const lineEl = aboutLineRef.current;
    const textEl = aboutTextRef.current;
    if (!lineEl || !textEl) return;

    const paras = Array.from(textEl.querySelectorAll("[data-about-line]")) as HTMLElement[];

    gsap.set(lineEl, { scaleY: 0, transformOrigin: "top center" });
    gsap.set(paras, { opacity: 0, x: -28 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          gsap.to(lineEl, {
            scaleY: 1,
            duration: 0.9,
            ease: "power3.inOut",
            onComplete: () => {
              gsap.to(paras, {
                opacity: 1,
                x: 0,
                duration: 0.65,
                stagger: 0.13,
                ease: "power3.out",
              });
            },
          });
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -22% 0px" }
    );

    observer.observe(textEl);
    return () => observer.disconnect();
  }, []);

  // ─── ギャラリーグリッド cascade reveal ───
  useEffect(() => {
    const items = galleryItemRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const container = galleryGridRef.current;
    if (items.length === 0 || !container) return;

    if (items[0]) gsap.set(items[0], { opacity: 0, scale: 0.6, y: -50 });
    if (items.length > 1) gsap.set(items.slice(1), { opacity: 0, scale: 0.72, y: 64 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const tl = gsap.timeline();
          if (items[0]) {
            tl.to(items[0], { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: "expo.out" });
          }
          if (items.length > 1) {
            tl.to(
              items.slice(1),
              { opacity: 1, scale: 1, y: 0, duration: 0.65, stagger: { each: 0.065, from: "start" }, ease: "back.out(1.6)" },
              "-=0.45"
            );
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [galleryImages]);

  // ─── トップへ戻るボタン ──────────────────────────────────────
  useEffect(() => {
    const btn = backToTopRef.current;
    if (!btn) return;
    let visible = false;
    const HERO_H = window.innerHeight * 0.9;
    const onScroll = () => {
      const shouldShow = window.scrollY > HERO_H;
      if (shouldShow === visible) return;
      visible = shouldShow;
      gsap.to(btn, {
        opacity: shouldShow ? 1 : 0,
        y: shouldShow ? 0 : 16,
        duration: 0.35,
        ease: "power2.out",
        onStart: () => { if (shouldShow) btn.style.pointerEvents = "auto"; },
        onComplete: () => { if (!shouldShow) btn.style.pointerEvents = "none"; },
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const smoothScrollTo = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const toggle = (key: string) => {
    const willOpen = openKey !== key;
    setOpenKey(prev => prev === key ? null : key);
    if (willOpen) {
      setTimeout(() => {
        const wrapper = document.querySelector(`[data-accordion-key="${key}"]`);
        if (wrapper) {
          const items = wrapper.querySelectorAll("[data-menu-item]");
          gsap.set(items, { y: 18, scale: 0.96, opacity: 0 });
          gsap.to(items, {
            y: 0, scale: 1, opacity: 1,
            duration: 0.5,
            stagger: { amount: 0.28, from: "start" },
            ease: "back.out(1.15)",
            delay: 0.2,
          });
        }
      }, 20);
    }
  };

  const sectionWrap: React.CSSProperties = {
    width: "min(1100px, 90%)",
    margin: "0 auto",
  };

  const infoLabel: React.CSSProperties = {
    color: "#d4af37",
    fontSize: "0.65rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    display: "block",
    marginBottom: "6px",
  };

  const infoValue: React.CSSProperties = {
    color: "#c8c8c8",
    fontSize: "0.875rem",
    lineHeight: "1.7",
    margin: 0,
  };

  const sectionLabel: React.CSSProperties = {
    color: "#d4af37",
    fontSize: "0.65rem",
    fontWeight: 600,
    letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    marginBottom: "12px",
    opacity: 0.9,
    display: "block",
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "var(--font-heading), serif",
    fontSize: "clamp(2rem, 4vw, 2.8rem)",
    fontWeight: 600,
    color: "#f5f5f5",
    margin: "0 0 56px 0",
    lineHeight: 1.2,
    letterSpacing: "0.02em",
  };

  // ナビゲーション項目（CMS連動）
  const navSections = [
    { id: "about",   label: settings.aboutTitle,   en: "About"   },
    { id: "menu",    label: settings.menuTitle,     en: "Menu"    },
    { id: "staff",   label: settings.staffTitle,    en: "Staff"   },
    { id: "gallery", label: settings.galleryTitle,  en: "Gallery" },
    { id: "access",  label: settings.accessTitle,   en: "Access"  },
  ];

  return (
    <>
      {/* ─── HEADER ─────────────────────────────────── */}
      <header ref={headerRef} style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(13, 13, 13, 0.78)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(212, 175, 55, 0.1)",
        opacity: 0,
      }}>
        <nav style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 5%",
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
        }}>
          <a ref={logoRef} href="/" style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "1.8rem",
            fontWeight: 400,
            color: "#d4af37",
            textDecoration: "none",
            letterSpacing: "0.08em",
            display: "inline-flex",
          }}>
            {"HAIRHOLIC".split("").map((letter, i) => (
              <span key={i} ref={el => { logoLettersRef.current[i] = el; }}>{letter}</span>
            ))}
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px", display: "flex", flexDirection: "column",
              gap: "5px", zIndex: 1100, flexShrink: 0,
            }}
          >
            <span style={{
              display: "block", width: "24px", height: "2px", background: "#d4af37",
              transition: "transform 0.3s ease, opacity 0.3s ease",
              transform: mobileMenuOpen ? "translateY(7px) rotate(45deg)" : "none",
            }} />
            <span style={{
              display: "block", width: "24px", height: "2px", background: "#d4af37",
              transition: "opacity 0.3s ease",
              opacity: mobileMenuOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block", width: "24px", height: "2px", background: "#d4af37",
              transition: "transform 0.3s ease, opacity 0.3s ease",
              transform: mobileMenuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }} />
          </button>
        </nav>
      </header>

      {/* ─── フルスクリーン メニューオーバーレイ ─────────────────── */}
      <div
        ref={menuOverlayRef}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "#0d0d0d", zIndex: 999, opacity: 0, pointerEvents: "none",
          display: "flex", alignItems: "center", padding: "80px 8% 60px",
        }}
      >
        <div style={{ width: "min(680px, 100%)" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, marginBottom: "48px" }}>
            {navSections.map(({ id, label, en }, i) => (
              <li
                key={id}
                ref={el => { menuNavItemsRef.current[i] = el; }}
                style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}
              >
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    setTimeout(() => smoothScrollTo(id), 350);
                  }}
                  style={{
                    display: "flex", alignItems: "baseline",
                    justifyContent: "space-between", padding: "18px 0",
                    textDecoration: "none", color: "#f5f5f5",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#d4af37"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#f5f5f5"; }}
                >
                  <span style={{
                    fontFamily: "var(--font-heading), serif",
                    fontSize: "clamp(1.35rem, 3vw, 2rem)",
                    fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1.1,
                  }}>
                    {label}
                  </span>
                  <span style={{
                    color: "#d4af37", fontSize: "0.6rem", letterSpacing: "0.3em",
                    fontWeight: 600, textTransform: "uppercase" as const,
                    opacity: 0.8, flexShrink: 0,
                  }}>
                    {en}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            ref={menuReserveBtnRef}
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              setTimeout(() => smoothScrollTo("contact"), 350);
            }}
            style={{
              display: "inline-block", padding: "14px 48px",
              background: "linear-gradient(135deg, #d4af37 0%, #e8c547 100%)",
              color: "#0d0d0d", textDecoration: "none", fontSize: "0.875rem",
              fontWeight: 600, borderRadius: "4px", letterSpacing: "0.04em",
            }}
          >
            ご予約はこちら
          </a>
        </div>
      </div>

      <main ref={mainRef} style={{ marginTop: "64px" }}>

        {/* ─── HERO ─────────────────────────────────── */}
        <section style={{
          position: "relative", height: "90vh", minHeight: "600px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${settings.heroBgImage?.url ?? '/images/hero-bg.jpg'}')`,
          backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
        }}>
          <div ref={heroFullOverlayRef} style={{
            position: "absolute", inset: 0,
            background: "rgba(10,10,10,0.48)",
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            zIndex: 1, pointerEvents: "none",
          }} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#fff", zIndex: 2, position: "relative" }}>
            <div ref={heroOverlayRef} style={{
              background: "rgba(10,10,10,0)", backdropFilter: "blur(0px)",
              WebkitBackdropFilter: "blur(0px)", borderRadius: "24px",
              border: "1px solid rgba(212,175,55,0)", padding: "clamp(28px, 5vw, 48px) clamp(32px, 7vw, 64px)",
              marginBottom: "36px", textAlign: "center", boxShadow: "none",
            }}>
              <div ref={heroTitleRef} style={{ marginBottom: "18px" }}>
                <h1 style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "clamp(3rem, 8.5vw, 7rem)", fontWeight: 400,
                  color: "#ffffff", letterSpacing: "0.2em", lineHeight: 1,
                  margin: 0, display: "inline-flex",
                }}>
                  {"HAIRHOLIC".split("").map((letter, i) => (
                    <span key={i} ref={el => { heroLetterRefs.current[i] = el; }} style={{ display: "inline-block" }}>
                      {letter}
                    </span>
                  ))}
                </h1>
              </div>

              <p ref={heroSubtitleRef} style={{
                fontSize: "clamp(0.8rem, 1.8vw, 1rem)", margin: 0,
                letterSpacing: "0.1em", color: "rgba(255,255,255,0.82)",
                fontWeight: 400, clipPath: "inset(0 105% 0 0)",
              }}>
                {settings.heroSubtitle.split("\n").map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </p>
            </div>
            <a
              ref={heroButtonRef}
              href="#contact"
              style={{
                display: "inline-block", padding: "14px 40px",
                background: "linear-gradient(135deg, #d4af37 0%, #e8c547 100%)",
                color: "#0d0d0d", textDecoration: "none", fontSize: "1rem",
                fontWeight: 600, borderRadius: "4px",
                boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)", opacity: 0,
              }}
              onClick={(e) => { e.preventDefault(); smoothScrollTo("contact"); }}
              onMouseEnter={e => { gsap.to(e.currentTarget, { y: -3, boxShadow: "0 6px 20px rgba(212, 175, 55, 0.4)", duration: 0.3, ease: "power2.out" }); }}
              onMouseLeave={e => { gsap.to(e.currentTarget, { y: 0, boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)", duration: 0.3, ease: "power2.out" }); }}
            >
              ご予約はこちら
            </a>
          </div>

          <a
            ref={scrollIconRef}
            href="#about"
            style={{
              position: "absolute", bottom: "40px", left: "50%",
              transform: "translateX(-50%)", cursor: "pointer", textDecoration: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: 0,
            }}
            onClick={(e) => { e.preventDefault(); smoothScrollTo("about"); }}
          >
            <span style={{ color: "#d4af37", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8 }}>Scroll</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </section>

        <div>

          {/* ── ABOUT ── */}
          <section id="about" style={{ background: "#111111" }}>
            <div style={{ padding: "40px 5% 28px", borderBottom: "1px solid rgba(212,175,55,0.12)", background: "#111111" }}>
              <span style={sectionLabel} data-reveal>About</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">{settings.aboutTitle}</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "56px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "56px", alignItems: "center" }}>
                  {/* テキスト */}
                  <div ref={aboutTextRef} style={{ position: "relative", paddingLeft: "24px" }}>
                    <div ref={aboutLineRef} style={{ position: "absolute", left: 0, top: 0, width: "3px", height: "100%", background: "rgba(212,175,55,0.5)" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {renderAboutContent(about.content)}
                    </div>
                  </div>
                  {/* 画像 */}
                  <div style={{ border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", overflow: "hidden" }} data-reveal data-reveal-dir="right" data-reveal-delay="0.15">
                    <img
                      src={about.image?.url ?? "https://images.unsplash.com/photo-1599351507-9efdc63de3b5?w=600&h=500&fit=crop"}
                      alt="HAIRHOLICの店内"
                      style={{ width: "100%", display: "block", objectFit: "cover", aspectRatio: "6/5" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── MENU ── */}
          <section id="menu" style={{ background: "#111111" }}>
            <div style={{ padding: "40px 5% 28px", borderBottom: "1px solid rgba(212,175,55,0.12)", background: "#111111" }}>
              <span style={sectionLabel} data-reveal>Menu</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">{settings.menuTitle}</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "40px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {menuCats.map((category, accordionIdx) => {
                    const key = category.categoryKey;
                    const isOpen = openKey === key;
                    return (
                      <div
                        key={category.id}
                        data-reveal
                        data-reveal-delay={String(accordionIdx * 0.07)}
                        style={{
                          background: "#141414",
                          border: `1px solid ${isOpen ? "#d4af37" : "#2a2a2a"}`,
                          borderRadius: "12px", overflow: "hidden",
                          transition: "border-color 0.3s ease",
                        }}
                      >
                        <button
                          onClick={() => toggle(key)}
                          style={{
                            width: "100%", display: "flex", justifyContent: "space-between",
                            alignItems: "center", padding: "20px 24px",
                            background: "none", border: "none", cursor: "pointer",
                            color: isOpen ? "#d4af37" : "#f5f5f5",
                            transition: "color 0.3s ease",
                          }}
                        >
                          <span style={{ fontFamily: "var(--font-heading), serif", fontSize: "1.15rem", fontWeight: 600, letterSpacing: "0.03em" }}>
                            {category.categoryTitle}
                          </span>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                            style={{ transition: "transform 0.3s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
                          >
                            <path d="M5 7.5L10 12.5L15 7.5" stroke={isOpen ? "#d4af37" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <div style={{ height: "1px", background: "#2a2a2a", margin: "0 24px", opacity: isOpen ? 1 : 0, transition: isOpen ? "opacity 0.25s ease 0.1s" : "opacity 0.15s ease" }} />
                        <div style={{
                          display: "grid",
                          gridTemplateRows: isOpen ? "1fr" : "0fr",
                          transition: isOpen ? "grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.6, 1)",
                        }}>
                          <div style={{ minHeight: 0, overflow: "hidden", opacity: isOpen ? 1 : 0, transition: isOpen ? "opacity 0.3s ease 0.1s" : "opacity 0.15s ease" }}>
                            <div data-accordion-key={key} style={{ padding: "20px 24px 24px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                                {category.items.map((item, itemIdx) => (
                                  <div
                                    key={item.fieldId ?? `${category.id}-item-${itemIdx}`}
                                    data-menu-item
                                    style={{
                                      background: "#1a1a1a", border: "1px solid #2a2a2a",
                                      borderRadius: "8px", padding: "14px 18px",
                                      display: "flex", justifyContent: "space-between",
                                      alignItems: "center", gap: "12px",
                                      transition: "border-color 0.2s ease",
                                    }}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#c9a961"}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#2a2a2a"}
                                  >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <span style={{ fontSize: "0.95rem", color: "#f0f0f0", letterSpacing: "-0.01em", fontWeight: 400, display: "block" }}>
                                        {item.title}
                                      </span>
                                      {item.comment && (
                                        <span style={{ fontSize: "0.75rem", color: "#888", display: "block", marginTop: "4px", lineHeight: 1.5 }}>
                                          {item.comment}
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ color: "#d4af37", fontWeight: 600, fontSize: "0.95rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                                      {item.price}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <RankingCarousel courses={courses} />
              </div>
            </div>
          </section>

          {/* ── STAFF ── */}
          <section id="staff" style={{ background: "#0d0d0d" }}>
            <div style={{ padding: "40px 5% 28px", borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
              <span style={sectionLabel} data-reveal>Staff</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">{settings.staffTitle}</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "56px" }}>
                <StaffSection staff={staff} />
              </div>
            </div>
          </section>

          {/* ── GALLERY ── */}
          <section id="gallery" style={{ background: "#111111" }}>
            <div style={{ padding: "40px 5% 28px", borderBottom: "1px solid rgba(212,175,55,0.12)", background: "#111111" }}>
              <span style={sectionLabel} data-reveal>Gallery</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">{settings.galleryTitle}</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "56px" }}>
                <style>{`
                  .gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 48px; }
                  .gallery-item { aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #1a1a1a; border: 1px solid rgba(212,175,55,0.15); cursor: pointer; position: relative; }
                  @media (min-width: 680px) { .gallery-grid { grid-template-columns: repeat(3, 1fr); } }
                  @media (min-width: 1024px) {
                    .gallery-grid { grid-template-columns: repeat(4, 1fr); grid-template-rows: 220px 220px 200px; }
                    .gallery-item { aspect-ratio: unset; }
                    .gallery-item:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 3; }
                    .gallery-item:nth-child(8) { grid-column: 3 / 5; grid-row: 3; }
                  }
                `}</style>
                <div ref={galleryGridRef} className="gallery-grid">
                  {galleryImages.map((src, i) => (
                    <div
                      key={i}
                      ref={el => { galleryItemRefs.current[i] = el; }}
                      className="gallery-item"
                      onMouseEnter={e => {
                        const el = e.currentTarget;
                        gsap.to(el, { scale: 1.04, duration: 0.35, ease: "power2.out" });
                        const ov = el.querySelector("[data-gallery-overlay]") as HTMLElement | null;
                        if (ov) gsap.to(ov, { opacity: 1, duration: 0.3 });
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget;
                        gsap.to(el, { scale: 1, duration: 0.35, ease: "power2.out" });
                        const ov = el.querySelector("[data-gallery-overlay]") as HTMLElement | null;
                        if (ov) gsap.to(ov, { opacity: 0, duration: 0.3 });
                      }}
                    >
                      <img src={src} alt={`ギャラリー ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={e => {
                          const img = e.currentTarget;
                          img.style.display = "none";
                          if (img.parentElement) img.parentElement.style.background = "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)";
                        }}
                      />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)", pointerEvents: "none" }} />
                      <div data-gallery-overlay style={{ position: "absolute", inset: 0, background: "rgba(212,175,55,0.18)", opacity: 0, pointerEvents: "none" }} />
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "center" }}>
                  <a
                    href="https://www.instagram.com/hairholic_nagasaki"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "10px",
                      padding: "14px 32px",
                      background: "linear-gradient(135deg, #d4af37 0%, #e8c547 100%)",
                      color: "#0d0d0d", textDecoration: "none", fontSize: "0.875rem",
                      fontWeight: 600, borderRadius: "4px", letterSpacing: "0.04em",
                    }}
                    data-reveal
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    Instagramで最新情報をチェック
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ── ACCESS ── */}
          <section id="access" style={{ background: "#0d0d0d" }}>
            <div style={{ padding: "40px 5% 28px", borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
              <span style={sectionLabel} data-reveal>Access</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">{settings.accessTitle}</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "56px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "56px", alignItems: "start" }}>

                  {/* ─ サロン情報 ─ */}
                  <div data-reveal data-reveal-dir="left">
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>電話番号</span>
                      <a href={`tel:${access.tel}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: "#d4af37", fontSize: "0.875rem", textDecoration: "none", borderBottom: "1px solid rgba(212,175,55,0.4)", paddingBottom: "1px" }}
                      >
                        {access.tel}
                      </a>
                    </div>
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>住所</span>
                      <p style={infoValue}>{access.address}</p>
                    </div>
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>アクセス・道案内</span>
                      <p style={infoValue}>{access.directions}</p>
                    </div>
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>営業時間</span>
                      <p style={infoValue}>{access.hours}</p>
                    </div>
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>定休日</span>
                      <p style={infoValue}>{access.regularHoliday}</p>
                    </div>
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>支払い方法</span>
                      <p style={infoValue}>{access.payment}</p>
                    </div>
                    <div style={{ padding: "14px 0" }}>
                      <span style={infoLabel}>その他</span>
                      <p style={infoValue}>{access.notes}</p>
                    </div>
                  </div>

                  {/* ─ Google Map ─ */}
                  <div data-reveal data-reveal-dir="right" data-reveal-delay="0.1">
                    <p style={{ color: "#d4af37", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "16px" }}>Map</p>
                    <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(212,175,55,0.2)", marginBottom: "16px" }}>
                      <iframe
                        src={access.mapEmbedSrc}
                        width="100%" height="340"
                        style={{ border: 0, display: "block" }}
                        allowFullScreen loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="HAIRHOLIC の地図"
                      />
                    </div>
                    <a
                      href={access.mapLink}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: "#d4af37", fontSize: "0.875rem", textDecoration: "none", borderBottom: "1px solid rgba(212,175,55,0.4)", paddingBottom: "2px" }}
                    >
                      Google Maps で開く →
                    </a>
                  </div>

                </div>
              </div>
            </div>
          </section>

        </div>

      </main>

      {/* ─── トップへ戻るボタン ───────────────────────── */}
      <button
        ref={backToTopRef}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="トップへ戻る"
        style={{
          position: "fixed", bottom: "32px", right: "24px", zIndex: 900,
          width: "48px", height: "48px", borderRadius: "50%",
          background: "rgba(13,13,13,0.85)", border: "1px solid rgba(212,175,55,0.5)",
          backdropFilter: "blur(10px)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0, pointerEvents: "none",
          transition: "border-color 0.2s, background 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,175,55,0.15)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#d4af37";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(13,13,13,0.85)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,55,0.5)";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ─── FOOTER ─────────────────────────────────── */}
      <footer style={{ background: "#0a0a0a", borderTop: "1px solid rgba(212,175,55,0.1)", padding: "32px 5%", textAlign: "center" }}>
        <a href="/" style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.3rem", fontWeight: 400, color: "#d4af37", textDecoration: "none", letterSpacing: "0.12em", display: "inline-block", marginBottom: "16px" }}>
          HAIRHOLIC
        </a>
        <p style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.08em", margin: 0 }}>
          © {new Date().getFullYear()} HAIRHOLIC. All rights reserved.
        </p>
      </footer>
    </>
  );
}
