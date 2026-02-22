import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// ブランド見出し用：セリフ体（ヒーローロゴ・セクション見出し・価格表示）
const cormorantGaramond = Cormorant_Garamond({
  variable: "--cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// 本文・UI用：日本語対応サンセリフ体
const notoSansJP = Noto_Sans_JP({
  variable: "--noto-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
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
    <html lang="ja" className={`${cormorantGaramond.variable} ${notoSansJP.variable}`}>
      <head>
        {/*
          React より先に実行されるインラインスクリプト。
          同一セッション内の更新（F5）でスクロール位置を即リストアし、
          ページがトップにフラッシュするのを防ぐ。
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              history.scrollRestoration = 'manual';
              // ソフトリフレッシュ：スクロール復元が必要な場合はページを即座に非表示にする
              // (body が描画される前に opacity:0 を設定し、React mount 後に即時復元する)
              if (sessionStorage.getItem('hairholic_intro') === '1') {
                var y = parseInt(sessionStorage.getItem('hairholic_scroll') || '0', 10);
                if (y > 0) {
                  document.documentElement.style.opacity = '0';
                  setTimeout(function() { document.documentElement.style.opacity = ''; }, 2000);
                }
              }
            } catch(e) {}
          })();
        ` }} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
