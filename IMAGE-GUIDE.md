# 画像の管理・差し替え

画像は `images/` に保存し、`index.html` の該当する `<img>` の `src` を変更します。HTMLを保存するだけで反映されます。JSONやビルドは不要です。

| 場所                           | 現在のファイル                                    | 推奨サイズ               |
| ------------------------------ | ------------------------------------------------- | ------------------------ |
| Unlock the Worldの背景         | `images/hero-photo.jpg`                           | 横2400 × 縦1600px（3:2） |
| ギャラリーの扉4枚              | `images/gallery/gallery-1.svg` ～ `gallery-4.svg` | 横1200 × 縦1800px（2:3） |
| Worksのパネル                  | `images/work-heso.jpg` ほか                       | 横1600 × 縦1200px（4:3） |
| Worksの詳細ページ              | `images/work-heso-full.jpg` ほか                  | 長辺1700px               |
| メンバーのタイル・プロフィール | `images/member1.jpg` ～ `member6.jpg`             | 正方形1200 × 1200px      |

ギャラリーの扉の中身は「準備中」のプレースホルダー（ロゴ入り）です。写真ができたら同じファイル名で差し替えてください。写真はJPEGまたはWebP、1枚200～500KB程度を目安にしてください。

Worksのパネルは縦位置のポスターを横長に見せるため、ぼかした同じ画像を背景に敷き、中央にポスター全体を置いた合成画像です。新しい展覧会を足すときも同じ作りにすると揃います。

## ヒーローの背景

`index.html` の `class="hero-background"` を検索します。例：

```html
<img
  class="hero-background"
  src="images/hero.jpg"
  alt=""
  width="2400"
  height="1600"
  fetchpriority="high"
/>
```

左に白文字が載るため、左半分が暗く、主要な被写体が右寄りの写真が合います。横長画面とスマートフォンでトリミングが変わるので、画像自体に文字を入れず、周辺が切れてもよい構図にしてください。CSSで暗いグラデーションを重ねています。背景の表示位置は `.hero-background` の `object-position`、暗さは `.hero::after` で調整できます。

## ギャラリー

`index.html` の `id="gallery"` を検索し、各扉の画像を変更します。

```html
<img
  id="gallery-image-1"
  class="door-reveal-image"
  src="images/gallery/photo-1.jpg"
  alt="写真の内容を説明"
  width="1200"
  height="1800"
  loading="lazy"
/>
```

画像は `object-fit: cover` で扉いっぱいに表示します。2:3なら余白もトリミングもなく収まります。別の縦横比では上下または左右が切れます。必要に応じてCSSで `#gallery-image-1 { object-position: 50% 30%; }` のように個別調整できます。開いた扉の板が左端の約1割を覆う仕様なので、大事な被写体は少し中央寄りに配置してください。

枚数を増減するときは `<figure class="gallery-item">…</figure>` を追加・削除します。4列、スマートフォンでは2列で表示します。扉の色は白・黒の交互から始まり、扉を閉じるたびにメンバーカラーへ切り替わります。
