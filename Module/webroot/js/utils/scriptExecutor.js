// Script Execution Utilities
const SCRIPT_HISTORY_KEY = "scriptHistoryLogs";

function getScriptExecutor() {
  if (typeof window.YuriKeyHost?.execScript === "function") {
    return (scriptPath, scriptName, cb) => {
      Promise.resolve(window.YuriKeyHost.execScript(scriptPath, scriptName))
        .then(result => cb(0, typeof result === "string" ? result : JSON.stringify(result), ""))
        .catch(() => cb(1, "", "Execution failed"));
    };
  }

  if (typeof window.execYurikeyScript === "function") {
    return (scriptPath, scriptName, cb) => {
      Promise.resolve(window.execYurikeyScript(scriptPath, scriptName))
        .then(result => cb(0, typeof result === "string" ? result : JSON.stringify(result), ""))
        .catch(() => cb(1, "", "Execution failed"));
    };
  }

  if (typeof ksu === "object" && typeof ksu.exec === "function") {
    return (scriptPath, _scriptName, cbName) => ksu.exec(`sh "${scriptPath}"`, "{}", cbName);
  }

  return null;
}

function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCRIPT_HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(items) {
  localStorage.setItem(SCRIPT_HISTORY_KEY, JSON.stringify(items.slice(0, 80)));
}

function addScriptHistory(scriptName, outputText) {
  const cleanOutput = (outputText || "").trim();
  if (!cleanOutput) return;

  const history = readHistory();
  history.unshift({
    script: scriptName,
    output: cleanOutput,
    time: new Date().toLocaleString(),
  });
  writeHistory(history);
}

function renderHistoryDialog() {
  const contentEl = document.getElementById("script-history-content");
  if (!contentEl) return;

  const history = readHistory();
  if (!history.length) {
    contentEl.textContent = t("script_history_empty");
    return;
  }

  contentEl.innerHTML = history.map(item => {
    const script = item.script || "script";
    const time = item.time || "";
    const output = (item.output || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
              .replace(/\n/g, "<br>");
    return `<div><strong>[${time}] ${script}</strong><br>${output}</div><hr>`;
  }).join("");
}

function openHistoryDialog() {
  const dialog = document.getElementById("script-history-dialog");
  const overlay = document.getElementById("script-history-overlay");
  if (!dialog || !overlay) return;

  renderHistoryDialog();
  overlay.classList.add("active");
  if (!dialog.open) dialog.showModal();
}

function closeHistoryDialog() {
  const dialog = document.getElementById("script-history-dialog");
  const overlay = document.getElementById("script-history-overlay");
  if (!dialog || !overlay) return;

  if (dialog.open) dialog.close();
  overlay.classList.remove("active");
}

function handleScriptResult(rawOutput, scriptName, options = {}) {
  const raw = typeof rawOutput === "string" ? rawOutput.trim() : "";
  const exitCode = options.exitCode ?? options.code;

  if (!raw) {
    if (exitCode !== undefined && exitCode !== 0) {
      addScriptHistory(scriptName, \`Exit Code: \${exitCode}\`);
      showToast(tFormat("script_execution_failed_generic"), "error", 4000);
      return;
    }
    showToast(tFormat("success", { script: scriptName }), "success", 3000);
    return;
  }

  try {
    const json = JSON.parse(raw);
    if (json.success) {
      const commandOutput = typeof json.output === "string" ? json.output.trim() : "";
      addScriptHistory(scriptName, commandOutput || tFormat("success", { script: scriptName }));
      showToast(tFormat("success", { script: scriptName }), "success", 3000);
    } else {
      addScriptHistory(scriptName, raw);
      showToast(t("script_execution_failed_generic"), "error", 4000);
    }
  } catch {
    addScriptHistory(scriptName, raw);
    if (exitCode !== undefined && exitCode !== 0) {
        showToast(t("script_execution_failed_generic"), "error", 4000);
    } else {
        showToast(tFormat("success", { script: scriptName }), "success", 3500);
    }
  }
}

function runScript(scriptName, basePath, button, callback) {
  const scriptPath = \`\${basePath}\${scriptName}\`;
  const executeScript = getScriptExecutor();

  if (button) {
    button.classList.add("executing");
    button.disabled = true;
  }

  const cb = \`cb_\${Date.now()}_\${Math.floor(Math.random() * 1000)}\`;
  let timeoutId;

  window[cb] = async (arg1, arg2, arg3) => {
    clearTimeout(timeoutId);
    delete window[cb];

    let code, out, err;
    if (typeof arg1 === "number") {
        // KernelSU signature: (code, out, err)
        code = arg1;
        out = arg2;
        err = arg3;
    } else {
        // Fallback signature: (output)
        code = 0;
        out = arg1;
        err = "";
    }

    const combinedOutput = code === 0 ? (out || "") : (err || out || "Execution failed");

    try {
        handleScriptResult(combinedOutput, scriptName, { exitCode: code });
        if (typeof callback === "function") {
            await callback(code === 0 ? combinedOutput : null);
        }
    } catch (e) {
        console.error("Callback error:", e);
    } finally {
        if (button) {
            button.classList.remove("executing");
            button.disabled = false;
        }
    }
  };

  try {
    if (!executeScript) {
      throw new Error("executor-unavailable");
    }

    showToast(tFormat("executing", { script: scriptName }), "info");
    executeScript(scriptPath, scriptName, cb);
  } catch (_e) {
    clearTimeout(timeoutId);
    delete window[cb];
    if (button) {
      button.classList.remove("executing");
      button.disabled = false;
    }
    addScriptHistory(scriptName, t("script_execution_failed_generic"));
    showToast(t("script_execution_failed_generic"), "error", 4500);
    if (typeof callback === "function") callback(null);
    return;
  }

  timeoutId = setTimeout(() => {
    const handler = window[cb];
    if (handler) {
        handler(1, "", tFormat("timeout", { script: scriptName }));
    }
  }, 30000);
}

// Export functions to window object
window.getScriptExecutor = getScriptExecutor;
window.readHistory = readHistory;
window.writeHistory = writeHistory;
window.addScriptHistory = addScriptHistory;
window.renderHistoryDialog = renderHistoryDialog;
window.openHistoryDialog = openHistoryDialog;
window.closeHistoryDialog = closeHistoryDialog;
window.handleScriptResult = handleScriptResult;
window.runScript = runScript;
