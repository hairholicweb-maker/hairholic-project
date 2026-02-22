"use client";

import { useState, useEffect, useRef } from "react";
import RankingCarousel from "./components/RankingCarousel";
import StaffSection from "./components/StaffSection";
import FloatingReserveButton from "./components/FloatingReserveButton";
import {
  useStaff,
  useRankingCourses,
  useSiteSettings,
  useAbout,
  useMenuCategoriesCMS,
  useAccess,
} from "./hooks/useMicroCMS";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
          <span key={j} data-about-line style={{ display: "block", opacity: 0 }}>{line}</span>
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
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const heroLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonRef = useRef<HTMLAnchorElement>(null);
  const scrollIconRef = useRef<HTMLDivElement>(null);
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
  const heroBgRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef<string | null>(null); // メニュー閉鎖後にスクロールするターゲット
  const aboutObservedRef = useRef(false); // About アニメーション observer 起動済みフラグ
  const menuScrollYRef = useRef(0); // メニュー開閉時のスクロール位置保存（overflow前に取得）
  const topLineRef = useRef<HTMLSpanElement>(null);    // ハンバーガー上ライン
  const bottomLineRef = useRef<HTMLSpanElement>(null); // ハンバーガー下ライン
  const dotRef = useRef<HTMLSpanElement>(null);         // ハンバーガーゴールドドット
  const menuGoldLineRef = useRef<HTMLDivElement>(null); // メニュー内ゴールド水平線

  useEffect(() => {
    // ─── スクロール位置をスロットル保存（beforeunload だけだとモバイルで不発の場合あり） ────
    let scrollSaveTimer: ReturnType<typeof setTimeout> | null = null;
    const onScrollSave = () => {
      if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => {
        try { sessionStorage.setItem('hairholic_scroll', String(window.scrollY)); } catch {}
      }, 200);
    };
    window.addEventListener('scroll', onScrollSave, { passive: true });
    const onBeforeUnload = () => {
      if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
      try { sessionStorage.setItem('hairholic_scroll', String(window.scrollY)); } catch {}
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    // ─── セッション初回のみヒーローアニメーションを再生 ────────
    let introPlayed = false;
    try { introPlayed = sessionStorage.getItem('hairholic_intro') === '1'; } catch {}

    if (introPlayed) {
      // scroll-behavior: smooth を一時無効にして即時スクロール復元（smoothだと0→Yのアニメーションが見えてしまう）
      try {
        const y = parseInt(sessionStorage.getItem('hairholic_scroll') || '0', 10);
        if (y > 0) {
          document.documentElement.style.scrollBehavior = 'auto';
          window.scrollTo(0, y);
          document.documentElement.style.scrollBehavior = '';
        }
      } catch {}
      document.documentElement.style.opacity = ''; // スクロール完了後にページを表示

      // 全要素を最終状態に即セット（アニメーションをスキップ）
      if (headerRef.current)     gsap.set(headerRef.current,     { opacity: 1, y: 0 });
      if (heroButtonRef.current) gsap.set(heroButtonRef.current, { opacity: 1, y: 0 });
      if (heroFullOverlayRef.current) heroFullOverlayRef.current.style.display = "none";
      const skipLetters = heroLetterRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      if (skipLetters.length > 0) gsap.set(skipLetters, { clearProps: "clipPath" });
      if (heroSubtitleRef.current) gsap.set(heroSubtitleRef.current, { clipPath: "inset(0 0% 0 0)" });
      if (scrollIconRef.current)  gsap.set(scrollIconRef.current, { opacity: 1 });
      return;
    }

    // 次回アクセス時はスキップするようにフラグを立てる
    try { sessionStorage.setItem('hairholic_intro', '1'); } catch {}

    // ─── GSAP で初期状態を設定（JSX inline style に頼らない） ────
    if (headerRef.current)     gsap.set(headerRef.current,     { opacity: 0, y: -16 });
    if (heroButtonRef.current) gsap.set(heroButtonRef.current, { opacity: 0, y: 16 });
    if (scrollIconRef.current) gsap.set(scrollIconRef.current, { opacity: 0, y: 8 });

    if (heroFullOverlayRef.current) {
      gsap.set(heroFullOverlayRef.current, { opacity: 1 });
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

    // オーバーレイをシンプルにフェードアウト（フロストグラスボックスなし）
    const clipTimer = setTimeout(() => {
      if (!heroFullOverlayRef.current) return;
      gsap.to(heroFullOverlayRef.current, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => {
          if (heroFullOverlayRef.current) heroFullOverlayRef.current.style.display = "none";
        },
      });
    }, 1000);

    const fallbackTimer = setTimeout(() => {
      if (heroFullOverlayRef.current) heroFullOverlayRef.current.style.display = "none";
    }, 2200);

    if (heroSubtitleRef.current) {
      gsap.to(heroSubtitleRef.current, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.55,
        delay: 1.3,
        ease: "power2.inOut",
      });
    }

    if (heroButtonRef.current) {
      gsap.fromTo(
        heroButtonRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, delay: 1.6, ease: "power2.out" }
      );
    }
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.45, delay: 1.6, ease: "power2.out" }
      );
    }

    if (scrollIconRef.current) {
      gsap.fromTo(
        scrollIconRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, delay: 1.9, ease: "power2.out" }
      );
    }

    return () => {
      clearTimeout(clipTimer);
      clearTimeout(fallbackTimer);
      if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
      window.removeEventListener('scroll', onScrollSave);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
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
    if (topLineRef.current) gsap.killTweensOf(topLineRef.current);
    if (bottomLineRef.current) gsap.killTweensOf(bottomLineRef.current);
    if (dotRef.current) gsap.killTweensOf(dotRef.current);
    if (menuGoldLineRef.current) gsap.killTweensOf(menuGoldLineRef.current);
    gsap.killTweensOf(logoLetters);
    gsap.killTweensOf(navItems);

    if (mobileMenuOpen) {
      // スクロールロックは onClick で既に同期適用済み。ここでは GSAP アニメーションのみ。
      const sw = window.innerWidth - document.documentElement.clientWidth;
      if (sw > 0) {
        document.body.style.paddingRight = `${sw}px`;
        const headerEl = document.querySelector("header") as HTMLElement | null;
        if (headerEl) headerEl.style.paddingRight = `${sw}px`;
      }

      // ── アイコンアニメーション（Open）──
      if (topLineRef.current) {
        gsap.to(topLineRef.current, { rotation: 45, transformOrigin: "center center", duration: 0.45, ease: "power2.inOut" });
      }
      if (bottomLineRef.current) {
        gsap.to(bottomLineRef.current, { rotation: -45, transformOrigin: "center center", duration: 0.45, ease: "power2.inOut" });
      }

      // ── オーバーレイ：クリップパスで右上から展開 ──
      if (menuOverlayRef.current) {
        gsap.set(menuOverlayRef.current, { pointerEvents: "auto" });
        gsap.fromTo(menuOverlayRef.current,
          { clipPath: "circle(0% at 95% 5%)" },
          { clipPath: "circle(150% at 95% 5%)", duration: 0.65, ease: "power3.inOut" }
        );
      }

      // ── ロゴ中央移動 ──
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

      // ── メイン右シフト（デスクトップ）──
      if (mainRef.current && window.innerWidth >= 1024) {
        gsap.to(mainRef.current, { x: 50, duration: 0.35, ease: "power2.out" });
      }

      // ── ゴールドライン（左→右）──
      if (menuGoldLineRef.current) {
        gsap.fromTo(menuGoldLineRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.45, ease: "power2.inOut", delay: 0.3 }
        );
      }

      // ── ナビアイテム ──
      if (navItems.length > 0) {
        gsap.fromTo(navItems,
          { x: 40, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.06, duration: 0.3, ease: "power2.out", delay: 0.35 }
        );
      }

      // ── 予約ボタン ──
      if (menuReserveBtnRef.current) {
        gsap.fromTo(menuReserveBtnRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", delay: 0.65 }
        );
      }

    } else {
      // ── アイコンリセット（Close）──
      if (topLineRef.current) {
        gsap.to(topLineRef.current, { rotation: 0, transformOrigin: "center center", duration: 0.4, ease: "power2.inOut" });
      }
      if (bottomLineRef.current) {
        gsap.to(bottomLineRef.current, { rotation: 0, transformOrigin: "center center", duration: 0.4, ease: "power2.inOut" });
      }

      // ── 予約ボタン ──
      if (menuReserveBtnRef.current) {
        gsap.to(menuReserveBtnRef.current, { opacity: 0, y: 8, duration: 0.18, ease: "power2.in" });
      }

      // ── ナビアイテム ──
      if (navItems.length > 0) {
        gsap.to(navItems, {
          x: 40, opacity: 0,
          stagger: { each: 0.05, from: "end" },
          duration: 0.2,
          ease: "power2.in",
        });
      }

      // ── ゴールドライン ──
      if (menuGoldLineRef.current) {
        gsap.to(menuGoldLineRef.current, { scaleX: 0, duration: 0.25, ease: "power2.in" });
      }

      // ── ロゴ戻す ──
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

      // ── メイン戻す（デスクトップ）──
      if (mainRef.current && window.innerWidth >= 1024) {
        gsap.to(mainRef.current, { x: 0, duration: 0.3, ease: "power2.out", delay: 0.1, clearProps: "transform" });
      }

      // ── クリップパス縮小 → スクロール復元 ──
      if (menuOverlayRef.current) {
        gsap.to(menuOverlayRef.current, {
          clipPath: "circle(0% at 95% 5%)",
          duration: 0.5,
          ease: "power3.inOut",
          delay: 0.15,
          onComplete: () => {
            if (menuOverlayRef.current) gsap.set(menuOverlayRef.current, { pointerEvents: "none" });
            // iOS Safari スクロールロック解除
            // scroll-behavior:smooth を一時無効にして即時復元（有効だと 0→savedY のアニメーションが見える）
            const pending = pendingScrollRef.current;
            pendingScrollRef.current = null;
            if (document.body.style.position === "fixed") {
              const savedY = menuScrollYRef.current;
              document.documentElement.style.scrollBehavior = 'auto';
              document.body.style.position = "";
              document.body.style.width = "";
              document.body.style.top = "";
              window.scrollTo(0, savedY); // 即時復元（アニメーションなし）
              document.documentElement.style.scrollBehavior = '';
            }
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            const headerEl = document.querySelector("header") as HTMLElement | null;
            if (headerEl) headerEl.style.paddingRight = "";
            // 保留中のスクロールターゲットがあればここでスムーズ遷移
            if (pending) setTimeout(() => smoothScrollTo(pending), 16);
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
          const dir = el.dataset.revealDir || "";
          const tag = el.tagName.toLowerCase();
          const isHeading = /^h[1-6]$/.test(tag);
          const isLabel = tag === "span";

          if (isHeading) {
            // セクションタイトル：opacity + y（高さ0でも確実に発火）
            gsap.fromTo(el,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 1.3, delay, ease: "power4.out" }
            );
          } else if (isLabel) {
            // セクションラベル：opacity フェード
            gsap.fromTo(el,
              { opacity: 0, y: -4 },
              { opacity: 1, y: 0, duration: 0.9, delay, ease: "power3.out" }
            );
          } else if (dir === "right") {
            // 画像：opacity + カーテン + 微ズームアウト
            gsap.to(el, {
              opacity: 1,
              clipPath: "inset(0 0 0% 0)",
              scale: 1.0,
              duration: 1.5,
              delay,
              ease: "power3.inOut",
              onComplete: () => { gsap.set(el, { clearProps: "clipPath,scale" }); },
            });
          } else if (dir === "left") {
            gsap.to(el, {
              opacity: 1,
              x: 0,
              duration: 1.2,
              delay,
              ease: "power3.out",
            });
          } else {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 1.1,
              delay,
              ease: "power3.out",
            });
          }
          observer.unobserve(el);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const dir = el.dataset.revealDir || "";
      const isHeading = /^h[1-6]$/.test(tag);
      const isLabel = tag === "span";
      if (isHeading || isLabel) {
        gsap.set(el, { opacity: 0 });
      } else if (dir === "right") {
        gsap.set(el, { opacity: 0, clipPath: "inset(0 0 100% 0)", scale: 1.06 });
      } else if (dir === "left") {
        gsap.set(el, { opacity: 0, x: -24 });
      } else {
        gsap.set(el, { opacity: 0, y: 20 });
      }
      observer.observe(el);
    });

    // スクロール復元時など、すでに画面外（上）に出た要素は即座に表示
    requestAnimationFrame(() => {
      targets.forEach(el => {
        if (el.getBoundingClientRect().bottom < 0) {
          observer.unobserve(el);
          gsap.set(el, { clearProps: "opacity,y,x,clipPath,scale" });
        }
      });
    });

    return () => observer.disconnect();
  }, []);

  // ─── About セクション：縦線→テキスト シーケンシャルアニメーション ───
  useEffect(() => {
    if (!about.content) return; // CMS未ロード時はスキップ

    const lineEl = aboutLineRef.current;
    const textEl = aboutTextRef.current;
    if (!lineEl || !textEl) return;

    // observer は一度だけ起動
    if (aboutObservedRef.current) return;
    aboutObservedRef.current = true;

    gsap.set(lineEl, { scaleY: 0, transformOrigin: "top center" });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const paras = Array.from(textEl.querySelectorAll("[data-about-line]")) as HTMLElement[];
          gsap.to(lineEl, { scaleY: 1, duration: 0.9, ease: "power3.inOut" });
          if (paras.length > 0) {
            gsap.fromTo(paras,
              { opacity: 0, y: 10 },
              {
                opacity: 1, y: 0,
                duration: 0.5,
                stagger: { each: 0.07, ease: "power2.in" },
                ease: "power3.out",
                delay: 0.5,
              }
            );
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -22% 0px" }
    );

    observer.observe(textEl);
    return () => observer.disconnect();
  }, [about.content]);

  // ─── ギャラリーグリッド cascade reveal ───
  useEffect(() => {
    const items = galleryItemRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const container = galleryGridRef.current;
    if (items.length === 0 || !container) return;

    items.forEach(item => gsap.set(item, { opacity: 0, clipPath: "inset(0 0 100% 0)", scale: 1.06 }));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const tl = gsap.timeline();
          if (items[0]) {
            tl.to(items[0], {
              opacity: 1, clipPath: "inset(0 0 0% 0)", scale: 1.0,
              duration: 1.3, ease: "power3.inOut",
              onComplete: () => { gsap.set(items[0], { clearProps: "clipPath,scale" }); },
            });
          }
          if (items.length > 1) {
            tl.to(
              items.slice(1),
              {
                opacity: 1, clipPath: "inset(0 0 0% 0)", scale: 1.0,
                duration: 0.95,
                stagger: { each: 0.08, from: "start" },
                ease: "power3.inOut",
                onComplete: () => { items.slice(1).forEach(it => gsap.set(it, { clearProps: "clipPath,scale" })); },
              },
              "-=0.55"
            );
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(container);

    // すでに画面外（上）の場合は即表示
    requestAnimationFrame(() => {
      if (container.getBoundingClientRect().bottom < 0) {
        observer.unobserve(container);
        items.forEach(item => gsap.set(item, { clearProps: "opacity,clipPath,scale" }));
      }
    });

    return () => observer.disconnect();
  }, [galleryImages]);

  // ─── メニューアコーディオン行 cascade reveal（CMS読込後） ────
  useEffect(() => {
    if (menuCats.length === 0) return;
    const rows = Array.from(document.querySelectorAll("[data-menu-row]")) as HTMLElement[];
    if (rows.length === 0) return;

    rows.forEach(r => gsap.set(r, { opacity: 0, x: 28 }));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        gsap.fromTo(rows,
          { opacity: 0, x: 28 },
          {
            opacity: 1, x: 0,
            duration: 0.6,
            stagger: { each: 0.1, ease: "power2.in" },
            ease: "power3.out",
          }
        );
      });
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });

    if (rows[0]) observer.observe(rows[0]);
    return () => observer.disconnect();
  }, [menuCats]);

  // ─── トップへ戻るボタン ──────────────────────────────────────
  useEffect(() => {
    const btn = backToTopRef.current;
    if (!btn) return;
    let visible = false;
    const HERO_H = window.innerHeight - 64; // ヘッダー下部にAboutセクションが来た時点
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

  // ─── ヒーロー背景パララックス（scroll Y + mouse X） ─────────
  useEffect(() => {
    const bg = heroBgRef.current;
    if (!bg) return;

    // スクロール → Y 軸移動
    const onScroll = () => {
      gsap.set(bg, { y: window.scrollY * 0.18 });
    };

    // マウス → X 軸微移動（ヒーロー表示中のみ）
    const onMouse = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 0.8) return;
      const dx = ((e.clientX - window.innerWidth / 2) / window.innerWidth) * 2;
      gsap.to(bg, { x: dx * 14, duration: 2.0, ease: "power2.out" });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);


  // ─── ヘッダー：スクロール後に背景表示 ──────────────────────
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 80) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Escape キーでメニューを閉じる ──────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  // ─── リッチアニメーション（ScrollTrigger + カーソル + チルト） ──
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let introPlayed = false;
    try { introPlayed = sessionStorage.getItem('hairholic_intro') === '1'; } catch {}

    ScrollTrigger.config({ limitCallbacks: true });

    const cleanups: (() => void)[] = [];

    // ── GSAP ScrollTrigger アニメーション ──
    const ctx = gsap.context(() => {

      // 1-1. Hero 背景ズームアウト（初回訪問のみ）
      if (!introPlayed && heroBgRef.current) {
        gsap.fromTo(heroBgRef.current,
          { scale: 1.12 },
          { scale: 1, duration: 2.5, ease: "power2.out", delay: 0.5 }
        );
      }

      // 1-3. Hero スクロールフェードアウト
      gsap.to("#hero", {
        opacity: 0,
        scale: 0.97,
        scrollTrigger: {
          trigger: "#hero",
          start: "65% top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 7-1. 予約ゴールドライン
      const resLines = gsap.utils.toArray<HTMLElement>(".reservation-line-top, .reservation-line-bottom");
      if (resLines.length > 0) {
        gsap.to(resLines, {
          scaleX: 1,
          duration: 1.0,
          ease: "power3.inOut",
          stagger: 0.3,
          scrollTrigger: { trigger: "#reservation", start: "top 80%" },
        });
      }

      // 9. セクション区切りライン
      gsap.utils.toArray<HTMLElement>(".section-divider-line").forEach(line => {
        gsap.to(line, {
          width: "80%",
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: { trigger: line, start: "top 85%" },
        });
      });
    });

    // 4-1. スタッフカード 3D チルト（イベントデリゲーション）
    let activeCard: HTMLElement | null = null;
    const onDocMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest("[data-staff-card]") as HTMLElement | null;
      if (card) {
        activeCard = card;
        const rect = card.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateY: cx * 7, rotateX: -cy * 7,
          transformPerspective: 900, duration: 0.35, ease: "power2.out",
        });
      } else if (activeCard) {
        gsap.to(activeCard, {
          rotateX: 0, rotateY: 0, duration: 0.6,
          ease: "elastic.out(1, 0.5)", clearProps: "transform",
        });
        activeCard = null;
      }
    };
    document.addEventListener("mousemove", onDocMove);
    cleanups.push(() => document.removeEventListener("mousemove", onDocMove));

    // 10. カスタムカーソル
    const cursor = document.querySelector(".custom-cursor") as HTMLElement | null;
    const cursorDot = document.querySelector(".custom-cursor-dot") as HTMLElement | null;
    if (cursor && cursorDot) {
      let initialized = false;
      const onMove = (e: MouseEvent) => {
        if (!initialized) {
          gsap.set([cursor, cursorDot], { opacity: 1 });
          gsap.set(cursor, { x: e.clientX, y: e.clientY });
          gsap.set(cursorDot, { x: e.clientX, y: e.clientY });
          initialized = true;
        }
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.5, ease: "power3.out" });
        gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
      };
      const onOver = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest("a, button")) {
          gsap.to(cursor, { scale: 2.5, opacity: 0.5, duration: 0.25 });
        }
      };
      const onOut = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest("a, button")) {
          gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.25 });
        }
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseover", onOver);
      document.addEventListener("mouseout", onOut);
      cleanups.push(
        () => document.removeEventListener("mousemove", onMove),
        () => document.removeEventListener("mouseover", onOver),
        () => document.removeEventListener("mouseout", onOut),
      );
    }

    return () => {
      ctx.revert();
      cleanups.forEach(fn => fn());
    };
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
          gsap.fromTo(items,
            { opacity: 0, y: 16, scale: 0.94 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.42,
              stagger: { amount: 0.22, from: "start" },
              ease: "back.out(1.4)",
              delay: 0.08,
            }
          );
        }
      }, 20);
    }
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
      {/* ── カスタムカーソル（デスクトップのみ）── */}
      <div
        className="custom-cursor fixed top-0 left-0 pointer-events-none z-9999 hidden md:block"
        style={{ width: "12px", height: "12px", borderRadius: "50%", border: "1px solid oklch(0.78 0.12 75)", transform: "translate(-50%, -50%)", opacity: 0 }}
      />
      <div
        className="custom-cursor-dot fixed top-0 left-0 pointer-events-none z-9999 hidden md:block"
        style={{ width: "4px", height: "4px", borderRadius: "50%", background: "oklch(0.78 0.12 75)", transform: "translate(-50%, -50%)", opacity: 0 }}
      />

      {/* ─── HEADER ─────────────────────────────────── */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[1000]"
      >
        <nav className="flex justify-between items-center px-[5%] py-4 max-w-[1400px] mx-auto relative">

          {/* ── ロゴ ── */}
          <a
            ref={logoRef}
            href="/"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="font-serif text-white no-underline inline-flex shrink-0 cursor-pointer"
            style={{ fontSize: "1.6rem", fontWeight: 400, letterSpacing: "0.12em" }}
          >
            {"HAIRHOLIC".split("").map((letter, i) => (
              <span key={i} ref={el => { logoLettersRef.current[i] = el; }}>{letter}</span>
            ))}
          </a>

          {/* ── デスクトップナビ（lg+） ── */}
          <ul className="hidden lg:flex items-center gap-10 list-none m-0 p-0">
            {navSections.map(({ id, en }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => { e.preventDefault(); smoothScrollTo(id); }}
                  className="text-foreground/60 hover:text-primary transition-colors duration-200 no-underline font-sans font-medium"
                  style={{ fontSize: "0.68rem", letterSpacing: "0.28em", textTransform: "uppercase" }}
                >
                  {en}
                </a>
              </li>
            ))}
          </ul>

          {/* ── 右側：ハンバーガー（モバイルのみ） ── */}
          <div className="flex items-center gap-4">
            {/* ハンバーガー（モバイルのみ） */}
            <button
              onClick={() => {
                const willOpen = !mobileMenuOpen;
                if (willOpen) {
                  // useEffect（再描画後）より前に即座にスクロールロックを適用
                  menuScrollYRef.current = window.scrollY;
                  if (window.innerWidth < 1024) {
                    document.body.style.top = `-${menuScrollYRef.current}px`;
                    document.body.style.position = "fixed";
                    document.body.style.width = "100%";
                  }
                  document.body.style.overflow = "hidden";
                }
                setMobileMenuOpen(willOpen);
              }}
              aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={mobileMenuOpen}
              className="hamburger-btn relative bg-transparent border-0 cursor-pointer z-[1100] lg:hidden"
              style={{ width: "36px", height: "36px" }}
            >
              {/* Top line */}
              <span
                ref={topLineRef}
                className="absolute block"
                style={{
                  width: "22px", height: "1px",
                  background: "white",
                  top: "13px", left: "7px",
                  transformOrigin: "center center",
                }}
              />
              {/* Bottom line */}
              <span
                ref={bottomLineRef}
                className="absolute block"
                style={{
                  width: "22px", height: "1px",
                  background: "white",
                  top: "22px", left: "7px",
                  transformOrigin: "center center",
                }}
              />
            </button>
          </div>

        </nav>
      </header>

      {/* ─── フルスクリーン メニューオーバーレイ ─────────────────── */}
      <div
        ref={menuOverlayRef}
        className="fixed inset-0 z-[999] flex"
        style={{ clipPath: "circle(0% at 95% 5%)", background: "oklch(0.13 0.005 60)", pointerEvents: "none" }}
      >
        {/* ── 左パネル（装飾・md以上で表示）── */}
        <div className="hidden md:flex w-[40%] items-center justify-center border-r border-primary/10 shrink-0">
          <span
            className="font-serif font-light"
            style={{
              writingMode: "vertical-rl",
              fontSize: "clamp(1rem, 2.5vw, 1.8rem)",
              letterSpacing: "0.35em",
              color: "oklch(0.78 0.12 75 / 0.07)",
            }}
          >
            HAIRHOLIC
          </span>
        </div>

        {/* ── 右パネル（ナビ）── */}
        <div className="flex-1 flex flex-col justify-center px-10 sm:px-14 md:px-16 py-24">
          {/* ゴールド水平線 */}
          <div
            ref={menuGoldLineRef}
            className="mb-10"
            style={{
              height: "1px",
              background: "oklch(0.78 0.12 75 / 0.35)",
              transformOrigin: "left center",
              transform: "scaleX(0)",
            }}
          />

          {/* ナビリスト */}
          <ul className="list-none m-0 p-0 mb-10">
            {navSections.map(({ id, label, en }, i) => (
              <li
                key={id}
                ref={el => { menuNavItemsRef.current[i] = el; }}
                className="border-b border-primary/10"
              >
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    pendingScrollRef.current = id;
                    setMobileMenuOpen(false);
                  }}
                  className="menu-nav-link flex items-baseline gap-4 py-5 no-underline text-foreground"
                >
                  <span className="menu-nav-index font-sans text-[0.58rem] tracking-[0.2em] text-primary shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="menu-nav-label font-serif text-3xl font-light tracking-wider leading-none flex-1">
                    {label}
                  </span>
                  <span className="font-sans text-primary text-[0.58rem] tracking-[0.3em] font-semibold uppercase opacity-60 shrink-0">
                    {en}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* 予約ボタン */}
          <a
            ref={menuReserveBtnRef}
            href="#reservation"
            onClick={(e) => {
              e.preventDefault();
              pendingScrollRef.current = "reservation";
              setMobileMenuOpen(false);
            }}
            className="block py-4 w-full max-w-xs text-center bg-primary text-primary-foreground no-underline text-xs font-semibold tracking-[0.2em] uppercase"
          >
            ご予約はこちら
          </a>
        </div>
      </div>

      <main ref={mainRef}>

        {/* ─── HERO ─────────────────────────────────── */}
        <section id="hero" className="relative h-screen w-full overflow-hidden bg-background">
          {/* JS パララックス背景 */}
          <div
            ref={heroBgRef}
            className="absolute left-0 right-0"
            style={{
              top: "-8%", height: "116%",
              backgroundImage: `url('${settings.heroBgImage?.url ?? '/images/hero-bg.jpg'}')`,
              backgroundSize: "cover", backgroundPosition: "center 40%",
              zIndex: 0, willChange: "transform",
            }}
          />
          {/* ボトムグラデーション（スクロール誘導の可読性用） */}
          <div
            className="absolute inset-x-0 bottom-0 h-64 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(10,10,10,0.75), transparent)", zIndex: 1 }}
          />
          {/* 常時表示の暗いオーバーレイ（コントラスト確保） */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "rgba(0,0,0,0.52)", zIndex: 1 }}
          />
          {/* 入場アニメーション用フルオーバーレイ */}
          <div
            ref={heroFullOverlayRef}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "rgba(10,10,10,0.92)", zIndex: 2 }}
          />

          {/* コンテンツ */}
          <div
            className="relative flex flex-col items-center justify-center h-full px-6 text-center"
            style={{ zIndex: 3 }}
          >
            {/* サブラベル（タイトル上） */}
            <p
              ref={heroSubtitleRef}
              className="font-sans m-0 mb-8"
              style={{
                color: "rgba(200,169,110,0.85)",
                fontSize: "clamp(0.72rem, 1.6vw, 0.88rem)",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                clipPath: "inset(0 105% 0 0)",
              }}
            >
              Men&apos;s Barber in Nagasaki
            </p>

            {/* タイトル */}
            <div ref={heroTitleRef} className="mb-6">
              <h1
                className="font-serif hero-title inline-flex"
                style={{
                  fontSize: "clamp(2.8rem, 9vw, 11rem)",
                  fontWeight: 300,
                  letterSpacing: "0.12em",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {"HAIRHOLIC".split("").map((letter, i) => (
                  <span key={i} ref={el => { heroLetterRefs.current[i] = el; }} style={{ display: "inline-block" }}>
                    {letter}
                  </span>
                ))}
              </h1>
            </div>

            {/* ゴールドディバイダー */}
            <div className="w-16 h-px mb-4" style={{ background: "rgba(200,169,110,0.5)" }} />

            {/* EST. */}
            <p
              className="font-sans m-0 mb-10"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", letterSpacing: "0.4em", textTransform: "uppercase" }}
            >
              Est. 2023
            </p>

            {/* 予約ボタン */}
            <a
              ref={heroButtonRef}
              href="#reservation"
              className="inline-block border border-primary text-primary no-underline text-xs font-sans font-medium tracking-[0.3em] uppercase transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
              style={{ padding: "14px 48px" }}
              onClick={(e) => { e.preventDefault(); smoothScrollTo("reservation"); }}
            >
              ご予約はこちら
            </a>
          </div>

          {/* スクロール誘導（縦ライン + CSS アニメーションドット） */}
          <div
            ref={scrollIconRef}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer"
            style={{ zIndex: 3 }}
            onClick={() => smoothScrollTo("about")}
          >
            <span
              className="font-sans"
              style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.55rem", letterSpacing: "0.35em", textTransform: "uppercase" }}
            >
              Scroll
            </span>
            <div className="w-px h-14 relative overflow-hidden" style={{ background: "rgba(200,169,110,0.2)" }}>
              <div className="w-px h-5 absolute top-0 left-0 hero-scroll-dot" style={{ background: "rgba(200,169,110,0.8)" }} />
            </div>
          </div>

          <style>{`
            .hero-title {
              color: rgba(255, 255, 255, 0.95);
              text-shadow: 0 2px 40px rgba(0, 0, 0, 0.4);
            }
            @keyframes heroScrollDown {
              0%   { transform: translateY(-100%); opacity: 0; }
              20%  { opacity: 1; }
              80%  { opacity: 1; }
              100% { transform: translateY(350%); opacity: 0; }
            }
            .hero-scroll-dot {
              animation: heroScrollDown 2.4s cubic-bezier(0.76, 0, 0.24, 1) infinite;
            }
          `}</style>
        </section>

        <div>

          {/* ── ABOUT ── */}
          <section id="about" className="py-28 md:py-40 lg:py-52 bg-background">
            <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
              {/* 見出し */}
              <div className="mb-16 md:mb-24">
                <span className="block mb-4 text-xs tracking-[0.45em] uppercase text-primary" data-reveal>About</span>
                <div className="w-10 h-px bg-primary mb-8" />
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-wider text-foreground m-0 leading-[1.1]" data-reveal data-reveal-delay="0.1">
                  {settings.aboutTitle}
                </h2>
              </div>
              {/* グリッド：画像 + テキスト */}
              <div className="grid lg:grid-cols-[5fr_7fr] gap-16 lg:gap-20 items-center">
                {/* 画像 */}
                <div
                  className="overflow-hidden border border-primary/20"
                  data-reveal data-reveal-delay="0.15"
                >
                  <img
                    src={about.image?.url ? `${about.image.url}?w=800&q=80` : "https://images.unsplash.com/photo-1599351507-9efdc63de3b5?w=800&h=600&fit=crop"}
                    alt="HAIRHOLICの店内"
                    className="w-full block object-cover transition-transform duration-700 hover:scale-105 aspect-3/2 lg:aspect-4/3"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = "none";
                      if (img.parentElement) img.parentElement.style.background = "oklch(0.22 0.005 60)";
                    }}
                  />
                </div>
                {/* テキスト */}
                <div ref={aboutTextRef} className="relative pl-8 md:pl-10">
                  <div ref={aboutLineRef} className="absolute left-0 top-0 w-px h-full bg-primary/40" />
                  <div className="flex flex-col gap-6">
                    {renderAboutContent(about.content)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── セクション区切り ── */}
          <div className="section-divider w-full flex justify-center py-3">
            <div className="section-divider-line h-px bg-primary/30" style={{ width: 0 }} />
          </div>

          {/* ── MENU ── */}
          <section id="menu" className="py-28 md:py-36 bg-secondary">
            <div className="mx-auto max-w-6xl px-6">
              {/* 見出し */}
              <div className="mb-16">
                <p className="mb-3 text-xs tracking-[0.4em] uppercase text-primary" data-reveal>Menu</p>
                <div className="w-12 h-px bg-primary mb-6" />
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-wider text-foreground text-balance m-0" data-reveal data-reveal-delay="0.1">
                  {settings.menuTitle}
                </h2>
              </div>
              {/* アコーディオン */}
              <div className="flex flex-col gap-2.5">
                {menuCats.map((category) => {
                  const key = category.categoryKey;
                  const isOpen = openKey === key;
                  return (
                    <div
                      key={category.id}
                      data-menu-row
                      className="overflow-hidden transition-colors duration-300"
                      style={{
                        background: "oklch(0.17 0.005 60)",
                        border: `1px solid ${isOpen ? "oklch(0.78 0.12 75)" : "oklch(0.28 0.01 60)"}`,
                      }}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex justify-between items-center px-6 py-5 bg-transparent border-0 cursor-pointer transition-colors duration-300"
                        style={{ color: isOpen ? "oklch(0.78 0.12 75)" : "oklch(0.93 0.01 80)" }}
                      >
                        <span className="font-serif text-lg font-light tracking-[0.15em]">
                          {category.categoryTitle}
                        </span>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"
                          className="shrink-0 transition-transform duration-300"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        >
                          <path d="M5 7.5L10 12.5L15 7.5" stroke={isOpen ? "oklch(0.78 0.12 75)" : "oklch(0.60 0.02 70)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div className="mx-6 h-px bg-border" style={{ opacity: isOpen ? 1 : 0, transition: isOpen ? "opacity 0.25s ease 0.1s" : "opacity 0.15s ease" }} />
                      <div style={{
                        display: "grid",
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                        transition: isOpen ? "grid-template-rows 0.4s cubic-bezier(0.4,0,0.2,1)" : "grid-template-rows 0.3s cubic-bezier(0.4,0,0.6,1)",
                      }}>
                        <div style={{ minHeight: 0, overflow: "hidden", opacity: isOpen ? 1 : 0, transition: isOpen ? "opacity 0.3s ease 0.1s" : "opacity 0.15s ease" }}>
                          <div data-accordion-key={key} className="px-6 pt-5 pb-6 max-w-3xl">
                            <div className="flex flex-col gap-5">
                              {category.items.map((item, itemIdx) => (
                                <div
                                  key={item.fieldId ?? `${category.id}-item-${itemIdx}`}
                                  data-menu-item
                                  className="border-b border-border pb-5 transition-colors duration-200 hover:border-primary/50"
                                >
                                  <div className="flex items-baseline gap-3">
                                    <span className="text-sm md:text-base text-foreground leading-relaxed max-w-[55%] md:max-w-[65%]">
                                      {item.title.split('+').map((part, j, arr) => (
                                        <span key={j}>
                                          {part.trim()}
                                          {j < arr.length - 1 && (
                                            <span className="text-primary/50 mx-1">/</span>
                                          )}
                                        </span>
                                      ))}
                                    </span>
                                    <span className="flex-1 border-b border-dotted border-border/40 mb-1 min-w-8" />
                                    <span className="font-serif text-lg text-primary whitespace-nowrap shrink-0">
                                      {item.price}
                                    </span>
                                  </div>
                                  {item.comment && (
                                    <span className="text-xs text-muted-foreground block mt-2 leading-relaxed">
                                      {item.comment}
                                    </span>
                                  )}
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
              <p className="text-xs text-muted-foreground text-center mt-10">※ 料金はすべて税込表示です。</p>
            </div>
          </section>

          {/* ── セクション区切り ── */}
          <div className="section-divider w-full flex justify-center py-3">
            <div className="section-divider-line h-px bg-primary/30" style={{ width: 0 }} />
          </div>

          {/* ── STAFF ── */}
          <section id="staff" className="py-28 md:py-36 bg-background">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-16">
                <p className="mb-3 text-xs tracking-[0.4em] uppercase text-primary" data-reveal>Staff</p>
                <div className="w-12 h-px bg-primary mb-6" />
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-wider text-foreground text-balance m-0" data-reveal data-reveal-delay="0.1">
                  {settings.staffTitle}
                </h2>
              </div>
              <StaffSection staff={staff} />
            </div>
          </section>

          {/* ── セクション区切り ── */}
          <div className="section-divider w-full flex justify-center py-3">
            <div className="section-divider-line h-px bg-primary/30" style={{ width: 0 }} />
          </div>

          {/* ── GALLERY ── */}
          <section id="gallery" className="py-28 md:py-36 bg-secondary">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-16">
                <p className="mb-3 text-xs tracking-[0.4em] uppercase text-primary" data-reveal>Gallery</p>
                <div className="w-12 h-px bg-primary mb-6" />
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-wider text-foreground text-balance m-0" data-reveal data-reveal-delay="0.1">
                  {settings.galleryTitle}
                </h2>
              </div>
              <style>{`
                .gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 48px; }
                .gallery-item { aspect-ratio: 1; overflow: hidden; background: oklch(0.20 0.005 60); cursor: pointer; position: relative; }
                @media (min-width: 640px) { .gallery-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (min-width: 1024px) {
                  .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
                  .gallery-item { aspect-ratio: 1; }
                  .gallery-item:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 3; aspect-ratio: unset; }
                }
              `}</style>
              <div ref={galleryGridRef} className="gallery-grid">
                {galleryImages.map((src, i) => (
                  <div
                    key={i}
                    ref={el => { galleryItemRefs.current[i] = el; }}
                    className="gallery-item"
                    onMouseEnter={e => {
                      if (!window.matchMedia('(hover: hover)').matches) return;
                      const el = e.currentTarget;
                      const img = el.querySelector("img") as HTMLElement | null;
                      if (img) gsap.to(img, { scale: 1.05, duration: 0.7, ease: "power2.out" });
                      const ov = el.querySelector("[data-gallery-overlay]") as HTMLElement | null;
                      if (ov) gsap.to(ov, { opacity: 1, duration: 0.5 });
                    }}
                    onMouseLeave={e => {
                      if (!window.matchMedia('(hover: hover)').matches) return;
                      const el = e.currentTarget;
                      const img = el.querySelector("img") as HTMLElement | null;
                      if (img) gsap.to(img, { scale: 1, duration: 0.7, ease: "power2.out" });
                      const ov = el.querySelector("[data-gallery-overlay]") as HTMLElement | null;
                      if (ov) gsap.to(ov, { opacity: 0, duration: 0.5 });
                    }}
                  >
                    <img
                      src={src}
                      alt={`ギャラリー ${i + 1}`}
                      className="w-full h-full object-cover block"
                      onError={e => {
                        const img = e.currentTarget;
                        img.style.display = "none";
                        if (img.parentElement) img.parentElement.style.background = "oklch(0.22 0.005 60)";
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)" }} />
                    <div data-gallery-overlay className="absolute inset-0 bg-background/30 opacity-0 pointer-events-none flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/80">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <a
                  href="https://www.instagram.com/hairholic_nagasaki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 border border-border text-muted-foreground no-underline text-xs font-sans tracking-[0.2em] uppercase transition-colors duration-300 hover:border-primary hover:text-primary px-8 py-3"
                  data-reveal
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  Instagram で最新情報をチェック
                </a>
              </div>
            </div>
          </section>

          {/* ── セクション区切り ── */}
          <div className="section-divider w-full flex justify-center py-3">
            <div className="section-divider-line h-px bg-primary/30" style={{ width: 0 }} />
          </div>

          {/* ── ACCESS ── */}
          <section id="access" className="py-28 md:py-36 bg-background">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-16">
                <p className="mb-3 text-xs tracking-[0.4em] uppercase text-primary" data-reveal>Access</p>
                <div className="w-12 h-px bg-primary mb-6" />
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-wider text-foreground text-balance m-0" data-reveal data-reveal-delay="0.1">
                  {settings.accessTitle}
                </h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-14 items-start">

                {/* ─ サロン情報 ─ */}
                <div data-reveal data-reveal-dir="left">
                  {[
                    { label: "電話番号", content: <a href={`tel:${access.tel}`} className="text-primary text-sm no-underline border-b border-primary/40 pb-px">{access.tel}</a> },
                    { label: "住所",     content: <p className="text-sm text-muted-foreground leading-relaxed m-0">{access.address}</p> },
                    { label: "アクセス", content: <p className="text-sm text-muted-foreground leading-relaxed m-0">{access.directions}</p> },
                    { label: "営業時間", content: <p className="text-sm text-muted-foreground leading-relaxed m-0">{access.hours}</p> },
                    { label: "定休日",   content: <p className="text-sm text-muted-foreground leading-relaxed m-0">{access.regularHoliday}</p> },
                    { label: "支払い",   content: <p className="text-sm text-muted-foreground leading-relaxed m-0">{access.payment}</p> },
                    { label: "その他",   content: <p className="text-sm text-muted-foreground leading-relaxed m-0">{access.notes}</p> },
                  ].map(({ label, content }, idx, arr) => (
                    <div key={label} className={`flex items-start gap-4 py-4 ${idx < arr.length - 1 ? "border-b border-border" : ""}`}>
                      <span className="text-xs tracking-wider text-muted-foreground shrink-0 w-16 pt-0.5">{label}</span>
                      <div className="flex-1">{content}</div>
                    </div>
                  ))}
                </div>

                {/* ─ Google Map ─ */}
                <div data-reveal data-reveal-delay="0.1">
                  <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Map</p>
                  <div className="overflow-hidden border border-primary/20 mb-4">
                    <iframe
                      src={access.mapEmbedSrc}
                      width="100%" height="360"
                      style={{ border: 0, display: "block" }}
                      allowFullScreen loading="eager"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="HAIRHOLIC の地図"
                    />
                  </div>
                  <a
                    href={access.mapLink}
                    target="_blank" rel="noopener noreferrer"
                    className="text-primary text-xs no-underline tracking-[0.15em] uppercase border-b border-primary/40 pb-px"
                  >
                    Google Maps で開く →
                  </a>
                </div>

              </div>
            </div>
          </section>

        </div>

      </main>

      {/* ─── RESERVATION ─────────────────────────────── */}
      <section
        id="reservation"
        className="relative py-32 md:py-44 flex items-center justify-center overflow-hidden"
        style={{
          background: "oklch(0.10 0.005 60)",
          borderTop: "1px solid oklch(0.22 0.005 60)",
          borderBottom: "1px solid oklch(0.22 0.005 60)",
        }}
      >

        <div className="relative text-center px-6 max-w-2xl mx-auto w-full">
          {/* ラベル */}
          <span
            className="block mb-6 text-xs tracking-[0.5em] uppercase"
            style={{ color: "oklch(0.78 0.12 75)" }}
            data-reveal
          >
            Reservation
          </span>

          {/* 装飾ライン（上） */}
          <div
            className="reservation-line-top h-px bg-primary/40 mx-auto my-5"
            style={{ width: "4rem", transform: "scaleX(0)", transformOrigin: "center" }}
          />

          {/* 見出し */}
          <h2
            className="font-serif font-light text-foreground m-0 mb-4"
            style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", letterSpacing: "0.08em", lineHeight: 1.05 }}
            data-reveal data-reveal-delay="0.1"
          >
            ご予約
          </h2>

          {/* 装飾ライン（下） */}
          <div
            className="reservation-line-bottom h-px bg-primary/40 mx-auto mb-5"
            style={{ width: "4rem", transform: "scaleX(0)", transformOrigin: "center" }}
          />

          {/* 説明 */}
          <p
            className="text-sm md:text-base leading-relaxed mb-10 mx-auto"
            style={{ color: "rgba(200,200,200,0.65)", maxWidth: "440px", letterSpacing: "0.04em" }}
            data-reveal data-reveal-delay="0.2"
          >
            お電話またはオンラインにて承っております。<br />
            ご不明な点もお気軽にご相談ください。
          </p>

          {/* ボタン */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            data-reveal data-reveal-delay="0.28"
          >
            {/* 電話 */}
            <a
              href={`tel:${access.tel}`}
              className="reserve-cta inline-flex items-center gap-3 no-underline font-sans font-medium tracking-[0.22em] uppercase transition-colors duration-300 hover:bg-primary/10"
              style={{
                fontSize: "0.72rem",
                padding: "14px 32px",
                border: "1px solid oklch(0.78 0.12 75 / 0.6)",
                color: "oklch(0.78 0.12 75)",
                minWidth: "220px",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.74a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              電話で予約する
            </a>

            {/* オンライン */}
            <a
              href="https://beauty.hotpepper.jp/slnH000629108/"
              target="_blank"
              rel="noopener noreferrer"
              className="reserve-cta inline-flex items-center gap-3 no-underline font-sans font-medium tracking-[0.22em] uppercase transition-colors duration-300 hover:brightness-110"
              style={{
                fontSize: "0.72rem",
                padding: "14px 32px",
                background: "oklch(0.78 0.12 75)",
                color: "oklch(0.13 0.005 60)",
                minWidth: "220px",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              オンライン予約
            </a>
          </div>

          {/* TEL 表示 */}
          {access.tel && (
            <p
              className="mt-10"
              style={{ color: "rgba(200,200,200,0.38)", fontSize: "0.7rem", letterSpacing: "0.2em" }}
              data-reveal data-reveal-delay="0.38"
            >
              TEL&ensp;
              <a
                href={`tel:${access.tel}`}
                className="no-underline transition-colors duration-200 hover:text-primary"
                style={{ color: "rgba(200,200,200,0.55)", letterSpacing: "0.12em" }}
              >
                {access.tel}
              </a>
            </p>
          )}
        </div>
      </section>

      {/* ─── FloatingReserveButton ───────────────────── */}
      <FloatingReserveButton />

      {/* ─── トップへ戻るボタン ───────────────────────── */}
      <button
        ref={backToTopRef}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="トップへ戻る"
        className="fixed bottom-20 right-6 z-900 w-11 h-11 flex items-center justify-center border border-primary/50 bg-background/85 backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:bg-primary/15 hover:border-primary"
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        {/* スクロールプログレスリング */}
        <svg className="back-to-top-progress absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="19" fill="none" stroke="oklch(0.78 0.12 75)" strokeWidth="1.5" strokeDasharray="119.38" strokeDashoffset="119.38" />
        </svg>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="relative z-10">
          <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
        </svg>
      </button>

      {/* ─── FOOTER ─────────────────────────────────── */}
      <footer className="bg-background border-t border-border py-16 px-[5%]">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">

          {/* ── ロゴ ── */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="font-serif text-foreground no-underline cursor-pointer"
            style={{ fontSize: "clamp(2rem, 6vw, 3.2rem)", fontWeight: 300, letterSpacing: "0.18em" }}
          >
            HAIRHOLIC
          </a>

          {/* ── Instagram アイコン ── */}
          <a
            href="https://www.instagram.com/hairholic_nagasaki"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>

          {/* ── ナビリンク ── */}
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 list-none m-0 p-0">
            {navSections.map(({ id, en }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => { e.preventDefault(); smoothScrollTo(id); }}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 no-underline font-sans"
                  style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase" }}
                >
                  {en}
                </a>
              </li>
            ))}
          </ul>

          {/* ── コピーライト ── */}
          <p className="text-xs text-muted-foreground/40 tracking-[0.08em] m-0">
            © {new Date().getFullYear()} HAIRHOLIC. All rights reserved.
          </p>

        </div>
      </footer>
    </>
  );
}
