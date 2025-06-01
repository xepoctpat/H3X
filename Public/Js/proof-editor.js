// proof-editor.js
// Handles loading, editing, previewing, and saving Markdown proof files

const proofFiles = [
  "flups-proof-automation.md",
  "flups-proto.md",
  "flups-proof-cicd.md",
  "flups-proof-all.md",
  "flups-proof-all-ascii.md",
  "flups-proof-all-ascii-math.md",
  "flups-initial.md",
  "flups-hexagonal-mirror.md",
  "flups-formal-proof.md",
  "flups-action-time.md",
  "flups-4d-visualization.md"
];

const proofDir = "../proof/";

window.addEventListener("DOMContentLoaded", () => {
  const fileSelect = document.getElementById("proof-file-select");
  const loadBtn = document.getElementById("load-file");
  const saveBtn = document.getElementById("save-file");
  const editor = document.getElementById("markdown-editor");
  const preview = document.getElementById("markdown-preview");
  const mermaidDiv = document.getElementById("mermaid-diagram");
  const statusMsg = document.getElementById("status-msg");

  // Populate file dropdown
  proofFiles.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    fileSelect.appendChild(opt);
  });

  // Load file content
  async function loadFile() {
    const file = fileSelect.value;
    statusMsg.textContent = "Loading...";
    try {
      const res = await fetch(proofDir + file);
      if (!res.ok) throw new Error("Failed to load file");
      const text = await res.text();
      editor.value = text;
      updatePreview();
      statusMsg.textContent = `Loaded ${file}`;
    } catch (e) {
      statusMsg.textContent = e.message;
    }
  }

  // Save file content (requires backend API)
  async function saveFile() {
    const file = fileSelect.value;
    statusMsg.textContent = "Saving...";
    try {
      const res = await fetch(`/api/proof/${file}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: editor.value
      });
      if (!res.ok) throw new Error("Failed to save file");
      statusMsg.textContent = `Saved ${file}`;
    } catch (e) {
      statusMsg.textContent = e.message;
    }
  }

  // Update Markdown preview and Mermaid
  function updatePreview() {
    const md = editor.value;
    preview.innerHTML = marked.parse(md);
    // Extract mermaid code blocks
    const mermaidMatch = md.match(/```mermaid\n([\s\S]*?)```/);
    if (mermaidMatch) {
      mermaidDiv.innerHTML = `<pre class='mermaid'>${mermaidMatch[1]}</pre>`;
      mermaid.init(undefined, mermaidDiv);
    } else {
      mermaidDiv.innerHTML = '<em>No Mermaid diagram found in this file.</em>';
    }
  }

  editor.addEventListener("input", updatePreview);
  loadBtn.addEventListener("click", loadFile);
  saveBtn.addEventListener("click", saveFile);

  // Initial load
  fileSelect.selectedIndex = 0;
  loadFile();
});
