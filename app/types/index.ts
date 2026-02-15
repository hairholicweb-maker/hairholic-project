// MicroCMS連携用の型定義

export interface RankingCourse {
  id: string;
  rank: number; // 1, 2, 3
  title: string;
  price: string;
  description: string;
  image: string;
  categoryKey?: string; // メニューカテゴリーと紐付け用
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
  photo?: string; // URL（public/image/ のローカルパス or MicroCMS CDN URL）
  order?: number;
}