// Main Application Entry Point
// This file orchestrates the loading of all components and utilities

document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js active");

  const BASE_SCRIPT = "/data/adb/modules/Yurikey/";

  // Register click events for all menu buttons with data-script attribute (except refresh button which is handled in device.js)
  document.querySelectorAll(".menu-btn[data-script]:not(#refresh-info-btn)").forEach(button => {
    const scriptName = button.dataset.script;
    if (scriptName && typeof window.runScript === "function") {
      button.addEventListener("click", () => window.runScript(scriptName, BASE_SCRIPT, button));
    }
  });

  const historyCard = document.getElementById("module-version-card");
  const historyDialog = document.getElementById("script-history-dialog");
  const historyOverlay = document.getElementById("script-history-overlay");
  const historyCloseBtn = document.getElementById("script-history-close");
  const historyClearBtn = document.getElementById("script-history-clear");

  historyCard?.addEventListener("click", openHistoryDialog);
  historyCloseBtn?.addEventListener("click", closeHistoryDialog);
  historyOverlay?.addEventListener("click", closeHistoryDialog);
  historyDialog?.addEventListener("close", () => historyOverlay?.classList.remove("active"));
  historyClearBtn?.addEventListener("click", () => {
    writeHistory([]);
    renderHistoryDialog();
  });
});
