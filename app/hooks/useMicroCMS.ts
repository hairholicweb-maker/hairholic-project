import { useState, useEffect } from "react";
import { RankingCourse, StaffMember } from "../types";

// MicroCMS APIクライアント設定
const MICROCMS_API_KEY = process.env.NEXT_PUBLIC_MICROCMS_API_KEY || "";
const MICROCMS_SERVICE_DOMAIN = process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN || "";

// ランキングコースを取得
export function useRankingCourses() {
  const [courses, setCourses] = useState<RankingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 開発中は静的データを使用
    if (!MICROCMS_API_KEY || !MICROCMS_SERVICE_DOMAIN) {
      // フォールバック: 静的データをインポート
      import("../data/rankingCourses").then(module => {
        setCourses(module.rankingCourses);
        setLoading(false);
      });
      return;
    }

    // MicroCMSからデータ取得
    fetch(`https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/ranking-courses?orders=-rank`, {
      headers: {
        "X-MICROCMS-API-KEY": MICROCMS_API_KEY,
      },
    })
      .then(res => res.json())
      .then(data => {
        setCourses(data.contents);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
        // エラー時はフォールバック
        import("../data/rankingCourses").then(module => {
          setCourses(module.rankingCourses);
        });
      });
  }, []);

  return { courses, loading, error };
}

// メニューカテゴリーを取得
export function useMenuCategories() {
  const [categories, setCategories] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!MICROCMS_API_KEY || !MICROCMS_SERVICE_DOMAIN) {
      import("../data/menuCategories").then(module => {
        setCategories(module.menuCategories);
        setLoading(false);
      });
      return;
    }

    fetch(`https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/menu-categories`, {
      headers: {
        "X-MICROCMS-API-KEY": MICROCMS_API_KEY,
      },
    })
      .then(res => res.json())
      .then(data => {
        setCategories(data.contents);
        setLoading(false);
      })
      .catch(() => {
        import("../data/menuCategories").then(module => {
          setCategories(module.menuCategories);
          setLoading(false);
        });
      });
  }, []);

  return { categories, loading };
}

// スタッフ一覧を取得
export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!MICROCMS_API_KEY || !MICROCMS_SERVICE_DOMAIN) {
      import("../data/staffMembers").then(module => {
        setStaff(module.staffMembers);
        setLoading(false);
      });
      return;
    }

    fetch(`https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/staff?orders=order`, {
      headers: { "X-MICROCMS-API-KEY": MICROCMS_API_KEY },
    })
      .then(res => res.json())
      .then(data => {
        // MicroCMSの画像フィールドは { url, height, width } 形式なので url を取り出す
        const normalized: StaffMember[] = data.contents.map((s: any) => ({
          ...s,
          photo: s.photo?.url ?? s.photo ?? "",
        }));
        setStaff(normalized);
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