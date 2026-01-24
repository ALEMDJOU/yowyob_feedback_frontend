# 🧪 GUIDE DE TEST - Système I18N

## 🚀 Démarrer le Serveur

```bash
npm run dev
```

Puis ouvrez: http://localhost:3000 (ou 3001 si port occupé)

---

## 📋 Tests à Effectuer

### 1️⃣ Test du Sélecteur de Langue (Header)

#### Étapes:
1. Accédez à http://localhost:3000
2. Regardez le Header (en haut à droite)
3. Vous devez voir un bouton avec drapeau (ex: 🇫🇷 Français)
4. Cliquez sur le bouton
5. Un menu déroulant doit apparaître

#### Vérifications:
- ✅ Menu apparaît/disparaît au clic
- ✅ 4 options visibles: 🇫🇷 Français, 🇬🇧 English, 🇪🇸 Español, 🇩🇪 Deutsch
- ✅ Checkmark (✓) sur la langue actuelle
- ✅ Animation au survol
- ✅ Au clic = changement de langue instantané
- ✅ Texte du header change en temps réel

---

### 2️⃣ Test du Showcase des Langues (Landing Page)

#### Étapes:
1. Scrollez vers le bas de la landing page
2. Avant le footer, vous devez voir une section "Disponible en plusieurs langues"
3. Vous devez voir 4 cartes (une par langue)

#### Vérifications:
- ✅ Section visible et bien positionnée
- ✅ 4 cartes affichées (FR, EN, ES, DE)
- ✅ Grands drapeaux emoji sur chaque carte
- ✅ Nom natif sous le drapeau (Français, English, Español, Deutsch)
- ✅ Animation au survol des cartes
- ✅ Badge "✓ Actif" sur la langue actuelle
- ✅ Au clic sur une carte = changement de langue

---

### 3️⃣ Test de Persistance

#### Étapes:
1. Ouvrez DevTools (F12)
2. Application → LocalStorage
3. Cherchez `yowyob_locale`
4. Changez la langue
5. Vérifiez la valeur dans localStorage

#### Vérifications:
- ✅ Clé `yowyob_locale` existe
- ✅ Valeur change quand on change de langue
- ✅ Après F5 (refresh) = la langue est conservée
- ✅ Après fermeture/réouverture du navigateur = conservée

---

### 4️⃣ Test de Traductions

#### Étapes:
1. Changez en Français
   - Vérifiez: "Bienvenue", "Connexion", "S'inscrire"
2. Changez en Anglais
   - Vérifiez: "Welcome", "Login", "Register"
3. Changez en Espagnol
   - Vérifiez les traductions
4. Changez en Allemand
   - Vérifiez les traductions

#### Vérifications:
- ✅ Toutes les sections changent de langue
- ✅ Header change
- ✅ Landing page change
- ✅ Showcase change

---

### 5️⃣ Test Responsive (Mobile)

#### Étapes:
1. Ouvrez DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Testez sur:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

#### Vérifications:
- ✅ Sélecteur langue lisible sur mobile (pas de label "Français")
- ✅ Menu déroulant s'ouvre correctement
- ✅ Showcase: 2 colonnes sur mobile
- ✅ Showcase: 2 colonnes sur tablet
- ✅ Showcase: 4 colonnes sur desktop
- ✅ Pas de débordement de texte

---

### 6️⃣ Test HTML Lang Attribute

#### Étapes:
1. Ouvrez DevTools (F12)
2. Elements (Inspecteur)
3. Cherchez la balise `<html>`

#### Vérifications:
- ✅ Attribut `lang="fr"` par défaut
- ✅ Change en `lang="en"` quand vous changez de langue
- ✅ Change en `lang="es"` / `lang="de"` etc.

---

### 7️⃣ Test Scripts NPM

```bash
# Vérifier les clés manquantes
npm run i18n:check
# Résultat attendu: ✅ Toutes les langues en sync

# Voir les stats
npm run i18n:stats
# Affiche: FR: X clés, EN: X clés, etc.

# Valider le JSON
npm run i18n:validate
# Résultat attendu: ✅ FR: Valide, EN: Valide, etc.

# Générer un rapport
npm run i18n:report
# Génère: I18N_REPORT.txt
```

---

### 8️⃣ Test Pages Protégées

#### Étapes:
1. Allez sur `/auth/login`
2. Allez sur `/feed`
3. Allez sur `/auth/register`

#### Vérifications:
- ✅ Pas d'erreurs dans la console
- ✅ Sélecteur de langue fonctionne partout
- ✅ Les pages s'affichent correctement
- ✅ Les traductions s'affichent correctement

---

### 9️⃣ Test de Compilation

```bash
npm run build
```

#### Résultat attendu:
```
✓ Compiled successfully
✓ Generating static pages using 3 workers (9/9)
```

**Aucune erreur ne doit apparaître**

---

## 🎯 Checklist Complète de Test

```
HEADER & SÉLECTEUR
- [ ] Sélecteur de langue visible
- [ ] Menu déroulant fonctionne
- [ ] Changement de langue instantané
- [ ] Checkmark sur la bonne langue

SHOWCASE
- [ ] Section visible
- [ ] 4 cartes affichées
- [ ] Cartes cliquables
- [ ] Animation au survol
- [ ] Badge sur la langue active

PERSISTANCE
- [ ] localStorage sauvegarde la langue
- [ ] Refresh conserve la langue
- [ ] Fermeture/réouverture conserve

TRADUCTIONS
- [ ] Texte en français s'affiche bien
- [ ] Texte en anglais s'affiche bien
- [ ] Texte en espagnol s'affiche bien
- [ ] Texte en allemand s'affiche bien

RESPONSIVE
- [ ] Mobile 375px: Ok
- [ ] Tablet 768px: Ok
- [ ] Desktop 1920px: Ok

HTML LANG
- [ ] <html lang="fr"> au démarrage
- [ ] <html lang="en"> après changement
- [ ] Tous les changements reflétés

SCRIPTS
- [ ] npm run i18n:check: Succès
- [ ] npm run i18n:stats: Affiche stats
- [ ] npm run i18n:validate: Valide
- [ ] npm run i18n:report: Génère rapport

BUILD
- [ ] npm run build: Succès
- [ ] Aucune erreur
- [ ] Aucun warning TypeScript

CONSOLE
- [ ] Aucune erreur
- [ ] Aucun avertissement
- [ ] Pas de red text
```

---

## 🐛 Debugging

### Si le sélecteur n'apparaît pas:
1. Vérifiez que vous êtes sur la page d'accueil
2. Ouvrez DevTools → Console
3. Cherchez les erreurs rouges
4. Vérifiez que I18nProvider enveloppe le Header

### Si les traductions ne changent pas:
1. Vérifiez localStorage avec F12
2. Cherchez `yowyob_locale`
3. Vérifiez que la clé existe dans tous les JSON
4. Exécutez `npm run i18n:check`

### Si la compilation échoue:
1. Vérifiez que `i18n` est supprimé de next.config.ts
2. Exécutez `npm run build` de nouveau
3. Regardez les messages d'erreur

### Si les animations sont lentes:
1. Vérifiez que votre machine a suffisamment de ressources
2. Fermez les autres onglets/applications
3. Attendez que Turbopack compile complètement

---

## 📊 Résultats Attendus

### Performance
- Changement de langue: < 100ms
- Animation: Fluide (60 FPS)
- Bundle: ~50KB pour i18n
- Build: < 20s

### Qualité
- TypeScript: 0 erreur
- Compilation: Succès
- Tests: Tous passent
- Console: Aucune erreur

---

## ✅ Tout Fonctionne?

Si tous les tests passent ✅, alors:

🎉 **Votre système i18n est PRÊT POUR PRODUCTION!**

Vous pouvez maintenant:
- Ajouter plus de langues
- Ajouter plus de traductions
- Déployer en production
- Étendre le système

---

**Merci d'avoir testé le système i18n! 🌍**
