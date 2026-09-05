"use strict";
// 色は既存のメンバーカラーを取得。画像はHTMLから直接編集できます。
const memberColors = [...document.querySelectorAll(".member-card")]
  .map((card) =>
    getComputedStyle(card).getPropertyValue("--member-color").trim(),
  )
  .filter(Boolean);
const doors = [...document.querySelectorAll(".gallery-door")];
// 扉の地の色に対して、文字と金具が見える方の色を返します。
function inkFor(color) {
  const hex = color.replace("#", "");
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  const value = parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#20211f" : "#f4f3ef";
}
function paintDoor(door, color) {
  door.dataset.doorColor = color;
  door.style.setProperty("--door-color", color);
  door.style.setProperty("--door-ink", inkFor(color));
}
doors.forEach((door, index) => {
  // 最初は白と黒が交互。
  paintDoor(door, index % 2 ? "#20211f" : "#ffffff");
  door.addEventListener("click", () => {
    const open = door.getAttribute("aria-pressed") !== "true";
    if (!open) {
      // 閉まるときだけ色が変わります。ほかの扉が使っていない色から選ぶので、同じ色は並びません。
      const inUse = doors
        .filter((other) => other !== door)
        .map((other) => other.dataset.doorColor);
      const choices = memberColors.filter(
        (color) => color !== door.dataset.doorColor && !inUse.includes(color),
      );
      if (choices.length)
        paintDoor(door, choices[Math.floor(Math.random() * choices.length)]);
    }
    door.setAttribute("aria-pressed", String(open));
    door.setAttribute(
      "aria-label",
      "ギャラリー" + (index + 1) + "の扉を" + (open ? "閉じる" : "開く"),
    );
    door.closest(".gallery-item").querySelector(".gallery-state").textContent =
      open ? "閉じる ↙" : "開く ↗";
  });
});
const filters = document.querySelectorAll("[data-filter]");
// HTML内の作品カード数を数えるので、追加時に件数の手入力は不要です。
const total = document.querySelector('[data-filter="all"] sup');
if (total) total.textContent = document.querySelectorAll(".work-card").length;
filters.forEach((button) =>
  button.addEventListener("click", () => {
    filters.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    let count = 0;
    document.querySelectorAll("[data-category]").forEach((card) => {
      card.hidden =
        button.dataset.filter !== "all" &&
        button.dataset.filter !== card.dataset.category;
      if (!card.hidden) count++;
    });
    document.querySelector(".filter-status").textContent = count
      ? `${count}件を表示`
      : "該当する作品はまだありません";
  }),
);

// ヘッダーの高さをCSSへ渡し、メインビジュアルに重なる間だけ白抜きにします。
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
if (header) {
  const root = document.documentElement;
  let headerHeight = 0;
  function measure() {
    headerHeight = header.offsetHeight;
    root.style.setProperty("--header-h", headerHeight + "px");
  }
  function updateHeader() {
    if (!hero) return;
    const overHero = window.scrollY < hero.offsetHeight - headerHeight - 8;
    header.classList.toggle("is-over-hero", overHero);
  }
  measure();
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    updateHeader();
  });
  window.addEventListener("load", () => {
    measure();
    updateHeader();
  });
}

// スクロールに合わせた軽いフェードイン。動きを減らす設定では何もしません。
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  // 同じ列のカードは少しずつ遅らせて出します。
  document
    .querySelectorAll(".member-grid, .work-grid, .gallery-grid")
    .forEach((grid) => {
      const columns =
        getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      [...grid.children].forEach((item, index) =>
        item.style.setProperty("--reveal-delay", (index % columns) * 90 + "ms"),
      );
    });
  const targets = document.querySelectorAll(
    [
      ".section-heading",
      ".section-intro",
      ".about-content",
      ".work-filters",
      ".member-card",
      ".work-card",
      ".gallery-item",
      ".news-item",
      ".footer-title",
      ".footer-social",
      ".profile-layout",
      ".detail-summary",
      ".detail-image",
      ".detail-body",
    ].join(","),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0 },
  );
  targets.forEach((target) => {
    target.classList.add("reveal");
    observer.observe(target);
  });
}
