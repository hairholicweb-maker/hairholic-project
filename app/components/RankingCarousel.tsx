"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { RankingCourse } from "../types";

interface Props {
  courses: RankingCourse[];
}


// 画像が読み込めないときのプレースホルダー
function ImagePlaceholder({ height = 260 }: { height?: number }) {
  return (
    <div style={{
      width: "100%",
      height: `${height}px`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#1a1a1a",
      borderRadius: "16px 16px 0 0",
      gap: "14px",
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
        stroke="rgba(212,175,55,0.35)" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
      <span style={{
        fontFamily: "var(--font-cormorant), serif",
        color: "rgba(212,175,55,0.35)",
        fontSize: "0.75rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
      }}>HAIRHOLIC</span>
    </div>
  );
}

function fixPrice(p: string) { return p.replace(/[\\\/]/g, "¥"); }

export default function RankingCarousel({ courses }: Props) {
  const sorted = [...courses].sort((a, b) => a.rank - b.rank);

  const [isDesktop, setIsDesktop]   = useState(false);
  const [idx, setIdx]               = useState(0);
  const [phase, setPhase]           = useState<"idle" | "exit" | "enter">("idle");
  const [imgErrors, setImgErrors]   = useState<Record<string, boolean>>({});
  const [isInView, setIsInView]     = useState(false);

  const dirRef     = useRef(1);
  const nextRef    = useRef(0);
  const cardRef    = useRef<HTMLDivElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const idxRef     = useRef(0);
  const phaseRef   = useRef("idle");
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  // ── PC / SP 判定（ポインターデバイスで判別） ──────────────────────
  // (pointer: fine) = マウス・トラックパッド → PC
  // (pointer: coarse) = タッチ → SP
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // refs を最新の state と同期
  useEffect(() => { idxRef.current   = idx;   }, [idx]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── セクションが画面に入ったらタイマー解禁 ────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── 自動再生（SP のみ・5秒・画面内のみ） ─────────────────────────
  useEffect(() => {
    if (isDesktop || !isInView) return;
    const t = setTimeout(() => {
      if (phase === "idle") {
        nextRef.current = (idx + 1) % sorted.length;
        dirRef.current  = 1;
        setPhase("exit");
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [phase, idx, sorted.length, isDesktop, isInView]);

  // ── 退場アニメーション ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exit" || !cardRef.current) return;
    const d = dirRef.current;
    const tween = gsap.to(cardRef.current, {
      rotateY: d > 0 ? -90 : 90,
      scale: 0.95,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        setIdx(nextRef.current);
        setPhase("enter");
      },
    });
    return () => { tween.kill(); };
  }, [phase]);

  // ── 登場アニメーション ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "enter" || !cardRef.current) return;
    const d = dirRef.current;
    const tween = gsap.fromTo(
      cardRef.current,
      { rotateY: d > 0 ? 90 : -90, scale: 0.95 },
      {
        rotateY: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => setPhase("idle"),
      }
    );
    return () => { tween.kill(); };
  }, [phase, idx]);

  // ── マウスドラッグ（グローバル） ──────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    gsap.set(cardRef.current, { rotateY: delta * 0.45 });
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (cardRef.current) cardRef.current.style.cursor = "grab";
    if (phaseRef.current !== "idle") return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 60) {
      const d = delta < 0 ? 1 : -1;
      dirRef.current  = d;
      nextRef.current = d > 0
        ? (idxRef.current + 1) % sorted.length
        : (idxRef.current - 1 + sorted.length) % sorted.length;
      setPhase("exit");
    } else {
      gsap.to(cardRef.current, { rotateY: 0, scale: 1, duration: 0.3, ease: "power2.out" });
    }
  }, [sorted.length]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup",   handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup",   handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ── タッチスワイプ ─────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    if (phase !== "idle") return;
    dragStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientX - dragStartX.current;
    gsap.set(cardRef.current, { rotateY: delta * 0.45 });
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = e.changedTouches[0].clientX - dragStartX.current;
    if (Math.abs(delta) > 50) {
      const d = delta < 0 ? 1 : -1;
      dirRef.current  = d;
      nextRef.current = d > 0
        ? (idx + 1) % sorted.length
        : (idx - 1 + sorted.length) % sorted.length;
      setPhase("exit");
    } else {
      gsap.to(cardRef.current, { rotateY: 0, scale: 1, duration: 0.3, ease: "power2.out" });
    }
  };

  // ── ボタンナビ ─────────────────────────────────────────────────────
  const goTo = useCallback((to: number) => {
    if (phaseRef.current !== "idle") return;
    dirRef.current  = to >= idxRef.current ? 1 : -1;
    nextRef.current = to;
    setPhase("exit");
  }, []);

  if (sorted.length === 0) return null;

  // ── 共通ヘッダー ──────────────────────────────────────────────────
  const sectionHeader = (
    <div style={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: "28px",
    }}>
      <div>
        <div style={{
          color: "#d4af37",
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: "4px",
        }}>Featured</div>
        <h3 style={{
          fontFamily: "var(--font-heading), serif",
          fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: "#f5f5f5",
          margin: 0,
        }}>おすすめ</h3>
      </div>
    </div>
  );

  const wrapStyle: React.CSSProperties = {
    borderTop: "1px solid rgba(212,175,55,0.15)",
    paddingTop: "48px",
    marginTop: "40px",
  };

  // ════════════════════════════════════════════════════════════════════
  // PC：3カラムグリッド
  // ════════════════════════════════════════════════════════════════════
  if (isDesktop) {
    return (
      <div ref={wrapRef} style={wrapStyle}>
        {/* 映画レターボックス風：幅を絞って中央寄せ */}
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        {sectionHeader}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}>
          {sorted.map((course, i) => {
            const rankColor = i === 0 ? "#d4af37" : i === 1 ? "#b0b8c1" : "#a0785a";
            return (
              <div
                key={course.id}
                style={{
                  background: "#141414",
                  border: `1px solid ${i === 0 ? "rgba(212,175,55,0.4)" : "#2a2a2a"}`,
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform   = "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#d4af37";
                  (e.currentTarget as HTMLDivElement).style.boxShadow   = "0 12px 32px rgba(0,0,0,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform   = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = i === 0 ? "rgba(212,175,55,0.4)" : "#2a2a2a";
                  (e.currentTarget as HTMLDivElement).style.boxShadow   = "none";
                }}
              >
                {/* 画像エリア */}
                <div style={{ position: "relative", overflow: "hidden" }}>
                  {imgErrors[course.id] ? (
                    <ImagePlaceholder height={200} />
                  ) : (
                    <img
                      src={course.image}
                      alt={course.title}
                      draggable={false}
                      onError={() => setImgErrors(prev => ({ ...prev, [course.id]: true }))}
                      style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                    />
                  )}
                  {/* ボトムグラデーション */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    pointerEvents: "none",
                  }} />
                  {/* ランクバッジ：画像左下 */}
                  <div style={{
                    position: "absolute", bottom: "12px", left: "12px",
                    display: "flex", alignItems: "baseline", gap: "5px",
                    background: "rgba(13,13,13,0.82)",
                    backdropFilter: "blur(8px)",
                    border: `1px solid ${rankColor}`,
                    borderRadius: "6px",
                    padding: "5px 10px",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: "1.25rem", fontWeight: 700, lineHeight: 1,
                      color: rankColor,
                    }}>{course.rank}</span>
                    <span style={{
                      fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.18em",
                      lineHeight: 1, color: rankColor, opacity: 0.85,
                    }}>RANK</span>
                  </div>
                </div>

                {/* テキスト + 価格 */}
                <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "0.95rem", color: "#f5f5f5",
                    margin: "0 0 8px 0", lineHeight: 1.5,
                  }}>
                    {course.title}
                  </h3>
                  <p style={{
                    fontSize: "0.8rem", color: "#c8c8c8",
                    margin: 0, lineHeight: 1.75, flex: 1,
                  }}>
                    {course.description}
                  </p>
                  {/* 価格：右下 */}
                  <div style={{
                    marginTop: "14px", paddingTop: "12px",
                    borderTop: "1px solid #2a2a2a",
                    display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: "3px",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant), serif",
                      color: "#d4af37", fontSize: "1.3rem", fontWeight: 400, letterSpacing: "0.03em",
                    }}>{fixPrice(course.price)}</span>
                    <span style={{ color: "#666", fontSize: "0.6rem", letterSpacing: "0.05em" }}>（税込）</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>{/* /maxWidth wrapper */}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // SP：スワイプカルーセル
  // ════════════════════════════════════════════════════════════════════
  const c = sorted[idx];

  const arrowBtn: React.CSSProperties = {
    flexShrink: 0,
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "1px solid rgba(212,175,55,0.4)",
    background: "transparent",
    color: "#d4af37",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
    lineHeight: 1,
    transition: "border-color 0.2s, background 0.2s",
  };

  return (
    <div ref={wrapRef} style={wrapStyle}>
      {/* ヘッダー（SP 版はカウンター付き） */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: "28px",
      }}>
        <div>
          <div style={{
            color: "#d4af37",
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: "4px",
          }}>Ranking</div>
          <h3 style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#f5f5f5",
            margin: 0,
          }}>人気TOP3</h3>
        </div>
        <span style={{
          fontFamily: "var(--font-cormorant), serif",
          color: "#d4af37",
          fontSize: "1.6rem",
          fontWeight: 400,
          letterSpacing: "0.05em",
        }}>
          {idx + 1}
          <span style={{ opacity: 0.4, fontSize: "0.8rem", marginLeft: "4px" }}>
            / {sorted.length}
          </span>
        </span>
      </div>

      {/* カルーセル本体 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        <button
          onClick={() => goTo((idx - 1 + sorted.length) % sorted.length)}
          aria-label="前のカード"
          style={arrowBtn}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background   = "rgba(212,175,55,0.1)";
            (e.currentTarget as HTMLButtonElement).style.borderColor  = "#d4af37";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background  = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,55,0.4)";
          }}
        >‹</button>

        <div style={{ flex: 1, perspective: "1200px" }}>
          <div
            ref={cardRef}
            style={{
              background: "#141414",
              border: "1px solid #2a2a2a",
              borderRadius: "16px",
              position: "relative",
              cursor: phase === "idle" ? "grab" : "default",
              userSelect: "none",
              willChange: "transform",
            }}
            onMouseDown={e => {
              if (phase !== "idle") return;
              dragStartX.current = e.clientX;
              isDragging.current = true;
              e.currentTarget.style.cursor = "grabbing";
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* 画像エリア */}
            <div style={{ position: "relative", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
              {imgErrors[c.id] ? (
                <ImagePlaceholder />
              ) : (
                <img
                  src={c.image}
                  alt={c.title}
                  draggable={false}
                  onError={() => setImgErrors(prev => ({ ...prev, [c.id]: true }))}
                  style={{
                    width: "100%", height: "260px",
                    objectFit: "cover", display: "block",
                    borderRadius: "16px 16px 0 0",
                    pointerEvents: "none",
                  }}
                />
              )}
              {/* ボトムグラデーション */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
                background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                pointerEvents: "none",
              }} />
              {/* ランクバッジ：画像左下 */}
              {(() => {
                const rc = idx === 0 ? "#d4af37" : idx === 1 ? "#b0b8c1" : "#a0785a";
                return (
                  <div style={{
                    position: "absolute", bottom: "14px", left: "16px",
                    display: "flex", alignItems: "baseline", gap: "6px",
                    background: "rgba(13,13,13,0.82)",
                    backdropFilter: "blur(8px)",
                    border: `1px solid ${rc}`,
                    borderRadius: "6px",
                    padding: "5px 12px",
                    pointerEvents: "none",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: "1.5rem", fontWeight: 700, lineHeight: 1, color: rc,
                    }}>{c.rank}</span>
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.18em",
                      lineHeight: 1, color: rc, opacity: 0.85,
                    }}>RANK</span>
                  </div>
                );
              })()}
            </div>

            {/* テキスト + 価格 */}
            <div style={{ padding: "20px 24px 24px" }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.1rem", color: "#f5f5f5",
                margin: "0 0 8px 0", lineHeight: 1.4, pointerEvents: "none",
              }}>
                {c.title}
              </h3>
              <p style={{
                fontSize: "0.875rem", color: "#c8c8c8",
                margin: 0, lineHeight: 1.75, pointerEvents: "none",
              }}>
                {c.description}
              </p>
              {/* 価格：右下 */}
              <div style={{
                marginTop: "16px", paddingTop: "14px",
                borderTop: "1px solid #2a2a2a",
                display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: "3px",
              }}>
                <span style={{
                  fontFamily: "var(--font-cormorant), serif",
                  color: "#d4af37", fontSize: "1.5rem", fontWeight: 400, letterSpacing: "0.03em",
                  pointerEvents: "none",
                }}>{fixPrice(c.price)}</span>
                <span style={{ color: "#666", fontSize: "0.65rem", pointerEvents: "none" }}>（税込）</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => goTo((idx + 1) % sorted.length)}
          aria-label="次のカード"
          style={arrowBtn}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background   = "rgba(212,175,55,0.1)";
            (e.currentTarget as HTMLButtonElement).style.borderColor  = "#d4af37";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background  = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,55,0.4)";
          }}
        >›</button>
      </div>

      {/* SP ヒント + ドットナビ */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        marginTop: "20px",
      }}>
        <p style={{
          fontSize: "0.6rem",
          color: "#d4af37",
          opacity: 0.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          margin: 0,
        }}>
          スワイプで切り替え
        </p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {sorted.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`${i + 1}番目のカードへ`}
              style={{
                width: i === idx ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: i === idx ? "#d4af37" : "#333",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
