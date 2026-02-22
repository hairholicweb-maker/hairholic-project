import { useState, useEffect } from "react";
import {
  RankingCourse, StaffMember, SiteSettings,
  AboutContent, MenuCategoryCMS, AccessInfo,
} from "../types";
import { siteSettingsDefault } from "../data/siteSettingsDefault";
import { aboutDefault } from "../data/aboutDefault";
import { menuCategoriesCMSDefault } from "../data/menuCategoriesCMS";
import { accessDefault } from "../data/accessDefault";
import { rankingCourses as rankingCoursesDefault } from "../data/rankingCourses";
import { staffMembers as staffMembersDefault } from "../data/staffMembers";

const MICROCMS_API_KEY     = process.env.NEXT_PUBLIC_MICROCMS_API_KEY     || "";
const MICROCMS_SERVICE_DOMAIN = process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN || "";

function apiUrl(endpoint: string) {
  return `https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/${endpoint}`;
}
const headers   = () => ({ "X-MICROCMS-API-KEY": MICROCMS_API_KEY });
const isCmsReady = () => !!(MICROCMS_API_KEY && MICROCMS_SERVICE_DOMAIN);

// ─── 統合 top-page API キャッシュ ────────────────────────────
// 全フックが同一エンドポイントを参照するため、モジュールレベルでPromiseをキャッシュし
// APIリクエストを1回に抑える。
// MicroCMS 新スキーマ（オブジェクト形式 / エンドポイント: top-page）:
//   hero_image      : 画像（ヒーロー背景）
//   sub_title       : 画像（Aboutセクション背景画像）※mediaフィールド
//   about_text      : テキストエリア
//   about_title     : テキスト（セクション見出し・任意）
//   menu_title      : テキスト（セクション見出し・任意）
//   staff_title     : テキスト（セクション見出し・任意）
//   gallery_title   : テキスト（セクション見出し・任意）
//   access_title    : テキスト（セクション見出し・任意）
//   address         : テキスト
//   tel             : テキスト
//   directions      : テキスト
//   hours           : テキスト
//   regular_holiday : テキスト
//   payment         : テキスト
//   notes           : テキスト
//   map_embed_src   : テキスト（iframe src）
//   map_link        : テキスト（Google Maps URL）
//   staff_list      : 繰り返し → name, role, photo(画像), spacialty?(typo), comment?
//   ranking_list    : 繰り返し → title, description, price?, rank?
//   menu_sections   : 繰り返し（カスタムフィールド）→ category_name, items[name, price, comment?]
//   news_list       : 繰り返し → date, content（将来用）
let _topPagePromise: Promise<Record<string, unknown>> | null = null;

function fetchTopPage(): Promise<Record<string, unknown>> {
  if (!_topPagePromise) {
    _topPagePromise = fetch(apiUrl("top-page"), { headers: headers() })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Record<string, unknown>>;
      })
      .catch(() => ({}));
  }
  return _topPagePromise;
}

// ─── サイト設定 ──────────────────────────────────────────────
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetchTopPage().then(d => {
      setSettings({
        heroSubtitle: siteSettingsDefault.heroSubtitle,
        heroBgImage:  (d.hero_image   as SiteSettings["heroBgImage"]) ?? undefined,
        aboutTitle:   (d.about_title  as string) ?? siteSettingsDefault.aboutTitle,
        menuTitle:    (d.menu_title   as string) ?? siteSettingsDefault.menuTitle,
        staffTitle:   (d.staff_title  as string) ?? siteSettingsDefault.staffTitle,
        galleryTitle: (d.gallery_title as string) ?? siteSettingsDefault.galleryTitle,
        accessTitle:  (d.access_title  as string) ?? siteSettingsDefault.accessTitle,
      });
    });
  }, []);

  return { settings };
}

// ─── Aboutコンテンツ ──────────────────────────────────────────
export function useAbout() {
  const [about, setAbout] = useState<AboutContent>(aboutDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetchTopPage().then(d => {
      setAbout({
        content: (d.about_text as string)               ?? aboutDefault.content,
        image:   (d.sub_title  as AboutContent["image"]) ?? undefined,
      });
    });
  }, []);

  return { about };
}

// ─── メニューカテゴリー ───────────────────────────────────────
// top-page: menu_sections[{ category_name, items[{ name, price, comment? }] }]
export function useMenuCategoriesCMS() {
  const [menuCats, setMenuCats] = useState<MenuCategoryCMS[]>(menuCategoriesCMSDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetchTopPage().then(d => {
      const sections = (d.menu_sections as any[]) ?? [];
      if (sections.length === 0) return;
      const cats: MenuCategoryCMS[] = sections.map((s: any, idx: number) => ({
        id:            s.fieldId   ?? String(idx),
        categoryKey:   s.fieldId   ?? String(idx),
        categoryTitle: s.category_name ?? "",
        items: (s.items ?? []).map((item: any, j: number) => ({
          fieldId: item.fieldId ?? `${idx}-${j}`,
          title:   item.name   ?? item.title ?? "",
          price:   item.price  ?? "",
          comment: item.comment ?? undefined,
          image:   item.image   ?? undefined,
        })),
      }));
      setMenuCats(cats);
    });
  }, []);

  return { menuCats };
}

// ─── ランキングコース ─────────────────────────────────────────
// top-page: ranking_list[{ title, description, price?, rank? }]
export function useRankingCourses() {
  const [courses, setCourses] = useState<RankingCourse[]>(rankingCoursesDefault);
  const [loading, setLoading] = useState(!isCmsReady());

  useEffect(() => {
    if (!isCmsReady()) { setLoading(false); return; }
    fetchTopPage()
      .then(d => {
        const list = (d.ranking_list as any[]) ?? [];
        if (list.length > 0) {
          const normalized: RankingCourse[] = list.map((c: any, i: number) => ({
            id:          c.fieldId     ?? String(i),
            rank:        c.rank        ?? i + 1,
            title:       c.title       ?? "",
            price:       c.price       ?? "",
            description: c.description ?? "",
            categoryKey: c.categoryKey ?? undefined,
            comment:     c.comment     ?? undefined,
            image:       typeof c.image === "string" ? c.image : c.image?.url ?? undefined,
          }));
          setCourses(normalized);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { courses, loading };
}

// ─── スタッフ ────────────────────────────────────────────────
// top-page: staff_list[{ name, role, photo: { url }, specialty?, comment? }]
export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>(staffMembersDefault);
  const [loading, setLoading] = useState(!isCmsReady());

  useEffect(() => {
    if (!isCmsReady()) { setLoading(false); return; }
    fetchTopPage()
      .then(d => {
        const list = (d.staff_list as any[]) ?? [];
        if (list.length > 0) {
          const normalized: StaffMember[] = list.map((s: any, i: number) => ({
            id:        s.fieldId   ?? String(i),
            name:      s.name      ?? "",
            role:      s.role      ?? "",
            specialty: s.spacialty ?? s.specialty ?? "",
            comment:   s.comment   ?? undefined,
            photo:     typeof s.photo === "string" ? s.photo : s.photo?.url ?? "",
            order:     s.order     ?? i,
            location:  s.location  ?? undefined,
          }));
          setStaff(normalized);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { staff, loading };
}

// ─── アクセス情報 ────────────────────────────────────────────
// top-page: address, tel, directions, hours, regular_holiday, payment,
//           notes, map_embed_src, map_link
export function useAccess() {
  const [access, setAccess] = useState<AccessInfo>(accessDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetchTopPage().then(d => {
      setAccess({
        tel:            (d.tel             as string) ?? accessDefault.tel,
        address:        (d.address         as string) ?? accessDefault.address,
        directions:     (d.directions      as string) ?? accessDefault.directions,
        hours:          (d.hours           as string) ?? accessDefault.hours,
        // snake_case と camelCase 両方に対応
        regularHoliday: (d.regular_holiday as string) ?? (d.regularHoliday as string) ?? accessDefault.regularHoliday,
        payment:        (d.payment         as string) ?? accessDefault.payment,
        notes:          (d.notes           as string) ?? accessDefault.notes,
        mapEmbedSrc:    (d.map_embed_src   as string) ?? (d.mapEmbedSrc   as string) ?? accessDefault.mapEmbedSrc,
        mapLink:        (d.map_link        as string) ?? (d.mapLink        as string) ?? accessDefault.mapLink,
      });
    });
  }, []);

  return { access };
}
