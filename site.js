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

const gallery = document.querySelector("[data-gallery]");

if (gallery) {
  const controls = gallery.querySelector(".gallery-controls");
  const options = [...controls.querySelectorAll("[data-variant]")];
  const panels = [...gallery.querySelectorAll(".gallery-panel")];
  const topDetails = document.querySelector("[data-top-details]");

  function showVariant(variant) {
    const active = options.some((button) => button.dataset.variant === variant) ? variant : "top";
    for (const panel of panels) panel.hidden = panel.id !== active;
    for (const button of options) {
      button.setAttribute("aria-pressed", String(button.dataset.variant === active));
    }
    topDetails.hidden = active !== "top";
  }

  function loadVariantFromUrl() {
    const params = new URLSearchParams(window.location.search);
    showVariant(params.get("model") ?? window.location.hash.slice(1));
  }

  for (const button of options) {
    button.addEventListener("click", () => {
      const variant = button.dataset.variant;
      if (button.getAttribute("aria-pressed") === "true") return;
      const url = new URL(window.location.href);
      url.hash = "";
      if (variant === "top") url.searchParams.delete("model");
      else url.searchParams.set("model", variant);
      window.history.pushState(null, "", url);
      showVariant(variant);
    });
  }

  loadVariantFromUrl();
  controls.hidden = false;
  window.addEventListener("popstate", loadVariantFromUrl);
  window.addEventListener("hashchange", loadVariantFromUrl);
}

const inquiry = document.querySelector("[data-inquiry]");

if (inquiry) {
  const { type, brief } = inquiry.elements;
  const draftField = inquiry.querySelector("[data-draft-field]");
  const output = inquiry.querySelector("[data-output]");
  const copy = inquiry.querySelector("[data-copy]");
  const status = inquiry.querySelector(".form-status");

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
