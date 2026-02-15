import { RankingCourse } from "../types";

// MicroCMSから取得する想定のランキングデータ
// 本番ではこのファイルは不要になり、APIから取得
export const rankingCourses: RankingCourse[] = [
  {
    id: "ranking-1",
    rank: 1,
    title: "カット+酵素スパ+マッサージシャンプー+頭浸浴",
    price: "¥8,800",
    description: "うたた寝OK！最上級のヘアケア＆極上のリラックスコース♪シャンプーブロー込み",
    image: "/images/ranking-1.jpg",
    categoryKey: "headspa", // menuCategoriesのキーと対応
  },
  {
    id: "ranking-2",
    rank: 2,
    title: "カット+マッサージシャンプー+頭浸浴",
    price: "¥7,000",
    description: "うたた寝OK!頭浸浴で頑張るあなたの疲労を癒します。シャンプーブロー込み",
    image: "/images/ranking-2.jpg",
    categoryKey: "headspa",
  },
  {
    id: "ranking-3",
    rank: 3,
    title: "カット+シェービング（顔全体＆眉剃り）",
    price: "¥5,500",
    description: "眉カット、眉剃りが不要な場合はお気軽にお申し付けください。シャンプーブロー込み",
    image: "/images/ranking-3.jpg",
    categoryKey: "cut",
  },
];