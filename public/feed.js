// Script pour la bascule de la sidebar
(() => {
  try {
    const toggleBtn = document.getElementById("toggleSidebar");
    const sidebar = document.querySelector(".sidebar");

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
      });
    }
  } catch (err) {
    // environnement server-side : ignore
  }
})();

/*
 * Note: l'ancien script mentionnait la logique des cartes membres qui a été retirée.
 * Le code ci-dessus reste minimal : il gère l'interaction du bouton de la sidebar.
 */
