(() => {
  const key = "aucklandExplorerTheme";
  const themes = ["light", "dark", "ocean", "sunset", "forest", "lavender"];
  const button = document.querySelector("[data-theme-toggle]");
  const select = document.querySelector("[data-theme-select]");

  function applyTheme(theme) {
    const selected = themes.includes(theme) ? theme : "light";
    document.body.classList.remove(...themes.map((name) => `theme-${name}`));
    document.body.classList.add(`theme-${selected}`);
    if (select) select.value = selected;
    if (button) {
      const dark = selected === "dark";
      button.textContent = dark ? "☀️" : "🌙";
      button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      button.setAttribute("aria-pressed", String(dark));
    }
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
  applyTheme(savedTheme);

  button?.addEventListener("click", () => applyTheme(select?.value === "dark" ? "light" : "dark"));
  select?.addEventListener("change", () => applyTheme(select.value));
})();
