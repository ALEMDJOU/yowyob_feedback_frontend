#!/usr/bin/env node

/**
 * Script d'aide pour gérer les traductions
 * Usage: node scripts/i18n-helper.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../locales');
const SUPPORTED_LOCALES = ['fr', 'en', 'es', 'de'];

// Afficher le menu
function showMenu() {
  console.log('\n🌍 I18n Helper\n');
  console.log('1. Vérifier les clés manquantes');
  console.log('2. Afficher les statistiques');
  console.log('3. Valider la structure JSON');
  console.log('4. Générer un rapport complet');
  console.log('5. Quitter\n');
}

// Charger tous les fichiers de locale
function loadLocales() {
  const locales = {};
  SUPPORTED_LOCALES.forEach(lang => {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    try {
      locales[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Erreur lors de la lecture de ${lang}.json:`, e.message);
    }
  });
  return locales;
}

// Obtenir toutes les clés en format pointé
function getAllKeys(obj, prefix = '') {
  let keys = [];
  Object.keys(obj).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  });
  return keys;
}

// Vérifier les clés manquantes
function checkMissingKeys() {
  const locales = loadLocales();
  const allKeys = {};
  
  SUPPORTED_LOCALES.forEach(lang => {
    allKeys[lang] = getAllKeys(locales[lang]);
  });

  const referenceKeys = new Set(allKeys['fr']);
  let hasIssues = false;

  console.log('\n📋 Vérification des clés manquantes:\n');

  SUPPORTED_LOCALES.forEach(lang => {
    if (lang === 'fr') return;
    
    const missing = Array.from(referenceKeys).filter(key => !allKeys[lang].includes(key));
    const extra = allKeys[lang].filter(key => !referenceKeys.has(key));

    if (missing.length > 0 || extra.length > 0) {
      hasIssues = true;
      console.log(`\n🔴 ${lang.toUpperCase()}:`);
      if (missing.length > 0) {
        console.log(`   Manquantes (${missing.length}): ${missing.join(', ')}`);
      }
      if (extra.length > 0) {
        console.log(`   Extra (${extra.length}): ${extra.join(', ')}`);
      }
    } else {
      console.log(`✅ ${lang.toUpperCase()}: Parfait`);
    }
  });

  if (!hasIssues) {
    console.log('✅ Toutes les langues sont en sync!');
  }
}

// Afficher les statistiques
function showStats() {
  const locales = loadLocales();

  console.log('\n📊 Statistiques:\n');

  SUPPORTED_LOCALES.forEach(lang => {
    const keys = getAllKeys(locales[lang]);
    console.log(`${lang.toUpperCase()}: ${keys.length} clés`);
  });
}

// Valider le JSON
function validateJSON() {
  console.log('\n✔️ Validation du JSON:\n');

  SUPPORTED_LOCALES.forEach(lang => {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    try {
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`✅ ${lang.toUpperCase()}: Valide`);
    } catch (e) {
      console.log(`❌ ${lang.toUpperCase()}: Erreur - ${e.message}`);
    }
  });
}

// Générer un rapport complet
function generateReport() {
  const locales = loadLocales();
  const allKeys = {};

  SUPPORTED_LOCALES.forEach(lang => {
    allKeys[lang] = getAllKeys(locales[lang]);
  });

  const reportPath = path.join(LOCALES_DIR, '../I18N_REPORT.txt');
  
  let report = '🌍 RAPPORT I18N COMPLET\n';
  report += '='.repeat(50) + '\n\n';

  // Statistiques
  report += '📊 STATISTIQUES:\n';
  SUPPORTED_LOCALES.forEach(lang => {
    report += `${lang.toUpperCase()}: ${allKeys[lang].length} clés\n`;
  });

  // Clés référence
  report += '\n🔑 CLÉS RÉFÉRENCE (Français):\n';
  report += allKeys['fr'].join('\n');

  // Différences
  report += '\n\n⚠️ DIFFÉRENCES:\n';
  SUPPORTED_LOCALES.forEach(lang => {
    if (lang === 'fr') return;
    
    const missing = allKeys['fr'].filter(key => !allKeys[lang].includes(key));
    const extra = allKeys[lang].filter(key => !allKeys['fr'].includes(key));
    
    if (missing.length > 0 || extra.length > 0) {
      report += `\n${lang.toUpperCase()}:\n`;
      if (missing.length > 0) report += `  Manquantes: ${missing.join(', ')}\n`;
      if (extra.length > 0) report += `  Extra: ${extra.join(', ')}\n`;
    }
  });

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Rapport généré: ${reportPath}`);
}

// Main
if (require.main === module) {
  console.log('🚀 I18n Helper CLI');
  console.log('\nCommandes disponibles:');
  console.log('  check     - Vérifier les clés manquantes');
  console.log('  stats     - Afficher les statistiques');
  console.log('  validate  - Valider le JSON');
  console.log('  report    - Générer un rapport\n');

  const command = process.argv[2];

  switch (command) {
    case 'check':
      checkMissingKeys();
      break;
    case 'stats':
      showStats();
      break;
    case 'validate':
      validateJSON();
      break;
    case 'report':
      generateReport();
      break;
    default:
      showMenu();
      checkMissingKeys();
  }
}

module.exports = { loadLocales, getAllKeys, checkMissingKeys, showStats, validateJSON, generateReport };
