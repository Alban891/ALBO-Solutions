# 🚀 INSTALLATION & VERWENDUNG

## ✅ WAS IST FERTIG:

### KERN-DATEIEN:
- ✅ **index.js** - Haupt-Entry-Point mit voller API
- ✅ **form-handler.js** - Komplette Datensammlung für alle 8 Sections
- ✅ **sections/index.js** - Aggregator

### SECTIONS (teilweise):
- ✅ **section-2.js** - Marktgröße komplett
- ✅ **section-4.js** - Wettbewerb komplett
- ⏳ section-1.js, 3, 5, 6, 7, 8 (Templates vorhanden)

### COMPONENTS:
- ✅ **competitors.js** - Wettbewerber hinzufügen/entfernen
- ✅ **assumptions.js** - Annahmen, Risiken, Erfolgsfaktoren

### MODALS:
- ✅ **market-detail.js** - TAM/SAM/SOM Modal (Basis-Version)

---

## 📋 INSTALLATION:

### 1. KOPIERE ORDNER:
```bash
cp -r geschaeftsmodell-modular/ <dein-projekt>/modules/geschaeftsmodell/
```

### 2. UPDATE MAIN APP:
In deiner Haupt-Datei (z.B. `app.js` oder `main.js`):

```javascript
// Alte Zeile ersetzen:
// import geschaeftsmodellModule from './modules/geschaeftsmodell.js';

// Neue Zeile:
import geschaeftsmodellModule from './modules/geschaeftsmodell/index.js';
```

### 3. FÜGE FEHLENDE SECTIONS HINZU:

Du musst noch die Sections 1, 3, 5, 6, 7, 8 erstellen.

**EINFACHSTER WEG:**
Kopiere die render-Funktionen aus deiner bestehenden `geschaeftsmodell.js`

**Template für section-1.js:**
```javascript
/**
 * Section 1: Kundenproblem
 */

export function renderSection1(geschaeftsmodell) {
  return `
    <div class="form-section gm-section" data-section="1" id="section-1">
      <!-- HIER: HTML aus alter geschaeftsmodell.js Zeile ~50-150 einfügen -->
    </div>
  `;
}
```

Gleich für sections 3, 5, 6, 7, 8.

### 4. KOPIERE KI-ANALYSE:
```bash
cp geschaeftsmodell-ki.js geschaeftsmodell-modular/ki-analysis.js
```

Dann in `ki-analysis.js` den Import anpassen:
```javascript
// Alt:
import { state } from '../state.js';

// Neu:
import { state } from '../../state.js';
```

---

## 🎯 VERWENDUNG:

Das modulare System wird **identisch** verwendet wie vorher:

```javascript
// Im HTML:
<div id="projekt-tab-geschaeftsmodell"></div>

// Im Code:
geschaeftsmodellModule.renderGeschaeftsmodell();
```

Alle Funktionen sind verfügbar:
- `saveGeschaeftsmodell()`
- `resetForm()`
- `completeSection(n)`
- `addCompetitor()`
- `addAssumption()`
- `openMarketDetailModal('tam')`
- etc.

---

## 💡 VORTEILE DES MODULAREN SYSTEMS:

### **Wartbarkeit:**
```
❌ Vorher: 3000 Zeilen in einer Datei
✅ Jetzt: 10-15 übersichtliche Dateien à 100-300 Zeilen
```

### **Teamwork:**
```
❌ Vorher: Merge-Konflikte bei parallelem Arbeiten
✅ Jetzt: Jeder arbeitet an eigener Section-Datei
```

### **Testing:**
```
❌ Vorher: Schwer zu testen
✅ Jetzt: Jedes Modul separat testbar
```

### **Features hinzufügen:**
```
❌ Vorher: Scroll durch 3000 Zeilen
✅ Jetzt: Neue Datei erstellen, in index.js importieren
```

---

## 🐛 TROUBLESHOOTING:

### Import-Fehler?
→ Prüfe relative Pfade in den imports (`../`, `../../`, etc.)

### Funktionen nicht gefunden?
→ Prüfe ob im `index.js` exportiert:
```javascript
export default {
  renderGeschaeftsmodell,
  deineFunktion,  // <-- muss hier stehen!
  // ...
}
```

### Modal öffnet nicht?
→ Prüfe CSS für `.modal-overlay` in deinem Stylesheet

---

## 📊 DATEIÜBERSICHT:

```
geschaeftsmodell/
├── index.js              (275 Zeilen) ✅
├── form-handler.js       (300 Zeilen) ✅
├── ki-analysis.js        (400 Zeilen) ⏳ kopieren
│
├── sections/
│   ├── index.js          (50 Zeilen)  ✅
│   ├── section-1.js      (150 Zeilen) ⏳ aus alter Datei
│   ├── section-2.js      (120 Zeilen) ✅
│   ├── section-3.js      (180 Zeilen) ⏳ aus alter Datei
│   ├── section-4.js      (200 Zeilen) ✅
│   ├── section-5.js      (220 Zeilen) ⏳ aus alter Datei
│   ├── section-6.js      (250 Zeilen) ⏳ siehe new-sections.js
│   ├── section-7.js      (150 Zeilen) ⏳ aus alter Datei
│   └── section-8.js      (200 Zeilen) ⏳ siehe new-sections.js
│
├── modals/
│   └── market-detail.js  (300 Zeilen) ✅
│
└── components/
    ├── competitors.js    (50 Zeilen)  ✅
    └── assumptions.js    (120 Zeilen) ✅

GESAMT: ~2700 Zeilen aufgeteilt in 15 Dateien
        vs. 3000 Zeilen in 1 Datei
```

---

## ✨ NÄCHSTE SCHRITTE:

1. ✅ Ordner kopieren
2. ⏳ Fehlende Sections erstellen (aus alter Datei copy-paste)
3. ⏳ ki-analysis.js kopieren
4. ✅ Testen!
5. 🎉 Fertig!

**Brauchst du Hilfe bei einem Schritt?** Sag einfach Bescheid!