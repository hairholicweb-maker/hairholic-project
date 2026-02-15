import { useState, useEffect } from "react";
import { RankingCourse, StaffMember, SiteSettings, AboutContent, MenuCategoryCMS, AccessInfo } from "../types";
import { siteSettingsDefault } from "../data/siteSettingsDefault";
import { aboutDefault } from "../data/aboutDefault";
import { menuCategoriesCMSDefault } from "../data/menuCategoriesCMS";
import { accessDefault } from "../data/accessDefault";
import { rankingCourses as rankingCoursesDefault } from "../data/rankingCourses";

const MICROCMS_API_KEY = process.env.NEXT_PUBLIC_MICROCMS_API_KEY || "";
const MICROCMS_SERVICE_DOMAIN = process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN || "";

function apiUrl(endpoint: string) {
  return `https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/${endpoint}`;
}

const headers = () => ({ "X-MICROCMS-API-KEY": MICROCMS_API_KEY });

const isCmsReady = () => !!(MICROCMS_API_KEY && MICROCMS_SERVICE_DOMAIN);

// ─── サイト設定 ──────────────────────────────────────────────
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetch(apiUrl("site-settings"), { headers: headers() })
      .then(res => res.json())
      .then(data => {
        setSettings({
          heroSubtitle: data.heroSubtitle ?? siteSettingsDefault.heroSubtitle,
          heroBgImage: data.heroBgImage ?? undefined,
          aboutTitle: data.aboutTitle ?? siteSettingsDefault.aboutTitle,
          menuTitle: data.menuTitle ?? siteSettingsDefault.menuTitle,
          staffTitle: data.staffTitle ?? siteSettingsDefault.staffTitle,
          galleryTitle: data.galleryTitle ?? siteSettingsDefault.galleryTitle,
          accessTitle: data.accessTitle ?? siteSettingsDefault.accessTitle,
        });
      })
      .catch(() => {});
  }, []);

  return { settings };
}

// ─── Aboutコンテンツ ──────────────────────────────────────────
export function useAbout() {
  const [about, setAbout] = useState<AboutContent>(aboutDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetch(apiUrl("about"), { headers: headers() })
      .then(res => res.json())
      .then(data => {
        setAbout({
          content: data.content ?? aboutDefault.content,
          image: data.image ?? undefined,
        });
      })
      .catch(() => {});
  }, []);

  return { about };
}

// ─── メニューカテゴリー ───────────────────────────────────────
export function useMenuCategoriesCMS() {
  const [menuCats, setMenuCats] = useState<MenuCategoryCMS[]>(menuCategoriesCMSDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetch(apiUrl("menu?orders=order&limit=100"), { headers: headers() })
      .then(res => res.json())
      .then(data => {
        const cats: MenuCategoryCMS[] = (data.contents ?? []).map((c: any) => ({
          id: c.id,
          categoryKey: c.categoryKey ?? c.id,
          categoryTitle: c.categoryTitle,
          order: c.order,
          items: (c.items ?? []).map((item: any) => ({
            fieldId: item.fieldId,
            title: item.title,
            price: item.price,
            comment: item.comment ?? undefined,
            image: item.image ?? undefined,
          })),
        }));
        if (cats.length > 0) setMenuCats(cats);
      })
      .catch(() => {});
  }, []);

  return { menuCats };
}

// ─── ランキングコース ─────────────────────────────────────────
export function useRankingCourses() {
  const [courses, setCourses] = useState<RankingCourse[]>(rankingCoursesDefault);
  const [loading, setLoading] = useState(!isCmsReady());

  useEffect(() => {
    if (!isCmsReady()) {
      setLoading(false);
      return;
    }

    fetch(apiUrl("ranking?orders=rank"), { headers: headers() })
      .then(res => res.json())
      .then(data => {
        const normalized: RankingCourse[] = (data.contents ?? []).map((c: any) => ({
          id: c.id,
          rank: c.rank,
          title: c.title,
          price: c.price,
          description: c.description ?? "",
          categoryKey: c.categoryKey ?? undefined,
          comment: c.comment ?? undefined,
          image: typeof c.image === "string" ? c.image : c.image?.url ?? undefined,
        }));
        if (normalized.length > 0) setCourses(normalized);
        setLoading(false);
      })
      .catch(() => {
        import("../data/rankingCourses").then(module => {
          setCourses(module.rankingCourses);
          setLoading(false);
        });
      });
  }, []);

  return { courses, loading };
}

// ─── スタッフ ────────────────────────────────────────────────
export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isCmsReady()) {
      import("../data/staffMembers").then(module => {
        setStaff(module.staffMembers);
        setLoading(false);
      });
      return;
    }

    fetch(apiUrl("staff?orders=order"), { headers: headers() })
      .then(res => res.json())
      .then(data => {
        const normalized: StaffMember[] = (data.contents ?? []).map((s: any) => ({
          ...s,
          photo: typeof s.photo === "string" ? s.photo : s.photo?.url ?? "",
        }));
        if (normalized.length > 0) setStaff(normalized);
        setLoading(false);
      })
      .catch(() => {
        import("../data/staffMembers").then(module => {
          setStaff(module.staffMembers);
          setLoading(false);
        });
      });
  }, []);

  return { staff, loading };
}

// ─── アクセス情報（site-settings に統合） ───────────────────
export function useAccess() {
  const [access, setAccess] = useState<AccessInfo>(accessDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetch(apiUrl("site-settings"), { headers: headers() })
      .then(res => res.json())
      .then(data => {
        setAccess({
          tel: data.tel ?? accessDefault.tel,
          address: data.address ?? accessDefault.address,
          directions: data.directions ?? accessDefault.directions,
          hours: data.hours ?? accessDefault.hours,
          regularHoliday: data.regularHoliday ?? accessDefault.regularHoliday,
          payment: data.payment ?? accessDefault.payment,
          notes: data.notes ?? accessDefault.notes,
          mapEmbedSrc: data.mapEmbedSrc ?? accessDefault.mapEmbedSrc,
          mapLink: data.mapLink ?? accessDefault.mapLink,
        });
      })
      .catch(() => {});
  }, []);

  return { access };
}
