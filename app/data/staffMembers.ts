import { StaffMember } from "../types";

// MicroCMS未設定時のフォールバックデータ
// photo は public/image/ に配置したファイル名を "/image/ファイル名" で指定
export const staffMembers: StaffMember[] = [
  {
    id: "nakamura",
    name: "中村 紘平",
    role: "オーナー・理容師",
    specialty: "フェードカット、シェービング",
    comment: "",
    photo: "", // 例: "/image/nakamura.jpg"
    order: 1,
  },
];
