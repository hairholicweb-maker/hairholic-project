"use client";
import { useEffect, useRef } from "react";
import { StaffMember } from "../types";

// ── ポートレートカード（GSAP不使用・CSS transitionのみ） ────────
function StaffCard({ member, index }: { member: StaffMember; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // SP（タッチデバイス）：スクロールで視野内に入ったとき class を付与
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    // hover 対応デバイス（PC）は CSS の :hover で制御するのでスキップ
    if (window.matchMedia("(hover: hover)").matches) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          card.classList.add("staff-active");
        } else {
          card.classList.remove("staff-active");
        }
      },
      { threshold: 0.62 }
    );
    obs.observe(card);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      data-staff-card={String(index)}
      className="staff-card"
      style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4" }}
    >
      {/* ポートレート画像 */}
      {member.photo ? (
        <img
          src={member.photo}
          alt={member.name}
          className="staff-card-img"
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            filter: "grayscale(100%)",
            transition: "filter 0.55s ease",
          }}
        />
      ) : (
        <div style={{
          width: "100%", height: "100%", background: "#1e1c19",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5">
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

      {/* テキストオーバーレイ */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 28px" }}>

        {/* ホバー／スクロールで展開：得意分野 + コメント */}
        {(member.specialty || member.comment) && (
          <div
            className="staff-reveal"
            style={{
              maxHeight: 0,
              opacity: 0,
              overflow: "hidden",
              transition: "max-height 0.45s ease, opacity 0.35s ease",
            }}
          >
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

        {/* 名前（常時表示） */}
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

        {/* 肩書（常時表示） */}
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
  if (staff.length === 0) return null;

  return (
    <>
      <style>{`
        /* PC ホバー：グレースケール解除 + テキスト展開 */
        @media (hover: hover) {
          .staff-card:hover .staff-card-img {
            filter: grayscale(0%) !important;
          }
          .staff-card:hover .staff-reveal {
            max-height: 180px !important;
            opacity: 1 !important;
          }
        }
        /* SP スクロール：active クラス付与で同様の効果 */
        .staff-card.staff-active .staff-card-img {
          filter: grayscale(0%) !important;
        }
        .staff-card.staff-active .staff-reveal {
          max-height: 180px !important;
          opacity: 1 !important;
        }
      `}</style>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "4px",
      }}>
        {staff.map((member, i) => (
          <StaffCard key={member.id || i} member={member} index={i} />
        ))}
      </div>
    </>
  );
}
