# Thought Refinery 仕様書

## 目的

殴り書きの思考を段階的に消化・昇華し、AIに渡しやすい形で出力できる個人用アプリ。

## 前提条件

- 使用者: 自分専用（sintuba@gmail.com）
- アクセス: Webブラウザ（Vercelデプロイ）
- ストレージ: GitHubリポジトリ（knowledge-base）
- AI連携: アプリ内では行わない。出力したYAMLを手動でAIにコピペする運用

## コアコンセプト

- 原本はMarkdown（人間が書く）
- 構造化はアプリが行う
- 判断は人間、チェックと助言はAI

## やること

- Markdownでメモを書いて保存する
- チェックリストで思考の状態を管理する
- learning → specs への昇華フローを提供する
- AIに渡すYAMLスナップショットを自動生成する
- YAML / JSON / MD ファイルをインポートしてMarkdownに変換する

## やらないこと

- アプリ内でのAI API呼び出し
- チーム共有・マルチユーザー対応
- モバイルアプリ（ブラウザのみ）
- WYSIWYG編集（Markdownテキスト編集のみ）

---

## 技術スタック

| 役割 | 技術 |
|---|---|
| フレームワーク | Next.js 15（App Router + TypeScript） |
| スタイリング | Tailwind CSS |
| 認証 | NextAuth.js + GitHub OAuth |
| GitHub操作 | Octokit（公式SDK） |
| Markdownエディタ | @uiw/react-md-editor |
| YAMLパース | js-yaml |
| Markdownプレビュー | react-markdown |
| デプロイ | Vercel |

---

## ディレクトリ構成（knowledge-base リポジトリ）

| ディレクトリ | 役割 | 昇華対象 |
|---|---|---|
| `learning/` | 殴り書きメモ置き場。雑でOK | ✅ |
| `specs/` | AIや他人に渡す完成形文書 | ✅（昇華先） |
| `specs/ai/` | AIの人格・役割・禁止事項の定義 | ✅（昇華先） |
| `snippets/` | コピペ・再利用前提のコード断片 | ❌（対象外） |
| `logs/` | 時系列の学習日誌・思考ログ | ❌（対象外） |
| `rules/` | リポジトリ全体の運用ルール | ❌（対象外） |

---

## 昇華フロー

```
[1. 殴り書き]       [2. フラグ付け]          [3. 昇華実行]
learning/ に書く → チェックリストで判断 → specs/ に整形して移動
status: raw        status: refining          status: stable
```

### ステップ詳細

1. `learning/` にメモを書く（新規作成のデフォルト先）
2. チェックリストで状態を付ける
3. 一覧画面の昇華レビューで `promote_candidate` のメモを確認
4. 「昇華する」ボタンで昇華エディタを開く
5. テンプレートに原文が流し込まれた状態で整形する
6. `specs/` に保存 → `learning/` の元ファイルを削除

### 昇華後テンプレート（specs用）

```markdown
# タイトル

## 目的

## 前提条件

## やること

## やらないこと

## 判断基準

## 未決定事項

---
<!-- 元の殴り書き原文 -->
```

---

## チェックリスト

思考の状態を軽い意思表示で示す。

| 項目 | 意味 |
|---|---|
| `ai_review` | AIに状況チェックを依頼したい |
| `promote_candidate` | 整理・昇華の候補 |
| `keep_learning` | まだlearningに留める |

---

## YAML出力（AIへの状態スナップショット）

チェックリスト更新時に自動生成される。人間は直接編集しない。

### スキーマ

```yaml
id: string
directory: enum [learning, specs, snippets, logs, rules]
status: enum [raw, refining, stable]
signals:
  ai_review: boolean
  promote_candidate: boolean
meta:
  title: string
  updated_at: date
  length: enum [short, medium, long]
guidance_questions:
  - このメモは何を扱っているか？
  - 何が未整理か？
  - 次に進める価値はあるか？
```

### 出力例

```yaml
id: react-hooks-memo
directory: learning
status: refining
signals:
  ai_review: true
  promote_candidate: false
meta:
  title: Reactのhooks整理
  updated_at: 2026-02-27
  length: medium
guidance_questions:
  - このメモは何を扱っているか？
  - 何が未整理か？
  - 次に進める価値はあるか？
```

---

## インポート機能

既存ファイルをMarkdownに変換して取り込む。

### 対応フォーマット

| 入力 | 変換ルール |
|---|---|
| `.yml` / `.yaml` | キー → `##` 見出し、値 → 本文に変換 |
| `.json` | キー → `**太字**`、配列 → リスト、ネスト → 見出し階層 |
| `.md` | そのまま取り込み |

### インポートフロー

```
① ファイル選択（ドラッグ&ドロップ or ファイル選択ボタン）
② プレビュー（左: 元ファイル ｜ 右: 変換後Markdown）
③ カテゴリ選択（default: learning）
④「取り込む」→ GitHubに保存、status: raw
```

---

## 画面構成

| 画面 | 役割 |
|---|---|
| ログイン | GitHub OAuthボタンのみ |
| 一覧 | カテゴリ別・ステータス別にメモを表示。フラグアイコンあり |
| 新規作成 / 編集 | Markdownエディタ ＋ チェックリスト ＋ オートセーブ |
| 昇華レビュー | `promote_candidate` のメモだけ集めた確認画面 |
| 昇華エディタ | テンプレート＋原文で specs/ 用に整形する専用画面 |
| インポート | ファイルアップロード → 変換プレビュー → カテゴリ選択 |
| YAML出力 | スナップショットをコピーするパネル |

---

## MVP定義

### Phase 1（最初に動かすもの）

- [ ] GitHubログイン（NextAuth.js + GitHub OAuth）
- [ ] knowledge-baseのメモ一覧表示
- [ ] メモを書いてGitHubに保存（オートセーブ）
- [ ] チェックリストでフラグ管理
- [ ] 昇華レビュー画面
- [ ] 昇華エディタ（テンプレート適用 + specs/に保存）
- [ ] インポート機能（YAML / JSON / MD → MD変換）

### Phase 2（MVP後）

- [ ] YAMLスナップショット出力・コピー
- [ ] 検索・フィルター
- [ ] ステータス履歴（いつ昇華したか）
- [ ] モバイル対応

---

## 運用ルール

- 書くときは置き場所を悩まない（とりあえず learning/ でOK）
- YAMLスナップショットは裏側の構造データ、直接編集しない
- AIは編集者ではなくレビュア（内容を書き換えさせない）
- 違和感が出たらこの仕様書に1行足す
- 最初から完璧を目指さない
