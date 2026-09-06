"use strict";
(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const paths = (value) => (value || "").split(/\s+/).filter(Boolean);
  const preload = (src) => {
    new Image().src = src;
  };
  const restart = (element, className) => {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let audioContext;
  const audioOut = (volume) => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      audioContext = audioContext || new Ctx();
      if (audioContext.state === "suspended") audioContext.resume();
      const master = audioContext.createGain();
      master.gain.value = volume;
      master.connect(audioContext.destination);
      return master;
    } catch {
      return null;
    }
  };

  const playKeyClunk = () => {
    const master = audioOut(0.2);
    if (!master) return;
    const now = audioContext.currentTime;
    for (const hit of [
      { at: 0, freq: 900, level: 0.55 },
      { at: 0.085, freq: 1900, level: 0.9 },
    ]) {
      const length = Math.floor(audioContext.sampleRate * 0.06);
      const buffer = audioContext.createBuffer(
        1,
        length,
        audioContext.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      }
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      const filter = audioContext.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = hit.freq;
      filter.Q.value = 1.2;
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(hit.level, now + hit.at);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + hit.at + 0.09);
      source.connect(filter).connect(gain).connect(master);
      source.start(now + hit.at);
    }
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, now + 0.085);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.17);
    gain.gain.setValueAtTime(0.7, now + 0.085);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(gain).connect(master);
    osc.start(now + 0.085);
    osc.stop(now + 0.22);
  };

  const playUnlockChime = () => {
    const master = audioOut(0.16);
    if (!master) return;
    const now = audioContext.currentTime;
    [784, 1046.5, 1318.5].forEach((frequency, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      const start = now + index * 0.085;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(1, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
      osc.connect(gain).connect(master);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  };

  const setupHeader = () => {
    const header = $(".site-header");
    if (!header) return;
    const hero = $(".hero");
    let headerHeight = 0;
    const measure = () => {
      headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty(
        "--header-h",
        headerHeight + "px",
      );
    };
    const update = () => {
      if (!hero) return;
      header.classList.toggle(
        "is-over-hero",
        window.scrollY < hero.offsetHeight - headerHeight - 8,
      );
    };
    const sync = () => {
      measure();
      update();
    };
    sync();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("load", sync);
  };

  const setupReveal = () => {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    for (const grid of $$(".member-grid, .work-grid, .gallery-grid")) {
      const columns =
        getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      [...grid.children].forEach((item, index) => {
        item.style.setProperty("--reveal-delay", (index % columns) * 90 + "ms");
      });
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );
    const selector = [
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
    ].join(",");
    for (const target of $$(selector)) {
      target.classList.add("reveal");
      observer.observe(target);
    }
  };

  const setupWorkFilters = () => {
    const buttons = $$("[data-filter]");
    if (!buttons.length) return;
    const total = $('[data-filter="all"] sup');
    if (total) total.textContent = $$(".work-card").length;
    const status = $(".filter-status");
    for (const button of buttons) {
      button.addEventListener("click", () => {
        for (const item of buttons) {
          item.setAttribute("aria-pressed", String(item === button));
        }
        let count = 0;
        for (const card of $$("[data-category]")) {
          card.hidden =
            button.dataset.filter !== "all" &&
            button.dataset.filter !== card.dataset.category;
          if (!card.hidden) count++;
        }
        if (status) {
          status.textContent = count
            ? `${count}件を表示`
            : "該当する作品はまだありません";
        }
      });
    }
  };

  const setupGallery = () => {
    const doors = $$(".gallery-door");
    if (!doors.length) return;
    const memberColors = $$(".member-card")
      .map((card) =>
        getComputedStyle(card).getPropertyValue("--member-color").trim(),
      )
      .filter(Boolean);
    const photos = paths($(".gallery-grid")?.dataset.photos);
    const achievement = $(".achievement");
    const flash = $(".unlock-flash");
    let achievementTimer;

    const ink = (color) => {
      const hex = color.replace("#", "");
      const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
      const value = parseInt(full, 16);
      const luma =
        (((value >> 16) & 255) * 299 +
          ((value >> 8) & 255) * 587 +
          (value & 255) * 114) /
        1000;
      return luma > 150 ? "#20211f" : "#f4f3ef";
    };
    const paint = (door, color) => {
      door.dataset.doorColor = color;
      door.style.setProperty("--door-color", color);
      door.style.setProperty("--door-ink", ink(color));
    };
    const imageOf = (door) => door.querySelector(".door-reveal-image");
    const queue = (door, src) => {
      if (!photos.length) return;
      const current = imageOf(door).getAttribute("src");
      const choices = photos.filter((photo) => photo !== current);
      const next = src || pick(choices.length ? choices : photos);
      door.dataset.nextPhoto = next;
      preload(next);
    };
    const repaint = (door) => {
      const inUse = doors
        .filter((other) => other !== door)
        .map((other) => other.dataset.doorColor);
      const choices = memberColors.filter(
        (color) => color !== door.dataset.doorColor && !inUse.includes(color),
      );
      if (choices.length) paint(door, pick(choices));
    };
    const unlocked = () => {
      if (!achievement || doors.length < 2) return;
      const shown = doors.map((door) => imageOf(door).getAttribute("src"));
      if (!shown.every((src) => src === shown[0])) return;
      if (achievement.classList.contains("is-shown")) return;
      playUnlockChime();
      if (!reduceMotion && flash) restart(flash, "is-playing");
      achievement.hidden = false;
      requestAnimationFrame(() => achievement.classList.add("is-shown"));
      clearTimeout(achievementTimer);
      achievementTimer = setTimeout(() => {
        achievement.classList.remove("is-shown");
        setTimeout(() => {
          achievement.hidden = true;
        }, 600);
      }, 6000);
    };

    const firstDeal = [...photos].sort(() => Math.random() - 0.5);
    doors.forEach((door, index) => {
      paint(door, index % 2 ? "#20211f" : "#ffffff");
      queue(door, firstDeal[index]);
      door.addEventListener("click", () => {
        const open = door.getAttribute("aria-pressed") !== "true";
        if (open) {
          const next = door.dataset.nextPhoto;
          if (next) imageOf(door).setAttribute("src", next);
          queue(door);
        } else {
          repaint(door);
        }
        door.setAttribute("aria-pressed", String(open));
        if (open) unlocked();
        door.setAttribute(
          "aria-label",
          "ギャラリー" + (index + 1) + "の扉を" + (open ? "閉じる" : "開く"),
        );
        $(".gallery-state", door.closest(".gallery-item")).textContent = open
          ? "閉じる ↙"
          : "開く ↗";
      });
    });
  };

  const setupKey = () => {
    const button = $(".key-button");
    const grid = $(".member-grid");
    if (!button || !grid) return;
    const keys = ["a", "b", "c"];
    const piece = $(".key-piece", button);
    const images = $$("img[data-variants]", grid);
    const keySrc = (key) => "images/keys/key-" + key + ".svg";
    keys.forEach((key) => preload(keySrc(key)));
    let busy = false;

    button.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      for (const image of images)
        paths(image.dataset.variants).forEach(preload);
      const next = keys[(keys.indexOf(button.dataset.key) + 1) % keys.length];
      playKeyClunk();
      const apply = () => {
        button.dataset.key = next;
        button.setAttribute(
          "aria-label",
          "メンバーの写真を切り替える。今の鍵は" + next.toUpperCase(),
        );
        piece.src = keySrc(next);
        for (const image of images) {
          image.src = paths(image.dataset.variants)[keys.indexOf(next)];
        }
      };
      if (reduceMotion) {
        apply();
        busy = false;
        return;
      }
      restart(button, "is-turning");
      grid.classList.add("is-swapping");
      setTimeout(() => {
        apply();
        grid.classList.remove("is-swapping");
      }, 200);
      setTimeout(() => {
        button.classList.remove("is-turning");
        busy = false;
      }, 500);
    });
  };

  setupHeader();
  setupGallery();
  setupWorkFilters();
  setupKey();
  setupReveal();
})();
