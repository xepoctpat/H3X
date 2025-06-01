// Imagine to Create - Core JavaScript Module for H3X System

document.addEventListener('DOMContentLoaded', function() {
  // Initialize imagine-to-create functionality
  initializeImagineToCreate();
});

function initializeImagineToCreate() {
  // Check if we have the required elements
  const form = document.getElementById('imagineForm');
  const resultDiv = document.getElementById('result');
  
  if (!form) {
    console.log('Imagine-to-create: No form found, creating minimal interface');
    createMinimalInterface();
    return;
  }

  setupFormHandlers(form, resultDiv);
}

function createMinimalInterface() {
  // Create a minimal interface if the expected elements don't exist
  const container = document.createElement('div');
  container.id = 'imagine-to-create-container';
  container.innerHTML = `
    <h3>Imagine to Create Interface</h3>
    <form id="imagineForm">
      <textarea id="imagination" placeholder="Enter your imagination..." rows="4" cols="50"></textarea><br>
      <select id="generationType">
        <option value="">Select type...</option>
        <option value="interactive">Interactive</option>
        <option value="proactive">Proactive</option>
        <option value="movement">Movement</option>
      </select><br>
      <button type="submit">Create</button>
    </form>
    <div id="result"></div>
    <div id="dynamicUI"></div>
    <div id="suggestions"></div>
    <div id="movement"></div>
  `;
  
  document.body.appendChild(container);
  
  // Setup handlers for the newly created form
  const form = document.getElementById('imagineForm');
  const resultDiv = document.getElementById('result');
  setupFormHandlers(form, resultDiv);
}

function setupFormHandlers(form, resultDiv) {
  const dynamicUI = document.getElementById('dynamicUI');
  const suggestionsDiv = document.getElementById('suggestions');
  const movementDiv = document.getElementById('movement');

  function clearAll() {
    if (resultDiv) resultDiv.innerHTML = '';
    if (dynamicUI) dynamicUI.innerHTML = '';
    if (suggestionsDiv) suggestionsDiv.innerHTML = '';
    if (movementDiv) movementDiv.innerHTML = '';
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    clearAll();
    
    const imagination = document.getElementById('imagination').value.trim();
    const generationType = document.getElementById('generationType').value.trim();
    
    if (!imagination) {
      if (resultDiv) resultDiv.textContent = 'Please enter imagination text.';
      return;
    }
    
    let body;
    try {
      // First try parsing as JSON
      body = JSON.parse(imagination);
    } catch (e) {
      // If not valid JSON, send as regular text
      body = { prompt: imagination };
    }
    
    if (generationType) body.generationType = generationType;
    
    try {
      if (resultDiv) resultDiv.innerHTML = '<em>Processing...</em>';
      
      // Handle movement type specially
      if (generationType === 'movement' || body.type === 'movement') {
        renderMovement({
          speed: body.parameters?.speed || '1.0 m/s',
          path: body.parameters?.path || 'Unknown',
          agent: body.parameters?.agent || 'robot',
          duration: body.parameters?.duration || '60s'
        });
      }
      
      // For interactive UIs, render a dynamic interface
      if (generationType === 'interactive' || body.type === 'interactive') {
        if (dynamicUI) {
          dynamicUI.innerHTML = '<h3>Interactive UI</h3>';
          const fields = body.uiSchema?.fields || [
            { name: 'option1', type: 'text', label: 'Option 1' },
            { name: 'option2', type: 'text', label: 'Option 2' }
          ];
          
          fields.forEach(field => {
            const label = document.createElement('label');
            label.textContent = field.label || field.name;
            const input = document.createElement('input');
            input.type = field.type || 'text';
            input.name = field.name;
            input.placeholder = field.placeholder || '';
            
            dynamicUI.appendChild(label);
            dynamicUI.appendChild(input);
          });
          
          const actions = body.actions || [
            { type: 'submit', label: 'Submit' }
          ];
          
          actions.forEach(action => {
            const btn = document.createElement('button');
            btn.textContent = action.label;
            btn.style.marginTop = '16px';
            btn.onclick = () => {
              if (resultDiv) resultDiv.innerHTML = '<em>Action triggered: ' + action.type + '</em>';
            };
            dynamicUI.appendChild(btn);
          });
        }
      }
      
      // Add some helpful suggestions
      renderSuggestions([
        { text: 'Reset form', action: () => { form.reset(); clearAll(); } },
        { text: 'Generate random example', action: () => { 
          document.getElementById('imagination').value = JSON.stringify({ 
            type: ['interactive', 'proactive', 'movement'][Math.floor(Math.random() * 3)],
            prompt: 'Example ' + Math.floor(Math.random() * 1000)
          }, null, 2);
        }}
      ]);
      
      // Send to backend (if available)
      try {
        const res = await fetch('/imagine-to-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        const data = await res.json();
        if (resultDiv) resultDiv.innerHTML = `<b>Result:</b><pre>${JSON.stringify(data.result || data, null, 2)}</pre>`;
      } catch (fetchError) {
        // Fallback for when backend is not available
        if (resultDiv) resultDiv.innerHTML = `<b>Local Result:</b><pre>${JSON.stringify({
          status: 'processed',
          input: body,
          timestamp: new Date().toISOString(),
          note: 'Backend not available - showing local processing'
        }, null, 2)}</pre>`;
      }
    } catch (err) {
      if (resultDiv) resultDiv.innerHTML = `<b>Error:</b> ${err.message}`;
    }
  };

  // Helper to render suggestion buttons
  function renderSuggestions(suggestions) {
    if (!suggestionsDiv) return;
    suggestionsDiv.innerHTML = '<b>Suggestions:</b><br>';
    suggestions.forEach(suggestion => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-btn';
      btn.textContent = suggestion.text;
      btn.onclick = suggestion.action;
      suggestionsDiv.appendChild(btn);
    });
  }

  function renderMovement(movement) {
    if (!movementDiv) return;
    movementDiv.innerHTML = '<b>Movement Parameters:</b><br>';
    Object.entries(movement).forEach(([k, v]) => {
      const div = document.createElement('div');
      div.className = 'movement-param';
      div.innerHTML = `<b>${k}:</b> ${v}`;
      movementDiv.appendChild(div);
    });
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeImagineToCreate };
}
