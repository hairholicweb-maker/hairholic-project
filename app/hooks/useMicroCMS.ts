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

const MICROCMS_API_KEY        = process.env.NEXT_PUBLIC_MICROCMS_API_KEY        || "";
const MICROCMS_SERVICE_DOMAIN = process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN || "";

function apiUrl(endpoint: string) {
  return `https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/${endpoint}`;
}
const headers    = () => ({ "X-MICROCMS-API-KEY": MICROCMS_API_KEY });
const isCmsReady = () => !!(MICROCMS_API_KEY && MICROCMS_SERVICE_DOMAIN);

// ─────────────────────────────────────────────────────────────
// MicroCMS エンドポイント構成
//
// [top-page] オブジェクト型 ─ snake_case フィールド（全セクション統合）
//   hero_image(media)        : ヒーロー背景画像
//   sub_title(media)         : Aboutセクション背景画像
//   about_text(textArea)     : About本文
//   about_title(text)        : セクション見出し1
//   menu_title(text)         : セクション見出し2
//   staff_title(text)        : セクション見出し3
//   gallery_title(text)      : セクション見出し4
//   access_title(text)       : セクション見出し5
//   tel, address, directions, hours, regular_holiday, payment, notes (text)
//   map_embed_src, map_link  (text)
//   staff_list(repeater)     : name, photo(media), role, spacialty?, comment?
//
// [menu] リスト型 ─ メニューカテゴリ
//   categoryKey, categoryTitle, order(number)
//   items: repeater → title, price, comment?, image?(media)
//
// [ranking] リスト型 ─ ランキング（1〜3位）
//   rank(number), title, price, description
//   categoryKey?, comment?, image?(media)
// ─────────────────────────────────────────────────────────────

// モジュールレベルキャッシュ（同一エンドポイントへのリクエストを1回に抑える）
let _topPagePromise: Promise<Record<string, unknown>> | null = null;
let _menuPromise:    Promise<any[]>                   | null = null;
let _rankingPromise: Promise<any[]>                   | null = null;
let _pickupPromise:  Promise<Record<string, unknown>> | null = null;

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

function fetchMenuList(): Promise<any[]> {
  if (!_menuPromise) {
    _menuPromise = fetch(apiUrl("menu?orders=order&limit=100"), { headers: headers() })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => data.contents ?? [])
      .catch(() => []);
  }
  return _menuPromise;
}

function fetchRankingList(): Promise<any[]> {
  if (!_rankingPromise) {
    _rankingPromise = fetch(apiUrl("ranking?orders=rank&limit=10"), { headers: headers() })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => data.contents ?? [])
      .catch(() => []);
  }
  return _rankingPromise;
}

// ─── サイト設定 ──────────────────────────────────────────────
// エンドポイント: top-page（snake_case）
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetchTopPage().then(d => {
      setSettings({
        heroSubtitle: siteSettingsDefault.heroSubtitle,
        heroBgImage:  (d.hero_image    as SiteSettings["heroBgImage"]) ?? undefined,
        aboutTitle:   (d.about_title   as string) ?? siteSettingsDefault.aboutTitle,
        menuTitle:    (d.menu_title    as string) ?? siteSettingsDefault.menuTitle,
        staffTitle:   (d.staff_title   as string) ?? siteSettingsDefault.staffTitle,
        galleryTitle: (d.gallery_title as string) ?? siteSettingsDefault.galleryTitle,
        accessTitle:  (d.access_title  as string) ?? siteSettingsDefault.accessTitle,
      });
    });
  }, []);

  return { settings };
}

// ─── Aboutコンテンツ ──────────────────────────────────────────
// エンドポイント: top-page（about_text + sub_title が About背景画像）
export function useAbout() {
  const [about, setAbout] = useState<AboutContent>(aboutDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetchTopPage().then(d => {
      setAbout({
        content: (d.about_text as string)                ?? aboutDefault.content,
        image:   (d.sub_title  as AboutContent["image"]) ?? undefined,
      });
    });
  }, []);

  return { about };
}

// ─── メニューカテゴリー ───────────────────────────────────────
// エンドポイント: menu（リスト型）
// フィールド: categoryKey, categoryTitle, order, items[title, price, comment?, image?]
export function useMenuCategoriesCMS() {
  const [menuCats, setMenuCats] = useState<MenuCategoryCMS[]>(menuCategoriesCMSDefault);

  useEffect(() => {
    if (!isCmsReady()) return;
    fetchMenuList().then(contents => {
      if (contents.length === 0) return;
      const np = (p: string) => p.replace(/\\/g, "¥");
      const cats: MenuCategoryCMS[] = contents.map((c: any) => ({
        id:            c.id            ?? c.categoryKey ?? "",
        categoryKey:   c.categoryKey   ?? "",
        categoryTitle: c.categoryTitle ?? "",
        order:         c.order         ?? 0,
        items: (c.items ?? []).map((item: any) => ({
          fieldId: item.fieldId ?? item.id ?? undefined,
          title:   item.title   ?? "",
          price:   np(item.price ?? ""),
          comment: item.comment ?? undefined,
          rank:    item.rank != null && item.rank !== "" ? Number(item.rank) || undefined : undefined,
          image:   item.image   ?? undefined,
        })),
      }));
      setMenuCats(cats);
    });
  }, []);

  return { menuCats };
}

// ─── ランキングコース ─────────────────────────────────────────
// エンドポイント: ranking（リスト型）
// フィールド: rank, title, price, description, categoryKey?, comment?, image?
export function useRankingCourses() {
  const [courses, setCourses] = useState<RankingCourse[]>(rankingCoursesDefault);
  const [loading, setLoading] = useState(!isCmsReady());

  useEffect(() => {
    if (!isCmsReady()) { setLoading(false); return; }
    fetchRankingList()
      .then(contents => {
        if (contents.length > 0) {
          const normalized: RankingCourse[] = contents.map((c: any, i: number) => ({
            id:          c.id          ?? String(i),
            rank:        c.rank        ?? i + 1,
            title:       c.title       ?? "",
            price:       (c.price ?? "").replace(/\\/g, "¥"),
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

// ─── pickup API（オブジェクト型 rank1/rank2/rank3 コンテンツ参照） ──
function fetchPickup(): Promise<Record<string, unknown>> {
  if (!_pickupPromise) {
    _pickupPromise = fetch(apiUrl("pickup?depth=2"), { headers: headers() })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Record<string, unknown>>;
      })
      .catch(() => ({}));
  }
  return _pickupPromise;
}

export function useRankingFromPickup() {
  const [courses, setCourses] = useState<RankingCourse[]>(rankingCoursesDefault);
  const [loading, setLoading] = useState(!isCmsReady());

  useEffect(() => {
    if (!isCmsReady()) { setLoading(false); return; }
    fetchPickup()
      .then(d => {
        const normalizePrice = (p: string) => p.replace(/\\/g, "¥");
        const toItem = (raw: any, rank: number): RankingCourse | null => {
          if (!raw || !raw.id) return null;
          return {
            id:          raw.id,
            rank,
            title:       raw.title       ?? "",
            price:       normalizePrice(raw.price ?? ""),
            description: raw.description ?? "",
            image:       typeof raw.image === "string"
                           ? raw.image
                           : raw.image?.url ?? undefined,
          };
        };
        const ranked = [
          toItem(d.rank1, 1),
          toItem(d.rank2, 2),
          toItem(d.rank3, 3),
        ].filter((c): c is RankingCourse => c !== null);

        if (ranked.length > 0) setCourses(ranked);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { courses, loading };
}

// ─── メニューのrankフィールドからランキングを生成 ───────────────
// menu API の各アイテムの rank(1〜3) を読んでランキングとして返す
export function useRankingFromMenu() {
  const [courses, setCourses] = useState<RankingCourse[]>(rankingCoursesDefault);
  const [loading, setLoading] = useState(!isCmsReady());

  useEffect(() => {
    if (!isCmsReady()) { setLoading(false); return; }
    fetchMenuList()
      .then(contents => {
        const ranked: RankingCourse[] = [];
        contents.forEach((cat: any) => {
          (cat.items ?? []).forEach((item: any, i: number) => {
            const r = item.rank != null && item.rank !== "" ? Number(item.rank) || undefined : undefined;
            if (r && r >= 1 && r <= 3) {
              ranked.push({
                id:          `${cat.id ?? cat.categoryKey}-${i}`,
                rank:        r,
                title:       item.title   ?? "",
                price:       (item.price ?? "").replace(/\\/g, "¥"),
                description: item.comment ?? "",
                categoryKey: cat.categoryKey ?? undefined,
                image:       typeof item.image === "string"
                               ? item.image
                               : item.image?.url ?? undefined,
              });
            }
          });
        });
        if (ranked.length > 0) {
          setCourses(ranked.sort((a, b) => a.rank - b.rank));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { courses, loading };
}

// ─── スタッフ ────────────────────────────────────────────────
// エンドポイント: top-page（staff_list repeater）
// フィールド: name, photo(media), role, spacialty?(typo in schema), comment?
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
// エンドポイント: top-page（snake_case）
// フィールド: tel, address, directions, hours, regular_holiday,
//             payment, notes, map_embed_src, map_link
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
        regularHoliday: (d.regular_holiday as string) ?? accessDefault.regularHoliday,
        payment:        (d.payment         as string) ?? accessDefault.payment,
        notes:          (d.notes           as string) ?? accessDefault.notes,
        mapEmbedSrc:    (d.map_embed_src   as string) ?? accessDefault.mapEmbedSrc,
        mapLink:        (d.map_link        as string) ?? accessDefault.mapLink,
      });
    });
  }, []);

  return { access };
}
