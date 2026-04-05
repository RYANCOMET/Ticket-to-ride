export function initAccordions() {
  document.querySelectorAll(".accordion-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".accordion-item");
      item.classList.toggle("is-open");
    });
  });
}
