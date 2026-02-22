"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { StaffMember } from "../types";

// ── ポートレートカード ────────────────────────────────────────
function StaffCard({ member, index }: { member: StaffMember; index: number }) {
  const cardRef   = useRef<HTMLDivElement>(null);
  const imgRef    = useRef<HTMLImageElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  // PC：マウスホバー
  const handleMouseEnter = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (imgRef.current)    gsap.to(imgRef.current,   { filter: "grayscale(0%)",  duration: 0.55, ease: "power2.out" });
    if (revealRef.current) gsap.to(revealRef.current, { maxHeight: 180, opacity: 1, duration: 0.45, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (imgRef.current)    gsap.to(imgRef.current,   { filter: "grayscale(100%)", duration: 0.55, ease: "power2.inOut" });
    if (revealRef.current) gsap.to(revealRef.current, { maxHeight: 0, opacity: 0,  duration: 0.3,  ease: "power2.in" });
  };

  // SP：スクロールトリガー（タッチデバイスのみ）
  useEffect(() => {
    const card = cardRef.current;
    const img  = imgRef.current;
    const rev  = revealRef.current;
    if (!card) return;
    // ホバー対応デバイスはスキップ（PC用ホバーを使う）
    if (window.matchMedia("(hover: hover)").matches) return;

    const hasContent = !!(member.specialty || member.comment);

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (img) gsap.to(img, { filter: "grayscale(0%)",  duration: 0.55, ease: "power2.out" });
          if (rev && hasContent) gsap.to(rev, { maxHeight: 180, opacity: 1, duration: 0.45, ease: "power2.out" });
        } else {
          if (img) gsap.to(img, { filter: "grayscale(100%)", duration: 0.55, ease: "power2.inOut" });
          if (rev) gsap.to(rev, { maxHeight: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
        }
      },
      { threshold: 0.62 }
    );

    obs.observe(card);
    return () => obs.disconnect();
  }, [member.specialty, member.comment]);

  return (
    <div
      ref={cardRef}
      data-staff-card={String(index)}
      style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ポートレート画像（グレースケール → カラー） */}
      {member.photo ? (
        <img
          ref={imgRef}
          src={member.photo}
          alt={member.name}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            filter: "grayscale(100%)",
          }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#181818", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.25)" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
      )}

      {/* ボトムグラデーション */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.32) 44%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/*
        テキストオーバーレイ（bottom: 0 固定）
        得意分野・コメントを【名前より先】に配置することで、
        展開時にコンテナが上方向に伸び、名前・肩書は下に留まる。
      */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 28px" }}>

        {/* ① ホバー／スクロールで展開：得意分野 + コメント（名前の上） */}
        {(member.specialty || member.comment) && (
          <div ref={revealRef} style={{ maxHeight: 0, opacity: 0, overflow: "hidden" }}>
            <div style={{
              paddingBottom: "14px",
              marginBottom: "14px",
              borderBottom: "1px solid rgba(255,255,255,0.18)",
            }}>
              {member.specialty && (
                <p style={{
                  color: "oklch(0.78 0.12 75)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.1em",
                  margin: "0 0 8px",
                  lineHeight: 1.65,
                }}>
                  {member.specialty}
                </p>
              )}
              {member.comment && (
                <p style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "0.78rem",
                  lineHeight: "1.75",
                  margin: 0,
                }}>
                  {member.comment}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ② 名前（常時表示・下部固定） */}
        <h3 style={{
          fontFamily: "var(--cormorant-garamond), 'Cormorant Garamond', serif",
          fontSize: "clamp(1.5rem, 4vw, 2rem)",
          fontWeight: 300,
          color: "white",
          letterSpacing: "0.04em",
          margin: "0 0 7px",
          lineHeight: 1.1,
        }}>
          {member.name}
        </h3>

        {/* ③ 肩書（常時表示・最下部） */}
        <p style={{
          color: "oklch(0.78 0.12 75)",
          fontSize: "0.6rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          margin: 0,
          fontWeight: 500,
        }}>
          {member.role}
        </p>
      </div>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────────
interface Props { staff: StaffMember[] }

export default function StaffSection({ staff }: Props) {
  useEffect(() => {
    if (staff.length === 0) return;
    const cards = Array.from(document.querySelectorAll("[data-staff-card]")) as HTMLElement[];

    let introPlayed = false;
    try { introPlayed = sessionStorage.getItem('hairholic_intro') === '1'; } catch {}

    // 再訪問時 or 初期表示スキップ：即時表示
    if (introPlayed) {
      cards.forEach(c => gsap.set(c, { opacity: 1, y: 0 }));
      return;
    }

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const i  = parseInt(el.dataset.staffCard || "0");
          gsap.fromTo(el,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.75, delay: i * 0.1, ease: "power3.out" }
          );
          obs.unobserve(el);
        });
      },
      { threshold: 0, rootMargin: "0px 0px 60px 0px" }
    );

    cards.forEach(c => {
      const rect = c.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (alreadyVisible) {
        // すでにビューポート内にある場合は即時アニメーション
        const i = parseInt((c as HTMLElement).dataset.staffCard || "0");
        gsap.fromTo(c,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.75, delay: i * 0.1, ease: "power3.out" }
        );
      } else {
        gsap.set(c, { opacity: 0, y: 32 });
        obs.observe(c);
      }
    });

    // フォールバック：1.5秒後も非表示なら強制表示
    const fallback = setTimeout(() => {
      cards.forEach(c => {
        gsap.set(c, { opacity: 1, y: 0 });
      });
    }, 1500);

    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [staff]);

  if (staff.length === 0) return null;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "4px",
    }}>
      {staff.map((member, i) => (
        <StaffCard key={member.id} member={member} index={i} />
      ))}
    </div>
  );
}
