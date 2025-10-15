/**
 * Tutorial Controller
 * Guided Onboarding with pulsing elements and ALBO guidance
 */

import { state } from '../state.js';

// ==========================================
// TUTORIAL STEPS DEFINITION
// ==========================================

const TUTORIAL_STEPS = [
  {
    id: 1,
    target: 'button[onclick*="openCreateProjektModal"]',
    message: 'Willkommen! Lass uns gemeinsam dein erstes Projekt anlegen.',
    tip: 'Ein gutes Projekt hat klare Ziele, einen definierten Zeitraum und eine verantwortliche Person.',
    waitFor: 'click',
    nextTrigger: 'modal-opened'
  },
  
  {
    id: 2,
    target: '#new-projekt-name',
    message: 'Gib deinem Projekt einen aussagekräftigen Namen.',
    tip: 'Der Name sollte die Strategie widerspiegeln, z.B. "IoT Sensor Platform 2025"',
    waitFor: 'input',
    validation: (value) => value && value.length >= 3,
    nextTrigger: 'auto'
  },
  
  {
    id: 3,
    target: '#new-projekt-division',
    message: 'Wähle die verantwortliche Division.',
    tip: 'Die Division bestimmt Budget-Rahmen und Ressourcen-Zuordnung.',
    waitFor: 'change',
    nextTrigger: 'auto'
  },
  
  {
    id: 4,
    target: 'button[onclick="createProjekt()"]',
    message: 'Perfekt! Jetzt das Projekt speichern.',
    tip: 'Nach dem Speichern kannst du Artikel zum Projekt hinzufügen.',
    waitFor: 'click',
    nextTrigger: 'projekt-created'
  },
  
  {
    id: 5,
    target: 'button[onclick*="createNewArtikel"]',
    message: 'Projekt erstellt! Jetzt brauchen wir einen Artikel.',
    tip: 'Ein Artikel ist ein konkretes Produkt oder Service, das du verkaufen willst.',
    waitFor: 'click',
    nextTrigger: 'artikel-modal-opened',
    delay: 1000 // 1 Sekunde warten nach Projekt-Erstellung
  },
  
  {
    id: 6,
    target: '#quick-artikel-name',
    message: 'Wie heißt dein Produkt oder Service?',
    tip: 'Wähle einen klaren Namen, z.B. "Smart Sensor X1" oder "IoT Gateway Pro"',
    waitFor: 'input',
    validation: (value) => value && value.length >= 3,
    nextTrigger: 'auto'
  },
  
  {
    id: 7,
    target: '#quick-artikel-typ',
    message: 'Ist das ein komplett neues Produkt oder ergänzt es Bestehendes?',
    tip: 'Neu-Produkt = neue Revenue. Cross-Selling = zusätzlicher Umsatz bei Bestandskunden.',
    waitFor: 'change',
    nextTrigger: 'auto'
  },
  
  {
    id: 8,
    target: 'button[onclick="saveQuickArtikel()"]',
    message: 'Super! Artikel speichern und zur Detail-Ansicht.',
    tip: 'In der Detail-Ansicht kannst du die Wirtschaftlichkeit berechnen.',
    waitFor: 'click',
    nextTrigger: 'artikel-created'
  },
  
  {
    id: 9,
    target: '#start-menge',
    message: 'Wie viele Stück willst du im ersten Jahr verkaufen?',
    tip: 'Typisch für B2B Hardware: 500-2.000 Stück. Für Software/SaaS: 50-200 Kunden.',
    waitFor: 'input',
    validation: (value) => value && !value.startsWith('z.B.'),
    nextTrigger: 'auto',
    delay: 500
  },
  
  {
    id: 10,
    target: '#start-preis',
    message: 'Welchen Preis pro Stück planst du?',
    tip: 'Orientiere dich an Wettbewerbern. Premium-Produkte rechtfertigen höhere Preise.',
    waitFor: 'input',
    validation: (value) => value && !value.startsWith('z.B.'),
    nextTrigger: 'auto'
  },
  
  {
    id: 11,
    target: '#start-hk',
    message: 'Was sind deine Herstellkosten pro Stück?',
    tip: 'Faustregel: HK sollten <60% vom Preis sein für gesunde Marge.',
    waitFor: 'input',
    validation: (value) => value && !value.startsWith('z.B.'),
    nextTrigger: 'basisannahmen-complete'
  },
  
  {
    id: 12,
    target: 'button[onclick="berechneModelle()"]',
    message: 'Exzellent! Jetzt die 5-Jahres-Prognose berechnen.',
    tip: 'Die Modelle nutzen typische Entwicklungskurven aus der Praxis.',
    waitFor: 'click',
    nextTrigger: 'modelle-berechnet'
  },
  
  {
    id: 13,
    target: 'button[onclick="saveArtikelChanges()"]',
    message: 'Perfekt! Jetzt speichern.',
    tip: 'Nach dem Speichern siehst du im Cockpit die Portfolio-Übersicht.',
    waitFor: 'click',
    nextTrigger: 'artikel-saved'
  }
];

// ==========================================
// TUTORIAL CONTROLLER CLASS
// ==========================================

class TutorialController {
  constructor() {
    this.currentStep = 0;
    this.active = false;
    this.steps = TUTORIAL_STEPS;
    this.overlay = null;
    this.messageBox = null;
    this.eventListeners = [];
  }

  // ==========================================
  // START & STOP
  // ==========================================

  start() {
    console.log('🎓 Tutorial started');
    
    this.active = true;
    this.currentStep = 0;
    
    // Save state
    state.tutorialState = {
      active: true,
      step: 1,
      completed: [],
      dismissed: false
    };
    state.saveState();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Show first step
    setTimeout(() => this.showStep(1), 500);
  }

  stop() {
    console.log('🎓 Tutorial stopped');
    
    this.active = false;
    this.cleanup();
    
    // Save state
    state.tutorialState = {
      active: false,
      step: this.currentStep,
      completed: this.steps.slice(0, this.currentStep).map(s => s.id),
      dismissed: true
    };
    state.saveState();
  }

  finish() {
    console.log('🎉 Tutorial finished!');
    
    this.cleanup();
    this.showCompletionMessage();
    
    // Save state
    state.tutorialState = {
      active: false,
      step: this.steps.length,
      completed: this.steps.map(s => s.id),
      dismissed: false
    };
    state.saveState();
  }

  // ==========================================
  // SHOW STEP
  // ==========================================

  showStep(stepId) {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      console.warn('Step not found:', stepId);
      return;
    }

    console.log('📍 Tutorial Step:', stepId, step.message);

    // Cleanup previous step
    this.cleanup();

    // Create overlay
    this.createOverlay();

    // Find and highlight target
    const target = document.querySelector(step.target);
    if (!target) {
      console.warn('Target not found:', step.target);
      // Retry after delay
      setTimeout(() => this.showStep(stepId), 500);
      return;
    }

    // Highlight target
    this.highlightElement(target);

    // Show message
    this.showMessage(step);

    // Setup action listener
    this.waitForAction(target, step);

    // Update current step
    this.currentStep = stepId;
  }

  // ==========================================
  // UI CREATION
  // ==========================================

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    document.body.appendChild(this.overlay);
  }

  highlightElement(element) {
    element.classList.add('tutorial-pulse', 'tutorial-focus');
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    });
  }

  showMessage(step) {
    this.messageBox = document.createElement('div');
    this.messageBox.className = 'tutorial-message';
    this.messageBox.innerHTML = `
      <div class="tutorial-message-title">
        ${step.message}
      </div>
      <div class="tutorial-message-text">
        Schritt ${step.id} von ${this.steps.length}
      </div>
      ${step.tip ? `
        <div class="tutorial-tip">
          ${step.tip}
        </div>
      ` : ''}
      <button class="tutorial-skip" onclick="window.tutorialController.skip()">
        Tutorial überspringen
      </button>
    `;
    document.body.appendChild(this.messageBox);
  }

  // ==========================================
  // ACTION WAITING
  // ==========================================

  waitForAction(target, step) {
    if (step.nextTrigger === 'auto') {
      // Wait for input/change on element
      const handler = (e) => {
        if (step.validation && !step.validation(e.target.value)) {
          return; // Validation failed, keep waiting
        }
        
        // Remove listener
        target.removeEventListener(step.waitFor, handler);
        
        // Next step
        setTimeout(() => this.nextStep(), 300);
      };
      
      target.addEventListener(step.waitFor, handler);
      this.eventListeners.push({ element: target, event: step.waitFor, handler });
      
    } else if (step.nextTrigger === 'click') {
      // Wait for click on element
      const handler = () => {
        target.removeEventListener('click', handler);
        // Don't go to next step yet - wait for event
      };
      
      target.addEventListener('click', handler);
      this.eventListeners.push({ element: target, event: 'click', handler });
    }
    // For custom events, wait for document event (handled in setupEventListeners)
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================

  setupEventListeners() {
    // Projekt created
    const projektCreatedHandler = () => {
      if (this.currentStep === 4) {
        const step = this.steps[4]; // Step 5
        setTimeout(() => this.showStep(step.id), step.delay || 1000);
      }
    };
    document.addEventListener('projekt-created', projektCreatedHandler);
    this.eventListeners.push({ 
      element: document, 
      event: 'projekt-created', 
      handler: projektCreatedHandler 
    });

    // Artikel created
    const artikelCreatedHandler = () => {
      if (this.currentStep === 8) {
        const step = this.steps[8]; // Step 9
        setTimeout(() => this.showStep(step.id), step.delay || 500);
      }
    };
    document.addEventListener('artikel-created', artikelCreatedHandler);
    this.eventListeners.push({ 
      element: document, 
      event: 'artikel-created', 
      handler: artikelCreatedHandler 
    });

    // Basisannahmen complete
    const basisannahmenHandler = () => {
      if (this.currentStep === 11) {
        setTimeout(() => this.nextStep(), 500);
      }
    };
    document.addEventListener('basisannahmen-complete', basisannahmenHandler);
    this.eventListeners.push({ 
      element: document, 
      event: 'basisannahmen-complete', 
      handler: basisannahmenHandler 
    });

    // Modelle berechnet
    const modelleHandler = () => {
      if (this.currentStep === 12) {
        setTimeout(() => this.nextStep(), 500);
      }
    };
    document.addEventListener('modelle-berechnet', modelleHandler);
    this.eventListeners.push({ 
      element: document, 
      event: 'modelle-berechnet', 
      handler: modelleHandler 
    });

    // Artikel saved (final step)
    const artikelSavedHandler = () => {
      if (this.currentStep === 13) {
        this.finish();
      }
    };
    document.addEventListener('artikel-saved', artikelSavedHandler);
    this.eventListeners.push({ 
      element: document, 
      event: 'artikel-saved', 
      handler: artikelSavedHandler 
    });
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  nextStep() {
    const nextStepId = this.currentStep + 1;
    if (nextStepId <= this.steps.length) {
      this.showStep(nextStepId);
    } else {
      this.finish();
    }
  }

  skip() {
    if (confirm('Möchtest du das Tutorial wirklich überspringen?\n\nDu kannst es später jederzeit neu starten.')) {
      this.stop();
    }
  }

  // ==========================================
  // COMPLETION
  // ==========================================

  showCompletionMessage() {
    const msg = document.createElement('div');
    msg.className = 'tutorial-message tutorial-complete';
    msg.innerHTML = `
      <div class="tutorial-complete-icon">🎉</div>
      <div class="tutorial-complete-title">Geschafft!</div>
      <div class="tutorial-complete-text">
        Du hast dein erstes Projekt mit Artikel angelegt.<br>
        Sieh dir jetzt das Portfolio-Cockpit an!
      </div>
      <button class="tutorial-complete-button" onclick="window.tutorialController.goToCockpit()">
        Zum Cockpit 🚀
      </button>
    `;
    document.body.appendChild(msg);
  }

  goToCockpit() {
    // Remove completion message
    document.querySelector('.tutorial-complete')?.remove();
    
    // Switch to cockpit tab
    if (window.switchTab) {
      window.switchTab('cockpit');
    }
  }

  // ==========================================
  // CLEANUP
  // ==========================================

  cleanup() {
    // Remove overlay
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    // Remove message box
    if (this.messageBox) {
      this.messageBox.remove();
      this.messageBox = null;
    }

    // Remove highlights
    document.querySelectorAll('.tutorial-pulse, .tutorial-focus').forEach(el => {
      el.classList.remove('tutorial-pulse', 'tutorial-focus');
    });

    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
}

// ==========================================
// EXPORT
// ==========================================

export const tutorialController = new TutorialController();
export default tutorialController;

console.log('📦 Tutorial Controller loaded');