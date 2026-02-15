"use client";

import { useState, useEffect, useRef } from "react";
import { menuCategories } from "./data/menuCategories";
import { rankingCourses } from "./data/rankingCourses";
import RankingCarousel from "./components/RankingCarousel";
import { useStaff } from "./hooks/useMicroCMS";
import gsap from "gsap";

// ── Instagram ギャラリー用ダミー画像（Graph API 取得後に差し替え） ──
// TODO: Instagram Graph API 連携後は setGalleryImages() で更新する
// useEffect(() => {
//   fetch(`/api/instagram?tag=hairholic`)
//     .then(r => r.json())
//     .then(data => setGalleryImages(data.images.slice(0, 7)))
//     .catch(() => setGalleryImages(DUMMY_GALLERY_IMAGES));
// }, []);
const DUMMY_GALLERY_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop",  // バーバーツール
  "https://images.unsplash.com/photo-1599351507-9efdc63de3b5?w=600&h=600&fit=crop",     // バーバーチェア
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop",  // ヘアカット
  "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=600&fit=crop",  // フェード
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop",  // フェードカット
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop",  // バーバーショップ
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop",  // ヘアスタイル
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&h=600&fit=crop",  // ポートレート
];

export default function Page() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(DUMMY_GALLERY_IMAGES);
  const { staff } = useStaff();

  // Refs for GSAP animations
  const heroFullOverlayRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const heroLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonRef = useRef<HTMLAnchorElement>(null);
  const scrollIconRef = useRef<HTMLAnchorElement>(null);
  // メニューアニメーション用 Refs
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const logoLettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuNavItemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const menuReserveBtnRef = useRef<HTMLAnchorElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const isMenuMounted = useRef(false);
  // About セクション専用
  const aboutLineRef = useRef<HTMLDivElement>(null);
  const aboutTextRef = useRef<HTMLDivElement>(null);
  // Gallery
  const galleryItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const galleryGridRef = useRef<HTMLDivElement>(null);
  // トップへ戻るボタン
  const backToTopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // GSAP トラッキング用：初期 clip-path をセット
    if (heroFullOverlayRef.current) {
      gsap.set(heroFullOverlayRef.current, { clipPath: "inset(0% 0% 0% 0% round 0px)" });
    }

    // ─── ① HAIRHOLIC：フロストの上で左から書くように reveal（t=0.1〜）──
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

    // ─── ② t=1.65: 全画面フロストをボックスサイズへ clip-path で縮小 ──
    const clipTimer = setTimeout(() => {
      if (!heroFullOverlayRef.current || !heroOverlayRef.current) return;
      const overlayRect = heroFullOverlayRef.current.getBoundingClientRect();
      const boxRect     = heroOverlayRef.current.getBoundingClientRect();

      // ボックスが未レンダリングの場合は即消去して終了
      if (boxRect.width === 0 || boxRect.height === 0) {
        heroFullOverlayRef.current.style.display = "none";
        return;
      }

      const insetT = Math.max(0, boxRect.top    - overlayRect.top);
      const insetB = Math.max(0, overlayRect.bottom - boxRect.bottom);
      const insetL = Math.max(0, boxRect.left   - overlayRect.left);
      const insetR = Math.max(0, overlayRect.right  - boxRect.right);

      gsap.to(heroFullOverlayRef.current, {
        clipPath: `inset(${insetT}px ${insetR}px ${insetB}px ${insetL}px round 24px)`,
        duration: 0.65,
        ease: "power3.inOut",
        onComplete: () => {
          if (heroFullOverlayRef.current) heroFullOverlayRef.current.style.display = "none";
          if (heroOverlayRef.current) {
            heroOverlayRef.current.style.background    = "rgba(10,10,10,0.48)";
            heroOverlayRef.current.style.backdropFilter = "blur(14px)";
            (heroOverlayRef.current.style as CSSStyleDeclaration & { WebkitBackdropFilter: string }).WebkitBackdropFilter = "blur(14px)";
            heroOverlayRef.current.style.borderColor   = "rgba(212,175,55,0.13)";
            heroOverlayRef.current.style.boxShadow     = "0 8px 48px rgba(0,0,0,0.38)";
          }
        },
      });
    }, 1650);

    // フォールバック：何らかの理由でアニメーションが完了しない場合でも強制消去
    const fallbackTimer = setTimeout(() => {
      if (heroFullOverlayRef.current) heroFullOverlayRef.current.style.display = "none";
    }, 2600);

    // ─── ③ サブタイトル：タイトルと同じ clipPath で左から reveal（t=2.3）──
    if (heroSubtitleRef.current) {
      gsap.to(heroSubtitleRef.current, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.75,
        delay: 2.3,
        ease: "power2.inOut",
      });
    }

    // ─── ④ 予約ボタン & ヘッダー：同タイミングでフェードイン（t=2.6）──────
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

    // ─── ⑤ スクロールアイコン（t=2.85）──────────────────────────────
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
    // 連打対策：進行中のアニメーションをすべてクリア
    const logoLetters = logoLettersRef.current.filter((el): el is HTMLSpanElement => el !== null);
    const navItems = menuNavItemsRef.current.filter((el): el is HTMLLIElement => el !== null);
    if (menuOverlayRef.current) gsap.killTweensOf(menuOverlayRef.current);
    if (mainRef.current) gsap.killTweensOf(mainRef.current);
    if (menuReserveBtnRef.current) gsap.killTweensOf(menuReserveBtnRef.current);
    gsap.killTweensOf(logoLetters);
    gsap.killTweensOf(navItems);

    if (mobileMenuOpen) {
      // スクロールバー消失による幅変化を header に paddingRight で補正
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
      // ── Close: open のリバース ──
      // 1. Reserve button を先にフェードアウト
      if (menuReserveBtnRef.current) {
        gsap.to(menuReserveBtnRef.current, {
          opacity: 0, y: 8,
          duration: 0.18,
          ease: "power2.in",
        });
      }
      // 2. ナビアイテムを右へスライドアウト（入ってきた逆）
      if (navItems.length > 0) {
        gsap.to(navItems, {
          x: 40, opacity: 0,
          stagger: { each: 0.05, from: "end" },
          duration: 0.2,
          ease: "power2.in",
        });
      }
      // 3. ロゴ文字を元の位置へ
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
      // 4. メインを元の位置へ（clearProps でパララックスを復元）
      if (mainRef.current) {
        gsap.to(mainRef.current, { x: 0, duration: 0.3, ease: "power2.out", delay: 0.1, clearProps: "transform" });
      }
      // 5. オーバレイを最後にフェードアウト → 完了後にスクロールバー復元（ボタンズレ防止）
      if (menuOverlayRef.current) {
        gsap.to(menuOverlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          delay: 0.25,
          onComplete: () => {
            if (menuOverlayRef.current) {
              gsap.set(menuOverlayRef.current, { pointerEvents: "none" });
            }
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
    const targets = Array.from(
      document.querySelectorAll("[data-reveal]")
    ) as HTMLElement[];

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

  // ─── スタッフカードリビール ─────────────────────────────────────
  useEffect(() => {
    if (staff.length === 0) return;
    const cards = Array.from(
      document.querySelectorAll("[data-staff-reveal]")
    ) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const i = parseInt(el.dataset.staffReveal || "0");
          gsap.fromTo(
            el,
            { opacity: 0, y: 35, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.9, delay: i * 0.12, ease: "expo.out" }
          );
          observer.unobserve(el);
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => {
      gsap.set(card, { opacity: 0 });
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [staff]);

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

          // 1. 縦線を上から下へじわっと伸ばす
          gsap.to(lineEl, {
            scaleY: 1,
            duration: 0.9,
            ease: "power3.inOut",
            onComplete: () => {
              // 2. 段落を左から右へワイプ（ヒーローの HAIRHOLIC と同じ動き）
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

  // ─── ギャラリーグリッド：タイムラインで「おぉ」と思わせる cascade reveal ───
  useEffect(() => {
    const items = galleryItemRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const container = galleryGridRef.current;
    if (items.length === 0 || !container) return;

    // 初期状態：大カードは上から、残りは下から
    if (items[0]) gsap.set(items[0], { opacity: 0, scale: 0.6, y: -50 });
    if (items.length > 1) gsap.set(items.slice(1), { opacity: 0, scale: 0.72, y: 64 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          const tl = gsap.timeline();

          // ① 大カードが上からドロップイン
          if (items[0]) {
            tl.to(items[0], {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.75,
              ease: "expo.out",
            });
          }

          // ② 残りが下から back.out でオーバーシュートしながら連鎖
          if (items.length > 1) {
            tl.to(
              items.slice(1),
              {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.65,
                stagger: { each: 0.065, from: "start" },
                ease: "back.out(1.6)",
              },
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

  // ─── トップへ戻るボタン：ヒーロー離脱で表示 ──────────────────────
  useEffect(() => {
    const btn = backToTopRef.current;
    if (!btn) return;
    let visible = false;
    const HERO_H = window.innerHeight * 0.9; // ヒーローの高さ目安

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
      // パネルが DOM に反映されてから各アイテムをスタッガーアニメーション
      setTimeout(() => {
        const wrapper = document.querySelector(`[data-accordion-key="${key}"]`);
        if (wrapper) {
          const items = wrapper.querySelectorAll("[data-menu-item]");
          gsap.set(items, { y: 18, scale: 0.96, opacity: 0 });
          gsap.to(items, {
            y: 0,
            scale: 1,
            opacity: 1,
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

          {/* ハンバーガーボタン（常時表示・display:none なし） */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              zIndex: 1100,
              flexShrink: 0,
            }}
          >
            {/* ハンバーガー → X のアニメーション */}
            <span style={{
              display: "block",
              width: "24px",
              height: "2px",
              background: "#d4af37",
              transition: "transform 0.3s ease, opacity 0.3s ease",
              transform: mobileMenuOpen ? "translateY(7px) rotate(45deg)" : "none",
            }} />
            <span style={{
              display: "block",
              width: "24px",
              height: "2px",
              background: "#d4af37",
              transition: "opacity 0.3s ease",
              opacity: mobileMenuOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block",
              width: "24px",
              height: "2px",
              background: "#d4af37",
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
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "#0d0d0d",
          zIndex: 999,
          opacity: 0,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          padding: "80px 8% 60px",
        }}
      >
        <div style={{ width: "min(680px, 100%)" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, marginBottom: "48px" }}>
            {[
              { id: "about",   label: "HAIRHOLICについて", en: "About"   },
              { id: "menu",    label: "メニュー",          en: "Menu"    },
              { id: "staff",   label: "スタッフ",          en: "Staff"   },
              { id: "gallery", label: "ギャラリー",        en: "Gallery" },
              { id: "access",  label: "アクセス",          en: "Access"  },
            ].map(({ id, label, en }, i) => (
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
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "18px 0",
                    textDecoration: "none",
                    color: "#f5f5f5",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#d4af37"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#f5f5f5"; }}
                >
                  <span style={{
                    fontFamily: "var(--font-heading), serif",
                    fontSize: "clamp(1.35rem, 3vw, 2rem)",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    lineHeight: 1.1,
                  }}>
                    {label}
                  </span>
                  <span style={{
                    color: "#d4af37",
                    fontSize: "0.6rem",
                    letterSpacing: "0.3em",
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    opacity: 0.8,
                    flexShrink: 0,
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
              display: "inline-block",
              padding: "14px 48px",
              background: "linear-gradient(135deg, #d4af37 0%, #e8c547 100%)",
              color: "#0d0d0d",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: "4px",
              letterSpacing: "0.04em",
            }}
          >
            ご予約はこちら
          </a>
        </div>
      </div>

      <main ref={mainRef} style={{ marginTop: "64px" }}>

        {/* ─── HERO ─────────────────────────────────── */}
        <section style={{
          position: "relative",
          height: "90vh",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/images/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}>
          {/* ── 全画面フロストオーバーレイ（box と同じ質感でヒーロー全体を覆い、縮小してボックスへ変形） ── */}
          <div
            ref={heroFullOverlayRef}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,10,10,0.48)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          <div style={{
            textAlign: "center",
            color: "#fff",
            zIndex: 2,
            position: "relative",
          }}>
            {/* ── フロストボックス（初期は透明、t=0.7 で凝縮） ── */}
            <div
              ref={heroOverlayRef}
              style={{
                background: "rgba(10,10,10,0)",
                backdropFilter: "blur(0px)",
                WebkitBackdropFilter: "blur(0px)",
                borderRadius: "24px",
                border: "1px solid rgba(212,175,55,0)",
                padding: "clamp(28px, 5vw, 48px) clamp(32px, 7vw, 64px)",
                marginBottom: "36px",
                display: "inline-block",
                boxShadow: "none",
              }}
            >
              {/* ヒーロータイトル */}
              <div
                ref={heroTitleRef}
                style={{ marginBottom: "18px" }}
              >
                <h1 style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "clamp(3rem, 8.5vw, 7rem)",
                  fontWeight: 400,
                  color: "#ffffff",
                  letterSpacing: "0.2em",
                  lineHeight: 1,
                  margin: 0,
                  display: "inline-flex",
                }}>
                  {"HAIRHOLIC".split("").map((letter, i) => (
                    <span
                      key={i}
                      ref={el => { heroLetterRefs.current[i] = el; }}
                      style={{ display: "inline-block" }}
                    >
                      {letter}
                    </span>
                  ))}
                </h1>
              </div>

              <p
                ref={heroSubtitleRef}
                style={{
                  fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
                  margin: 0,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.82)",
                  fontWeight: 400,
                  clipPath: "inset(0 105% 0 0)",
                }}
              >
                長崎市のメンズバーバー<br></br>フェード・ツイスト・スパイラル・ヘッドスパ
              </p>
            </div>
            <a 
              ref={heroButtonRef}
              href="#contact" 
              style={{
                display: "inline-block",
                padding: "14px 40px",
                background: "linear-gradient(135deg, #d4af37 0%, #e8c547 100%)",
                color: "#0d0d0d",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: "4px",
                boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
                opacity: 0,
              }}
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("contact");
              }}
              onMouseEnter={e => {
                gsap.to(e.currentTarget, {
                  y: -3,
                  boxShadow: "0 6px 20px rgba(212, 175, 55, 0.4)",
                  duration: 0.3,
                  ease: "power2.out",
                });
              }}
              onMouseLeave={e => {
                gsap.to(e.currentTarget, {
                  y: 0,
                  boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
                  duration: 0.3,
                  ease: "power2.out",
                });
              }}
            >
              ご予約はこちら
            </a>
          </div>

          {/* スクロールダウン */}
          <a 
            ref={scrollIconRef}
            href="#ranking"
            style={{
              position: "absolute",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "pointer",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              opacity: 0,
            }}
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo("about");
            }}
          >
            <span style={{
              color: "#d4af37",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}>
              Scroll
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M12 5V19M12 19L5 12M12 19L19 12" 
                stroke="#d4af37" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </section>

        {/* ─── SECTIONS ─────────────────────────────────────────────── */}
        <div>

          {/* ── ABOUT ── */}
          <section id="about" style={{ background: "#111111" }}>
            <div style={{
              padding: "40px 5% 28px",
              borderBottom: "1px solid rgba(212,175,55,0.12)",
              background: "#111111",
            }}>
              <span style={sectionLabel} data-reveal>About</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">HAIRHOLICについて</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "56px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "56px",
                  alignItems: "center",
                }}>
                  {/* テキスト */}
                  <div ref={aboutTextRef} style={{ position: "relative", paddingLeft: "24px" }}>
                    {/* 金色縦線（scaleY で上から伸びる） */}
                    <div
                      ref={aboutLineRef}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "3px",
                        height: "100%",
                        background: "rgba(212,175,55,0.5)",
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <p style={{ color: "#c8c8c8", fontSize: "0.95rem", lineHeight: "1.9", margin: 0 }}>
                        <span data-about-line style={{ display: "block" }}>毎日頑張るあなたへ</span>
                        <span data-about-line style={{ display: "block" }}>頭身浴とヘッドスパで癒しをご提供。</span>
                      </p>
                      <p style={{ color: "#c8c8c8", fontSize: "0.95rem", lineHeight: "1.9", margin: 0 }}>
                        <span data-about-line style={{ display: "block" }}>もちろんヘアスタイルにも妥協いたしません。</span>
                        <span data-about-line style={{ display: "block" }}>ミリ単位までこだわるフェードカット。</span>
                        <span data-about-line style={{ display: "block" }}>色気たっぷりのツイストスパイラルパーマ。</span>
                        <span data-about-line style={{ display: "block" }}>清潔感溢れるビジネスカット等こだわりの技術で</span>
                        <span data-about-line style={{ display: "block" }}>幅広く対応いたします。</span>
                      </p>
                      <p style={{ color: "#c8c8c8", fontSize: "0.95rem", lineHeight: "1.9", margin: 0 }}>
                        <span data-about-line style={{ display: "block" }}>まるでバーの様な落ち着いた店内での漢磨きなら</span>
                         <span data-about-line style={{ display: "block" }}>HAIRHOLICへお任せください。</span>

                      </p>
                    </div>
                  </div>
                  {/* 画像 */}
                  <div style={{ border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", overflow: "hidden" }} data-reveal data-reveal-dir="right" data-reveal-delay="0.15">
                    <img
                      src="https://images.unsplash.com/photo-1599351507-9efdc63de3b5?w=600&h=500&fit=crop"
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
            <div style={{
              padding: "40px 5% 28px",
              borderBottom: "1px solid rgba(212,175,55,0.12)",
              background: "#111111",
            }}>
              <span style={sectionLabel} data-reveal>Menu</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">メニュー</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "40px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {Object.entries(menuCategories).map(([key, category], accordionIdx) => {
                    const isOpen = openKey === key;
                    return (
                      <div
                        key={key}
                        data-reveal
                        data-reveal-delay={String(accordionIdx * 0.07)}
                        style={{
                          background: "#141414",
                          border: `1px solid ${isOpen ? "#d4af37" : "#2a2a2a"}`,
                          borderRadius: "12px",
                          overflow: "hidden",
                          transition: "border-color 0.3s ease",
                        }}
                      >
                        <button
                          onClick={() => toggle(key)}
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "20px 24px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: isOpen ? "#d4af37" : "#f5f5f5",
                            transition: "color 0.3s ease",
                          }}
                        >
                          <span style={{
                            fontFamily: "var(--font-heading), serif",
                            fontSize: "1.15rem",
                            fontWeight: 600,
                            letterSpacing: "0.03em",
                          }}>
                            {category.name}
                          </span>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                            style={{
                              transition: "transform 0.3s ease",
                              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              flexShrink: 0,
                            }}
                          >
                            <path d="M5 7.5L10 12.5L15 7.5"
                              stroke={isOpen ? "#d4af37" : "#888"}
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <div style={{
                          height: "1px",
                          background: "#2a2a2a",
                          margin: "0 24px",
                          opacity: isOpen ? 1 : 0,
                          transition: isOpen ? "opacity 0.25s ease 0.1s" : "opacity 0.15s ease",
                        }} />
                        {/* grid-template-rows アニメーションで自然な高さ展開 */}
                        <div style={{
                          display: "grid",
                          gridTemplateRows: isOpen ? "1fr" : "0fr",
                          transition: isOpen
                            ? "grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                            : "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.6, 1)",
                        }}>
                          <div style={{ minHeight: 0, overflow: "hidden", opacity: isOpen ? 1 : 0, transition: isOpen ? "opacity 0.3s ease 0.1s" : "opacity 0.15s ease" }}>
                            <div data-accordion-key={key} style={{ padding: "20px 24px 24px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                                {category.items.map((item) => (
                                  <div
                                    key={item.title}
                                    data-menu-item
                                    style={{
                                      background: "#1a1a1a",
                                      border: "1px solid #2a2a2a",
                                      borderRadius: "8px",
                                      padding: "14px 18px",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      gap: "12px",
                                      transition: "border-color 0.2s ease",
                                    }}
                                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#c9a961"}
                                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#2a2a2a"}
                                  >
                                    <span style={{ fontSize: "0.95rem", color: "#f0f0f0", letterSpacing: "-0.01em", fontWeight: 400 }}>
                                      {item.title}
                                    </span>
                                    <span style={{ color: "#d4af37", fontWeight: 600, fontSize: "0.95rem", whiteSpace: "nowrap" }}>
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
                <RankingCarousel courses={rankingCourses} />
              </div>
            </div>
          </section>

          {/* ── STAFF ── */}
          <section id="staff" style={{ background: "#0d0d0d" }}>
            <div style={{
              padding: "40px 5% 28px",
              borderBottom: "1px solid rgba(212,175,55,0.12)",
            }}>
              <span style={sectionLabel} data-reveal>Staff</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">スタッフ</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "56px" }}>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {staff.map((member, memberIdx) => (
                    <div
                      key={member.id}
                      data-staff-reveal={String(memberIdx)}
                      style={{
                        background: "#141414",
                        border: "1px solid rgba(212,175,55,0.2)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        width: "320px",
                        flexShrink: 0,
                      }}
                    >
                      {/* 写真エリア */}
                      <div style={{ height: "300px", overflow: "hidden", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        ) : (
                          /* 写真未設定時のプレースホルダー */
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                          </svg>
                        )}
                      </div>

                      {/* テキストエリア */}
                      <div style={{ padding: "28px" }}>
                        <h3 style={{ fontFamily: "var(--font-heading), serif", fontSize: "1.3rem", color: "#f5f5f5", marginBottom: "6px", letterSpacing: "0.04em" }}>
                          {member.name}
                        </h3>
                        <p style={{ color: "#d4af37", fontSize: "0.8rem", letterSpacing: "0.06em", marginBottom: "16px" }}>
                          {member.role}
                        </p>
                        {member.specialty && (
                          <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: member.comment ? "14px" : 0 }}>
                            <span style={{ color: "#f5f5f5", display: "block", marginBottom: "4px", fontSize: "0.8rem", letterSpacing: "0.04em" }}>得意分野</span>
                            {member.specialty}
                          </p>
                        )}
                        {member.comment && (
                          <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: "1.75", borderTop: "1px solid #2a2a2a", paddingTop: "14px", marginTop: "14px" }}>
                            {member.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── GALLERY ── */}
          <section id="gallery" style={{ background: "#111111" }}>
            <div style={{
              padding: "40px 5% 28px",
              borderBottom: "1px solid rgba(212,175,55,0.12)",
              background: "#111111",
            }}>
              <span style={sectionLabel} data-reveal>Gallery</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">ギャラリー</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "56px" }}>

                {/* ── レスポンシブ bento グリッドスタイル ── */}
                <style>{`
                  .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 48px;
                  }
                  .gallery-item {
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #1a1a1a;
                    border: 1px solid rgba(212,175,55,0.15);
                    cursor: pointer;
                    position: relative;
                  }
                  @media (min-width: 680px) {
                    .gallery-grid {
                      grid-template-columns: repeat(3, 1fr);
                    }
                  }
                  @media (min-width: 1024px) {
                    .gallery-grid {
                      grid-template-columns: repeat(4, 1fr);
                      grid-template-rows: 220px 220px 200px;
                    }
                    .gallery-item { aspect-ratio: unset; }
                    .gallery-item:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 3; }
                    .gallery-item:nth-child(8) { grid-column: 3 / 5; grid-row: 3; }
                  }
                `}</style>

                {/* ── 画像グリッド（Instagram Graph API 対応の土台） ── */}
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
                      <img
                        src={src}
                        alt={`ギャラリー ${i + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={e => {
                          const img = e.currentTarget;
                          img.style.display = "none";
                          if (img.parentElement) img.parentElement.style.background = "linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)";
                        }}
                      />
                      {/* 底部グラデーション（常時表示・奥行き感） */}
                      <div style={{
                        position: "absolute",
                        bottom: 0, left: 0, right: 0,
                        height: "45%",
                        background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                        pointerEvents: "none",
                      }} />
                      {/* ホバー時ゴールドシマーオーバーレイ */}
                      <div
                        data-gallery-overlay
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(212,175,55,0.18)",
                          opacity: 0,
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Instagram リンク */}
                <div style={{ textAlign: "center" }}>
                  <a
                    href="https://www.instagram.com/hairholic_nagasaki"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "14px 32px",
                      background: "linear-gradient(135deg, #d4af37 0%, #e8c547 100%)",
                      color: "#0d0d0d",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      borderRadius: "4px",
                      letterSpacing: "0.04em",
                    }}
                    data-reveal
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                    Instagramで最新情報をチェック
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ── ACCESS ── */}
          <section id="access" style={{ background: "#0d0d0d" }}>
            <div style={{
              padding: "40px 5% 28px",
              borderBottom: "1px solid rgba(212,175,55,0.12)",
            }}>
              <span style={sectionLabel} data-reveal>Access</span>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }} data-reveal data-reveal-delay="0.1">アクセス</h2>
            </div>
            <div style={{ overflow: "hidden", paddingBottom: "80px" }}>
              <div style={{ ...sectionWrap, paddingTop: "56px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "56px",
                  alignItems: "start",
                }}>

                  {/* ─ サロン情報 ─ */}
                  <div data-reveal data-reveal-dir="left">
                    {/* 電話番号 */}
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>電話番号</span>
                      <a
                        href="tel:095-894-8985"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#d4af37", fontSize: "0.875rem", textDecoration: "none", borderBottom: "1px solid rgba(212,175,55,0.4)", paddingBottom: "1px" }}
                      >
                        095-895-8985
                      </a>
                    </div>
                    {/* 住所 */}
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>住所</span>
                      <p style={infoValue}>長崎県長崎市浜口町６ー１３ 永田ビル２F</p>
                    </div>
                    {/* アクセス */}
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>アクセス・道案内</span>
                      <p style={infoValue}>路面電車電停【大学病院前】を降りて、浜口側に渡りホンダ楽器様横の交差点を直進、ふたつ目の角を右に曲がると右手に見えてくる、地どり家道場様の2階がお店です。</p>
                    </div>
                    {/* 営業時間 */}
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>営業時間</span>
                      <p style={infoValue}>9:00 〜 19:00</p>
                    </div>
                    {/* 定休日 */}
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>定休日</span>
                      <p style={infoValue}>毎週月曜、第三日曜日、お盆、お正月</p>
                    </div>
                    {/* 支払い方法 */}
                    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <span style={infoLabel}>支払い方法</span>
                      <p style={infoValue}>Visa / Mastercard / JCB / American Express / Diners Club / UnionPay（銀聯）/ Discover</p>
                    </div>
                    {/* その他 */}
                    <div style={{ padding: "14px 0" }}>
                      <span style={infoLabel}>その他</span>
                      <p style={infoValue}>スマート支払いOK、ポイント利用OK、即時予約OK、メンズにもオススメ</p>
                    </div>
                  </div>

                  {/* ─ Google Map ─ */}
                  <div data-reveal data-reveal-dir="right" data-reveal-delay="0.1">
                    <p style={{ color: "#d4af37", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "16px" }}>Map</p>
                    <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(212,175,55,0.2)", marginBottom: "16px" }}>
                      <iframe
                        src="https://maps.google.com/maps?q=32.7685437,129.8650918&z=17&output=embed&hl=ja"
                        width="100%"
                        height="340"
                        style={{ border: 0, display: "block" }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="HAIRHOLIC の地図"
                      />
                    </div>
                    <a
                      href="https://www.google.com/maps/place/HAIRHOLIC/@32.7685437,129.8650918,17z/"
                      target="_blank"
                      rel="noopener noreferrer"
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
          position: "fixed",
          bottom: "32px",
          right: "24px",
          zIndex: 900,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(13,13,13,0.85)",
          border: "1px solid rgba(212,175,55,0.5)",
          backdropFilter: "blur(10px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          pointerEvents: "none",
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
          <path d="M12 19V5M12 5L5 12M12 5L19 12"
            stroke="#d4af37" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ─── FOOTER ─────────────────────────────────── */}
      <footer style={{
        background: "#0a0a0a",
        borderTop: "1px solid rgba(212,175,55,0.1)",
        padding: "32px 5%",
        textAlign: "center",
      }}>
        <a href="/" style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: "1.3rem",
          fontWeight: 400,
          color: "#d4af37",
          textDecoration: "none",
          letterSpacing: "0.12em",
          display: "inline-block",
          marginBottom: "16px",
        }}>
          HAIRHOLIC
        </a>
        <p style={{
          color: "#444",
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          margin: 0,
        }}>
          © {new Date().getFullYear()} HAIRHOLIC. All rights reserved.
        </p>
      </footer>
    </>
  );
}