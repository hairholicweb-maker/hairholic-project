import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

// ボディ・UI用：シャープで読みやすいサンセリフ
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// ヒーローブランド用：新聞マストヘッド調セリフ体（HAIRHOLICロゴのみ使用）
const playfairDisplay = Playfair_Display({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// セクション見出し用：日本語と自然に共存するセリフ体
const notoSerifJP = Noto_Serif_JP({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HAIRHOLIC | 長崎市のメンズバーバー",
  description: "長崎市浜口町のメンズバーバー HAIRHOLIC。フェードカット、ツイストスパイラル、頭浸浴、ヘッドスパなど幅広く対応。癒しとこだわりの技術をご提供。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${playfairDisplay.variable} ${notoSerifJP.variable}`}>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}