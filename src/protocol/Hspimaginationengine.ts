// Hexperiment System Protocol Imagination Engine
// Pretvara imagination/protokol u strukturisane instrukcije za code generator

class HSPImaginationEngine {
  constructor() {}

  // Glavna funkcija: prima imagination/protokol i vraća instrukcije za code generator
  processImagination(imaginationInput) {
    // Interaktivni scenario
    if (typeof imaginationInput === 'object' && imaginationInput.type === 'interactive') {
      return {
        prompt: imaginationInput.prompt || '',
        type: 'interactive',
        uiSchema: imaginationInput.uiSchema || {},
        actions: imaginationInput.actions || [],
        meta: imaginationInput.meta || {},
      };
    }
    // Proaktivni scenario
    if (typeof imaginationInput === 'object' && imaginationInput.type === 'proactive') {
      const suggestions = [
        { action: 'run_analysis', label: 'Pokreni automatsku analizu sistema' },
        { action: 'optimize', label: 'Predloži optimizaciju resursa' },
        { action: 'notify', label: 'Obavesti operatera o statusu' },
      ];
      return {
        prompt: imaginationInput.prompt || '',
        type: 'proactive',
        context: imaginationInput.context || {},
        proactiveSuggestions: suggestions,
        meta: imaginationInput.meta || {},
      };
    }
    // Scenario kretanja
    if (typeof imaginationInput === 'object' && imaginationInput.type === 'movement') {
      const movementInstructions = {
        speed: imaginationInput.parameters?.speed || '1.0 m/s',
        path: imaginationInput.parameters?.path || 'A-B',
        agent: imaginationInput.parameters?.agent || 'robot',
        duration: imaginationInput.parameters?.duration || '60s',
      };
      return {
        prompt: imaginationInput.prompt || '',
        type: 'movement',
        movementInstructions,
        meta: imaginationInput.meta || {},
      };
    }
    // Generički scenario
    if (typeof imaginationInput === 'string') {
      return {
        prompt: imaginationInput,
        type: 'generic',
        meta: {},
      };
    }
    if (typeof imaginationInput === 'object') {
      return {
        ...imaginationInput,
        type: imaginationInput.type || 'generic',
        meta: imaginationInput.meta || {},
      };
    }
    return {
      prompt: String(imaginationInput),
      type: 'generic',
      meta: {},
    };
  }
}

export { HSPImaginationEngine };
