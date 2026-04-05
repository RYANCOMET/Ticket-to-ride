export let isMobileSidebarMode = false;

export function syncMobileSidebarMode() {
  isMobileSidebarMode = window.innerWidth <= 950;
}

export function applySidebarState(sidebar, ticketSidebar, mapEl) {
  if (!isMobileSidebarMode) {
    sidebar.style.display = "";
    ticketSidebar.style.display = "";
    mapEl.style.display = "";
    return;
  }

  sidebar.style.display = "none";
  ticketSidebar.style.display = "none";
  mapEl.style.display = "block";
}

export function toggleSidebar(sidebar, ticketSidebar, mapEl, target) {
  if (!isMobileSidebarMode) return;

  sidebar.style.display = "none";
  ticketSidebar.style.display = "none";
  mapEl.style.display = "none";

  if (target === "left") sidebar.style.display = "block";
  if (target === "right") ticketSidebar.style.display = "block";
  if (target === "map") mapEl.style.display = "block";
}
