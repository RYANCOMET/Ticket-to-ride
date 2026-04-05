export const MOBILE_SIDEBAR_BREAKPOINT = 950;

let mobileMode = false;
let currentPanel = "map";

function getEls() {
  return {
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
  const { sidebar, ticketSidebar, mapEl } = getEls();
  if (!sidebar || !ticketSidebar || !mapEl) return;

  if (!mobileMode) {
    sidebar.style.display = "";
    ticketSidebar.style.display = "";
    mapEl.style.display = "";
    return;
  }

  sidebar.style.display = currentPanel === "left" ? "block" : "none";
  ticketSidebar.style.display = currentPanel === "right" ? "block" : "none";
  mapEl.style.display = currentPanel === "map" ? "block" : "none";
}

export function toggleSidebar(target) {
  if (!mobileMode) return;

  currentPanel = target;
  applySidebarState();
}
