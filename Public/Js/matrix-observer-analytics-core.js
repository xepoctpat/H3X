document.addEventListener('DOMContentLoaded', function() {
  const logDiv = document.getElementById('log');
  const wsPort = location.port ? (parseInt(location.port, 10) + 1) : 3980;
  const wsProto = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${wsProto}://${location.hostname}:${wsPort}`);
  
  ws.onmessage = (msg) => {
    let data;
    try { data = JSON.parse(msg.data); } catch { data = { type: 'raw', payload: msg.data }; }
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `<span class="time">[${data.time ? new Date(data.time).toLocaleTimeString() : ''}]</span>` +
      `<span class="type">${data.type ? data.type.toUpperCase() : 'EVENT'}</span>` +
      `<span class="payload">${JSON.stringify(data, null, 2)}</span>`;
    logDiv.appendChild(div);
    logDiv.scrollTop = logDiv.scrollHeight;
  };
  
  ws.onopen = () => {
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = '<span class="type">INFO</span> <span class="payload">Spectator connected. Čekam događaje...</span>';
    logDiv.appendChild(div);
  };
  
  ws.onclose = () => {
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = '<span class="type">INFO</span> <span class="payload">Spectator disconnected.</span>';
    logDiv.appendChild(div);
  };
});
