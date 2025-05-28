document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('imagineForm');
  const resultDiv = document.getElementById('result');
  const dynamicUI = document.getElementById('dynamicUI');
  const suggestionsDiv = document.getElementById('suggestions');
  const movementDiv = document.getElementById('movement');

  function clearAll() {
    resultDiv.innerHTML = '';
    dynamicUI.innerHTML = '';
    suggestionsDiv.innerHTML = '';
    movementDiv.innerHTML = '';
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    clearAll();
    
    const imagination = document.getElementById('imagination').value.trim();
    const generationType = document.getElementById('generationType').value.trim();
    
    if (!imagination) {
      resultDiv.textContent = 'Please enter imagination text.';
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
      resultDiv.innerHTML = '<em>Processing...</em>';
      
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
            resultDiv.innerHTML = '<em>Action triggered: ' + action.type + '</em>';
          };
          dynamicUI.appendChild(btn);
        });
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
      
      // Send to backend
      const res = await fetch('/imagine-to-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      resultDiv.innerHTML = `<b>Rezultat:</b><pre>${JSON.stringify(data.result || data, null, 2)}</pre>`;
    } catch (err) {
      resultDiv.innerHTML = `<b>Error:</b> ${err.message}`;
    }
  };

  // Helper to render suggestion buttons
  function renderSuggestions(suggestions) {
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
    movementDiv.innerHTML = '<b>Parametri kretanja:</b><br>';
    Object.entries(movement).forEach(([k, v]) => {
      const div = document.createElement('div');
      div.className = 'movement-param';
      div.innerHTML = `<b>${k}:</b> ${v}`;
      movementDiv.appendChild(div);
    });
  }
});
