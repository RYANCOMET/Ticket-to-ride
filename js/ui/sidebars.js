export const MOBILE_SIDEBAR_BREAKPOINT = 950;

let mobileMode = false;
let currentPanel = "map";

let desktopLeftVisible = true;
let desktopRightVisible = true;

function getEls() {
  return {
    body: document.body,
    sidebar: document.getElementById("sidebar"),
    ticketSidebar: document.getElementById("ticketSidebar"),
    mapEl: document.getElementById("map")
  };
}

export function syncMobileSidebarMode() {
  mobileMode =
    window.innerWidth <= MOBILE_SIDEBAR_BREAKPOINT &&
    window.innerHeight > window.innerWidth;
  return mobileMode;
}

export function applySidebarState() {
  const { body, sidebar, ticketSidebar, mapEl } = getEls();
  if (!body || !sidebar || !ticketSidebar || !mapEl) return;

  if (mobileMode) {
    sidebar.style.display = currentPanel === "left" ? "block" : "none";
    ticketSidebar.style.display = currentPanel === "right" ? "block" : "none";
    mapEl.style.display = currentPanel === "map" ? "block" : "none";
    body.style.gridTemplateColumns = "1fr";
    return;
  }

  sidebar.style.display = desktopLeftVisible ? "" : "none";
  ticketSidebar.style.display = desktopRightVisible ? "" : "none";
  mapEl.style.display = "";

  if (desktopLeftVisible && desktopRightVisible) {
    body.style.gridTemplateColumns = "var(--left-sidebar-width) minmax(0, 1fr) var(--right-sidebar-width)";
  } else if (desktopLeftVisible && !desktopRightVisible) {
    body.style.gridTemplateColumns = "var(--left-sidebar-width) minmax(0, 1fr)";
  } else if (!desktopLeftVisible && desktopRightVisible) {
    body.style.gridTemplateColumns = "minmax(0, 1fr) var(--right-sidebar-width)";
  } else {
    body.style.gridTemplateColumns = "minmax(0, 1fr)";
  }
}

export function toggleSidebar(target) {
  if (mobileMode) {
    currentPanel = currentPanel === target ? "map" : target;
    applySidebarState();
    return;
  }

  if (target === "left") {
    desktopLeftVisible = !desktopLeftVisible;
  } else if (target === "right") {
    desktopRightVisible = !desktopRightVisible;
  }

  applySidebarState();
}
