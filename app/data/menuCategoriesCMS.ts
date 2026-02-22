import { MenuCategoryCMS } from "../types";
import { menuCategories } from "./menuCategories";

// MicroCMSが未設定の場合のフォールバックデータ
// 既存の静的データをリスト型フォーマットに変換
export const menuCategoriesCMSDefault: MenuCategoryCMS[] = Object.entries(menuCategories).map(
  ([key, cat], i) => ({
    id: key,
    categoryKey: key,
    categoryTitle: cat.name,
    order: i + 1,
    items: cat.items.map(item => ({ title: item.title, price: item.price })),
  })
);
