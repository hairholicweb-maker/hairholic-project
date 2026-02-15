"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StaffMember } from "../types";

gsap.registerPlugin(ScrollTrigger);

// ── スタッフカード（PC・SP共通） ──────────────────────────────
function StaffCard({ member, style }: { member: StaffMember; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#141414",
      border: "1px solid rgba(212,175,55,0.2)",
      borderRadius: "12px",
      overflow: "hidden",
      ...style,
    }}>
      <div style={{ height: "300px", overflow: "hidden", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {member.photo ? (
          <img src={member.photo} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        )}
      </div>
      <div style={{ padding: "28px" }}>
        <h3 style={{ fontFamily: "var(--font-heading), serif", fontSize: "1.3rem", color: "#f5f5f5", marginBottom: "6px", letterSpacing: "0.04em" }}>
          {member.name}
        </h3>
        <p style={{ color: "#d4af37", fontSize: "0.8rem", letterSpacing: "0.06em", marginBottom: member.specialty ? "16px" : 0 }}>
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
  );
}

// ── シームレスループ構築（CodePen 準拠） ──────────────────────
function buildSeamlessLoop(items: HTMLElement[], spacing: number) {
  const overlap    = Math.ceil(1 / spacing);
  const startTime  = items.length * spacing + 0.5;
  const loopTime   = (items.length + overlap) * spacing + 1;

  const rawSequence = gsap.timeline({ paused: true });
  const seamlessLoop = gsap.timeline({
    paused: true,
    repeat: -1,
    onRepeat() {
      const t = this as any;
      if (t._time === t._dur) t._tTime += t._dur - 0.01;
    },
  });

  const l = items.length + overlap * 2;
  gsap.set(items, { xPercent: 400, opacity: 0, scale: 0 });

  for (let i = 0; i < l; i++) {
    const index = i % items.length;
    const item  = items[index];
    const time  = i * spacing;

    rawSequence
      .fromTo(item,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false },
        time
      )
      .fromTo(item,
        { xPercent: 400 },
        { xPercent: -400, duration: 1, ease: "none", immediateRender: false },
        time
      );

    if (i <= items.length) seamlessLoop.add("label" + i, time);
  }

  rawSequence.time(startTime);
  seamlessLoop
    .to(rawSequence, { time: loopTime, duration: loopTime - startTime, ease: "none" })
    .fromTo(rawSequence,
      { time: overlap * spacing + 1 },
      { time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: "none" }
    );

  return seamlessLoop;
}

// ── メインコンポーネント ──────────────────────────────────────
interface Props { staff: StaffMember[] }

export default function StaffSection({ staff }: Props) {
  const [isDesktop, setIsDesktop] = useState(false);

  const galleryRef   = useRef<HTMLDivElement>(null);
  const listRef      = useRef<HTMLUListElement>(null);
  const iterRef      = useRef(0);
  const scrubRef     = useRef<gsap.core.Tween | null>(null);
  const loopRef      = useRef<gsap.core.Timeline | null>(null);
  const triggerRef   = useRef<ScrollTrigger | null>(null);
  const snapRef      = useRef<(n: number) => number>((n) => n);
  const SPACING      = 0.1;

  // ── PC / SP 判定 ──────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setIsDesktop(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // ── PC カード reveal ─────────────────────────────────────
  useEffect(() => {
    if (!isDesktop || staff.length === 0) return;
    const cards = Array.from(document.querySelectorAll("[data-staff-card]")) as HTMLElement[];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const i  = parseInt(el.dataset.staffCard || "0");
        gsap.fromTo(el,
          { opacity: 0, y: 35, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, delay: i * 0.12, ease: "expo.out" }
        );
        obs.unobserve(el);
      });
    }, { threshold: 0.1 });
    cards.forEach(c => { gsap.set(c, { opacity: 0 }); obs.observe(c); });
    return () => obs.disconnect();
  }, [isDesktop, staff]);

  // ── SP シームレスカルーセル ────────────────────────────────
  useEffect(() => {
    if (isDesktop || staff.length < 2) return;
    if (!galleryRef.current || !listRef.current) return;

    const cards = Array.from(listRef.current.querySelectorAll("li")) as HTMLElement[];
    if (cards.length === 0) return;

    snapRef.current = gsap.utils.snap(SPACING);
    const loop = buildSeamlessLoop(cards, SPACING);
    loopRef.current = loop;

    const scrub = gsap.to(loop, { totalTime: 0, duration: 0.5, ease: "power3", paused: true });
    scrubRef.current = scrub;

    const trigger = ScrollTrigger.create({
      trigger: galleryRef.current,
      start: "top top",
      end: `+=${Math.max(1500, staff.length * 700)}`,
      pin: true,
      onUpdate(self) {
        const s = self as any;
        if (self.progress === 1 && self.direction > 0 && !s.wrapping) {
          iterRef.current++;
          s.wrapping = true;
          self.scroll(self.start + 1);
        } else if (self.progress < 1e-5 && self.direction < 0 && !s.wrapping) {
          iterRef.current--;
          if (iterRef.current < 0) {
            iterRef.current = 9;
            loop.totalTime(loop.totalTime() + loop.duration() * 10);
            scrub.pause();
          }
          s.wrapping = true;
          self.scroll(self.end - 1);
        } else {
          scrub.vars.totalTime = snapRef.current(
            (iterRef.current + self.progress) * loop.duration()
          );
          scrub.invalidate().restart();
          s.wrapping = false;
        }
      },
    });
    triggerRef.current = trigger;

    return () => { trigger.kill(); loop.kill(); scrub.kill(); };
  }, [isDesktop, staff]);

  const scrubTo = useCallback((totalTime: number) => {
    const scrub   = scrubRef.current;
    const loop    = loopRef.current;
    const trigger = triggerRef.current;
    if (!scrub || !loop || !trigger) return;

    const progress = (totalTime - loop.duration() * iterRef.current) / loop.duration();
    if (progress > 1) {
      iterRef.current++;
      (trigger as any).wrapping = true;
      trigger.scroll(trigger.start + 1);
    } else if (progress < 0) {
      iterRef.current--;
      if (iterRef.current < 0) {
        iterRef.current = 9;
        loop.totalTime(loop.totalTime() + loop.duration() * 10);
        scrub.pause();
      }
      (trigger as any).wrapping = true;
      trigger.scroll(trigger.end - 1);
    } else {
      trigger.scroll(trigger.start + progress * (trigger.end - trigger.start));
    }
  }, []);

  if (staff.length === 0) return null;

  // ════════════════════════════════════════════════════════════════
  // PC：レスポンシブグリッド（1人=中央、2〜4列、5人目〜2行目）
  // ════════════════════════════════════════════════════════════════
  if (isDesktop) {
    if (staff.length === 1) {
      return (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div data-staff-card="0" style={{ width: "320px" }}>
            <StaffCard member={staff[0]} />
          </div>
        </div>
      );
    }
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "24px",
        maxWidth: "calc(4 * 280px + 3 * 24px)",
        margin: "0 auto",
      }}>
        {staff.map((member, i) => (
          <div key={member.id} data-staff-card={String(i)}>
            <StaffCard member={member} />
          </div>
        ))}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SP：1人 = 中央表示
  // ════════════════════════════════════════════════════════════════
  if (staff.length === 1) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <StaffCard member={staff[0]} style={{ width: "min(85vw, 320px)" }} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SP：2人以上 = シームレスカルーセル
  // ════════════════════════════════════════════════════════════════
  const arrowStyle: React.CSSProperties = {
    width: "48px", height: "48px", borderRadius: "50%",
    border: "1px solid rgba(212,175,55,0.5)",
    background: "rgba(13,13,13,0.75)",
    backdropFilter: "blur(8px)",
    color: "#d4af37", cursor: "pointer",
    fontSize: "1.5rem", lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };

  return (
    <>
      <style>{`
        .staff-gallery-list {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          list-style: none;
          margin: 0; padding: 0;
          position: relative;
        }
        .staff-gallery-list li {
          position: absolute;
          width: min(82vw, 320px);
          border-radius: 12px;
          overflow: hidden;
        }
      `}</style>

      {/* ピンされるギャラリー本体 */}
      <div ref={galleryRef} style={{
        width: "100%",
        height: "520px",
        overflow: "hidden",
        position: "relative",
        background: "#0d0d0d",
      }}>
        <ul ref={listRef} className="staff-gallery-list">
          {staff.map(member => (
            <li key={member.id}>
              <StaffCard member={member} />
            </li>
          ))}
        </ul>

        {/* ナビゲーションボタン */}
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: 0, right: 0,
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          zIndex: 200,
        }}>
          <button
            style={arrowStyle}
            aria-label="前のスタッフ"
            onClick={() => scrubTo((scrubRef.current?.vars.totalTime ?? 0) - SPACING)}
          >‹</button>
          <button
            style={arrowStyle}
            aria-label="次のスタッフ"
            onClick={() => scrubTo((scrubRef.current?.vars.totalTime ?? 0) + SPACING)}
          >›</button>
        </div>

        {/* スクロールヒント */}
        <p style={{
          position: "absolute", top: "16px", left: 0, right: 0,
          textAlign: "center", fontSize: "0.6rem", color: "#d4af37",
          letterSpacing: "0.25em", opacity: 0.5, pointerEvents: "none",
          textTransform: "uppercase",
        }}>
          Scroll to explore
        </p>
      </div>
    </>
  );
}
