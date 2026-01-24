// Script pour la bascule de la sidebar
        const toggleBtn = document.getElementById("toggleSidebar");
        const sidebar = document.querySelector(".sidebar");

        if (toggleBtn && sidebar) {
             toggleBtn.addEventListener("click", () => {
                 sidebar.classList.toggle("collapsed");
             });
        }
        
        /* * Le script d'interactivité des cartes membres a été retiré,
         * car la section 'Têtes d'Affiche' est maintenant une liste
         * d'icônes simplifiée (Photo + Nom) sans bouton d'abonnement affiché par défaut.
         */