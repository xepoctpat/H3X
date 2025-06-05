document.addEventListener('DOMContentLoaded', function () {
  const statusDiv = document.getElementById('status');
  const tasksDiv = document.getElementById('tasks');
  const taskInput = document.getElementById('taskInput');
  const typeSelect = document.getElementById('taskType');
  const sendBtn = document.getElementById('sendBtn');
  const wsPort = location.port ? parseInt(location.port, 10) + 1 : 3980;
  const wsProto = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${wsProto}://${location.hostname}:${wsPort}`);

  ws.onopen = () => {
    statusDiv.textContent = 'Connected to Taskmaster ✓';
    sendBtn.disabled = false;
  };

  ws.onclose = () => {
    statusDiv.textContent = 'Disconnected from Taskmaster ✗';
    sendBtn.disabled = true;
  };

  ws.onmessage = (msg) => {
    let data;
    try {
      data = JSON.parse(msg.data);
    } catch {
      data = { type: 'raw', payload: msg.data };
    }
    const div = document.createElement('div');
    div.className = 'task';
    div.innerHTML =
      `<span class="time">[${data.time ? new Date(data.time).toLocaleTimeString() : new Date().toLocaleTimeString()}]</span>` +
      `<span class="type">${data.type ? data.type.toUpperCase() : 'TASK'}</span>` +
      `<span class="payload">${typeof data.payload === 'string' ? data.payload : JSON.stringify(data.payload || data, null, 2)}</span>`;
    tasksDiv.appendChild(div);
    tasksDiv.scrollTop = tasksDiv.scrollHeight;
  };

  sendBtn.onclick = async () => {
    const imagination = taskInput.value.trim();
    if (!imagination) return;
    const type = typeSelect.value;

    // Hope visualization
    if (Math.random() > 0.6) {
      const hopeDiv = document.createElement('div');
      hopeDiv.className = 'task';
      hopeDiv.style.borderLeft = '4px solid #7ed957';
      hopeDiv.innerHTML =
        '<span class="type">HOPE</span> <span class="payload">Vizuelizujem uspeh zadatka </span>';
      tasksDiv.appendChild(hopeDiv);
      let i = 0;
      const anim = setInterval(() => {
        hopeDiv.querySelector('.payload').textContent += '✨';
        i++;
        if (i > 10) clearInterval(anim);
      }, 120);
    }

    // --- Ljudska toplina za svaki task ---
    const humanDiv = document.createElement('div');
    humanDiv.className = 'task';
    humanDiv.style.borderLeft = '4px solid #f7b731';
    humanDiv.innerHTML =
      '<span class="type">HUMAN</span> <span class="payload">🫱 Svaki zadatak je važan. Tvoj doprinos je primećen. 🫲</span>';
    tasksDiv.appendChild(humanDiv);
    // --- Kraj dodatka ---

    const res = await fetch('/imagine-to-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagination, generationType: type }),
    });

    const data = await res.json();
    const div = document.createElement('div');
    div.className = 'task';
    div.innerHTML =
      `<span class="time">[${new Date().toLocaleTimeString()}]</span>` +
      '<span class="type">SENT</span>' +
      `<span class="payload">${JSON.stringify(data, null, 2)}</span>`;
    tasksDiv.appendChild(div);
    tasksDiv.scrollTop = tasksDiv.scrollHeight;
    document.getElementById('taskInput').value = '';
  };

  // --- Visualization of task flow ---
  const visualization = document.getElementById('visualization');

  function renderTaskFlow() {
    // Get all .task elements and their types
    const taskEls = Array.from(document.querySelectorAll('.task'));
    if (taskEls.length === 0) {
      visualization.innerHTML = '';
      return;
    }

    // Build a simple flow: each task is a node, arrows between
    let html =
      '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:18px;overflow-x:auto;">';
    taskEls.forEach((el, i) => {
      const type = el.querySelector('.type')?.textContent || '';
      const color = type.includes('HOPE')
        ? '#7ed957'
        : type.includes('HUMAN')
          ? '#f7b731'
          : '#e0e6ef';
      html += `<div style='min-width:80px;min-height:48px;padding:8px 12px;border-radius:10px;background:#23293a;border:2px solid ${color};color:${color};font-weight:bold;text-align:center;'>${type}</div>`;
      if (i < taskEls.length - 1) html += "<span style='font-size:2em;color:#888;'>→</span>";
    });
    html += '</div>';
    visualization.innerHTML = html;
  }

  // Re-render on new task
  const observer = new MutationObserver(renderTaskFlow);
  observer.observe(document.getElementById('tasks'), { childList: true });

  // Initial render
  renderTaskFlow();

  // PWA/app install logic
  let deferredPrompt;
  const installBanner = document.getElementById('installBanner');
  const installBtn = document.getElementById('installBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.style.display = 'block';
  });

  if (installBtn) {
    installBtn.onclick = async () => {
      installBanner.style.display = 'none';
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
      }
    };
  }

  window.addEventListener('appinstalled', () => {
    installBanner.style.display = 'none';
  });

  // Register service worker for offline/app experience
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/appPackage/manifest.json', {
      scope: '/',
    });
  }
});
