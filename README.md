# &6 — Unlock the World

HTML・CSS・JavaScriptだけの静的サイトです。JSONの編集やHTMLの生成は不要です。

## 編集とプレビュー

1. `unlock.code-workspace` をVSCodeで開きます。
2. ルートの `index.html` を開きます。
3. 右クリック → **Open with Live Server**。VSCode内ならコマンドパレットから **Live Preview: Show Preview (Internal Browser)** を選びます。
4. ファイルを編集して保存すると、プレビューが更新されます。ビルドは不要です。

`_site/` は公開用コピーなので編集しません。普段の作業では使いません。

## どこを編集する？

| 編集内容                                              | ファイル            |
| ----------------------------------------------------- | ------------------- |
| トップの文章、About、メンバー名・紹介、Works一覧、SNS | `index.html`        |
| 色、文字サイズ、余白、スマートフォン表示              | `style.css`         |
| 扉の開閉、Worksの絞り込み                             | `script.js`         |
| 展覧会の詳細文・画像                                  | `works/` 内の各HTML |
| 写真や画像                                            | `images/`           |

HTMLには各セクションの目印コメントを入れています。メンバーカラーはCSS末尾の「メンバーカラー」で指定しています。

## メンバーの修正

`index.html` の「メンバー」セクションで、各 `article class="member-card …"` の名前・紹介文・画像パスを編集します。色は `style.css` の `.member-1` ～ `.member-6` で変更できます。

## Worksの追加

現在は `works/heso.html`（へそ展）・`works/vi.html`（VI展）・`works/graduate.html`（卒業制作展）の3件です。本文は公開を優先して「※編集中」にしてあります。

1. `works/` 内のHTMLをコピーして、新しいファイル名にします。
2. コピーしたHTMLの `title`、description・OGP、見出し、紹介文、画像を編集します。
3. `index.html` の「Works一覧」で `<a class="work-card" …> … </a>` を1件分コピーします。
4. リンク先、画像、タイトル、年、説明を変更します。`data-category` は「作品」または「展覧会」です。

Allの件数はJavaScriptでカード数から計算します。JSONは使いません。共通のヘッダー・SNS等を変更するときは、トップと各詳細HTMLの両方を変更してください。

## GitHub Pages

同梱のGitHub Actionsは、HTML・CSS・JS・画像をそのままコピーして公開します。HTMLを書き換える処理はありません。

1. このフォルダーをGitHubのリポジトリへアップロードします（`_site/` は不要）。
2. Settings → Pages → Sourceを **GitHub Actions** にします。
3. mainブランチに反映すると公開されます。

各HTMLにはtitle・description・OGP・画像altが入っています。公開URLが決まったら、各ページのheadにcanonical・og:url・絶対URLのog:imageを追加してください。公開先はまだ未設定です。

## 任意の開発用コマンド

普段の編集にはNode.jsもコマンドも不要です。必要な場合だけNode.js 20以上で使えます。

- `npm run dev`: ローカルサーバー（http://127.0.0.1:4173）
- `npm run check` またはVSCodeの Ctrl+Shift+B: リンク検査のみ。ファイル変更なし。
- `npm run build`: GitHub Pages用に `_site/` へコピーするだけ。元のHTMLは変更しません。

## プロフィールと扉の更新

- 各メンバーのプロフィールは `members/member-1.html` ～ `member-6.html` を直接編集します。トップのカードは肩書を省略し、詳細ページに掲載しています。
- メインコピーは `index.html` の `id="hero-title"`。CSS末尾の `.hero-unlock` と `.hero-world` で強弱を調整します。
- 扉は独立したGalleryセクションの4枚です。各画像はindex.htmlのimgタグで直接指定し、クリックで開閉します。画像サイズ・差し替え方法は [IMAGE-GUIDE.md](IMAGE-GUIDE.md) を参照してください。
- 扉の色は最初が白・黒の交互で、**閉じるとき**にメンバーカラーへ切り替わります。同時に同じ色は出ません。色の定義は `style.css` 末尾のメンバーカラー、切り替えは `script.js` の `paintDoor` です。
- ヘッダーはメインビジュアルに重なっている間だけ白抜きになり、スクロールすると白い背景に戻ります。切り替えは `script.js` の `is-over-hero`、見た目は `style.css` の同名クラスです。
- 各セクションはスクロールに合わせて薄くフェードインします。対象は `script.js` のセレクター一覧で増減できます。OSの「視差効果を減らす」設定では動きません。
