// MicroCMS連携用の型定義

export interface SiteSettings {
  heroSubtitle: string;
  heroBgImage?: { url: string; width: number; height: number };
  aboutTitle: string;
  menuTitle: string;
  staffTitle: string;
  galleryTitle: string;
  accessTitle: string;
}

export interface AboutContent {
  content: string;
  image?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface MenuItemCMS {
  fieldId?: string;
  title: string;
  price: string;
  comment?: string;
  rank?: number;
  image?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface MenuCategoryCMS {
  id: string;
  categoryKey: string;
  categoryTitle: string;
  order?: number;
  items: MenuItemCMS[];
}

export interface RankingCourse {
  id: string;
  rank: number;
  title: string;
  price: string;
  description: string;
  categoryKey?: string;
  comment?: string;
  image?: string;
}

export interface MenuItem {
  title: string;
  price: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuCategories {
  [key: string]: MenuCategory;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  comment?: string;
  photo?: string;
  order?: number;
  location?: string;
}

export interface AccessInfo {
  tel: string;
  address: string;
  directions: string;
  hours: string;
  regularHoliday: string;
  payment: string;
  notes: string;
  mapEmbedSrc: string;
  mapLink: string;
}

// top-page 統合API: news_list 用（将来のニュースセクション）
export interface NewsItem {
  date: string;
  content: string;
}
