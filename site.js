"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
const mobileLayout = window.matchMedia("(max-width: 760px)");

if (menuToggle && mainNav) {
  function setMenuOpen(isOpen) {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    mainNav.classList.toggle("is-open", isOpen);
  }

  document.documentElement.classList.add("has-menu");
  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
  mobileLayout.addEventListener("change", () => setMenuOpen(false));
}

const gallery = document.querySelector("[data-product-gallery]");

if (gallery) {
  const thumbnails = gallery.querySelector(".media-thumbnails");
  const choices = [...thumbnails.querySelectorAll("[data-media]")];
  const panels = [...gallery.querySelectorAll(".media-panel")];
  const status = gallery.querySelector("[data-media-status]");
  const zoom = gallery.querySelector("[data-media-zoom]");
  const dialog = gallery.querySelector("dialog");
  const enlargedImage = dialog.querySelector("img");
  let activePanel = panels[0];

  function showMedia(choice) {
    const panel = gallery.querySelector("#" + choice.getAttribute("aria-controls"));
    if (activePanel !== panel) activePanel.querySelector("video")?.pause();
    for (const item of panels) item.hidden = item !== panel;
    for (const item of choices) item.setAttribute("aria-pressed", String(item === choice));
    status.textContent = choice.dataset.media === "video"
      ? "环绕与拆解演示 · 无声"
      : choice.textContent.trim();
    zoom.hidden = !panel.querySelector("img") || typeof dialog.showModal !== "function";
    activePanel = panel;
  }

  for (const choice of choices) {
    choice.addEventListener("click", () => showMedia(choice));
  }

  thumbnails.addEventListener("keydown", (event) => {
    const index = choices.indexOf(event.target);
    if (index === -1 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const offset = event.key === "ArrowLeft" ? -1 : 1;
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? choices.length - 1
      : (index + offset + choices.length) % choices.length;
    choices[nextIndex].focus();
    showMedia(choices[nextIndex]);
  });

  zoom.addEventListener("click", () => {
    const image = activePanel.querySelector("img");
    if (!image) return;
    enlargedImage.src = image.currentSrc || image.src;
    enlargedImage.alt = image.alt;
    dialog.showModal();
  });

  thumbnails.hidden = false;
  showMedia(choices[0]);
}

const inquiry = document.querySelector("[data-inquiry]");

if (inquiry) {
  const { type, brief } = inquiry.elements;
  const draftField = inquiry.querySelector("[data-draft-field]");
  const output = inquiry.querySelector("[data-output]");
  const copy = inquiry.querySelector("[data-copy]");
  const status = inquiry.querySelector(".form-status");

  const topic = new URLSearchParams(window.location.search).get("topic");
  if (topic === "product") type.value = "产品咨询";
  inquiry.hidden = false;
  brief.addEventListener("input", () => brief.setCustomValidity(""));
  inquiry.addEventListener("submit", (event) => {
    event.preventDefault();
    const description = brief.value.trim();
    if (!description) {
      brief.setCustomValidity("请输入合作设想。");
      brief.reportValidity();
      return;
    }

    output.value = [
      "南风润物 NANDEW · 合作需求",
      "合作方向：" + type.value,
      "合作设想：",
      description,
    ].join("\n");
    draftField.hidden = false;
    copy.hidden = false;
    status.textContent = "草稿已生成。";
  });

  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = "草稿已复制。";
    } catch {
      output.focus();
      output.select();
      status.textContent = "已选中草稿，请使用设备的复制快捷键。";
    }
  });
}
