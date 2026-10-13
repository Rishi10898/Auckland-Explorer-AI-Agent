(() => {
  const key = "aucklandExplorerTheme";
  const themes = ["light", "dark", "ocean", "sunset", "forest", "lavender"];
  const triggers = document.querySelectorAll("[data-theme-menu-trigger]");
  const menus = document.querySelectorAll("[data-theme-menu]");
  const toggles = document.querySelectorAll("[data-theme-toggle]");
  const options = document.querySelectorAll("[data-theme-option]");

  function setMenusOpen(open) {
    triggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", String(open));
    });
    menus.forEach((menu) => { menu.hidden = !open; });
  }

  function applyTheme(theme, persist = true) {
    const selected = themes.includes(theme) ? theme : "light";
    document.body.classList.remove(...themes.map((name) => `theme-${name}`));
    document.body.classList.add(`theme-${selected}`);
    const dark = selected === "dark";
    triggers.forEach((trigger) => {
      trigger.textContent = dark ? "☀️" : "🌙";
      trigger.setAttribute("aria-label", `Appearance options. Current theme: ${selected}`);
    });
    toggles.forEach((toggle) => {
      toggle.textContent = dark ? "☀️" : "🌙";
      toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      toggle.setAttribute("aria-pressed", String(dark));
    });
    options.forEach((option) => {
      const isSelected = option.dataset.themeOption === selected;
      option.setAttribute("aria-checked", String(isSelected));
      option.classList.toggle("selected", isSelected);
    });
    if (!persist) return;

    try {
      localStorage.setItem(key, selected);
    } catch (error) {
      console.error("Could not save the selected theme.", error);
    }
  }

  let savedTheme = "light";
  try {
    savedTheme = localStorage.getItem(key) || savedTheme;
  } catch (error) {
    console.error("Could not read the saved theme.", error);
  }
  applyTheme(savedTheme, false);

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const open = trigger.getAttribute("aria-expanded") !== "true";
      setMenusOpen(open);
      if (open) {
        menus[0]?.querySelector("[data-theme-option], [data-theme-toggle]")?.focus();
      }
    });
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      applyTheme(option.dataset.themeOption);
      setMenusOpen(false);
      document.querySelector("[data-theme-menu-trigger]")?.focus();
    });
  });

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const selected = document.body.classList.contains("theme-dark") ? "light" : "dark";
      applyTheme(selected);
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("[data-theme-picker]")) {
      setMenusOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const openTrigger = document.querySelector("[data-theme-menu-trigger][aria-expanded='true']");
      setMenusOpen(false);
      openTrigger?.focus();
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === key) applyTheme(event.newValue || "light", false);
  });
})();
