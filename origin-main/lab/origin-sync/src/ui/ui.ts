// ---------------------------------------------------------------------------
// Origin sync — Plugin UI message handling
// ---------------------------------------------------------------------------

import type {
  PluginToUIMessage,
  UIToPluginMessage,
  FoundationId,
  FoundationStatus,
  DiffEntry,
  ValidationResult,
  ValidationCheck,
  LogLevel,
} from "@shared/messages";

// ---------------------------------------------------------------------------
// IPC helpers
// ---------------------------------------------------------------------------

function send(msg: UIToPluginMessage): void {
  parent.postMessage({ pluginMessage: msg }, "*");
}

// Make sync functions available to inline onclick handlers
(window as any).syncOne = (foundation: FoundationId) => {
  send({ type: "SYNC", foundation });
};

(window as any).syncAll = () => {
  send({ type: "SYNC_ALL" });
};

(window as any).toggleExpand = (header: HTMLElement) => {
  const row = header.closest(".foundation-row");
  if (row) row.classList.toggle("expanded");
};

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------

const errorBanner = document.getElementById("error-banner")!;
const validationSection = document.getElementById("validation-section")!;
const validationResults = document.getElementById("validation-results")!;
const logSection = document.getElementById("log-section")!;
const syncAllBtn = document.getElementById("sync-all-btn") as HTMLButtonElement;

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

function getFoundationRow(foundation: FoundationId): HTMLElement | null {
  return document.querySelector(`[data-foundation="${foundation}"]`);
}

function renderBadge(status: FoundationStatus["status"]): { text: string; cls: string } {
  switch (status) {
    case "in_sync":
      return { text: "Synced", cls: "badge--synced" };
    case "out_of_sync":
      return { text: "Out of sync", cls: "badge--out-of-sync" };
    case "not_synced":
      return { text: "Not synced", cls: "badge--not-synced" };
    case "synced_with_warnings":
      return { text: "Warnings", cls: "badge--warnings" };
  }
}

function renderDiffEntries(entries: DiffEntry[]): string {
  if (entries.length === 0) {
    return '<div class="diff-empty">No changes detected</div>';
  }

  return entries
    .map((entry) => {
      const statusClass = `diff-status--${entry.status}`;
      const statusLabel = entry.status === "in_sync" ? "in sync" : entry.status;

      let values = "";
      if (entry.oldValue && entry.newValue) {
        values = `<span class="diff-values">${entry.oldValue} &rarr; ${entry.newValue}</span>`;
      } else if (entry.newValue) {
        values = `<span class="diff-values">${entry.newValue}</span>`;
      } else if (entry.oldName && entry.newName) {
        values = `<span class="diff-values">${entry.oldName} &rarr; ${entry.newName}</span>`;
      }

      return `
        <div class="diff-entry">
          <span class="diff-status ${statusClass}">${statusLabel}</span>
          <span class="diff-path">${entry.tokenPath}</span>
          ${values}
        </div>
      `;
    })
    .join("");
}

function renderFoundationStatus(fs: FoundationStatus): void {
  const row = getFoundationRow(fs.foundation);
  if (!row) return;

  const badge = row.querySelector("[data-badge]") as HTMLElement;
  const summary = row.querySelector("[data-summary]") as HTMLElement;
  const diffPanel = row.querySelector("[data-diff]") as HTMLElement;

  if (badge) {
    const { text, cls } = renderBadge(fs.status);
    badge.className = `badge ${cls}`;
    badge.textContent = text;
  }

  if (summary) {
    summary.textContent = fs.summary;
  }

  if (diffPanel) {
    diffPanel.innerHTML = renderDiffEntries(fs.entries);
  }

  // Remove syncing state
  row.classList.remove("syncing");
}

function renderValidation(foundation: FoundationId, result: ValidationResult): void {
  validationSection.classList.add("visible");

  const container = document.createElement("div");
  container.setAttribute("data-validation", foundation);

  const label = foundation.charAt(0).toUpperCase() + foundation.slice(1);
  const overallIcon = result.passed ? "checkmark" : "cross";

  let html = `<div style="padding: 6px 16px; font-weight: 500; font-size: 10px;">${label} Validation</div>`;

  for (const check of result.checks) {
    const iconClass = check.passed
      ? "validation-icon--pass"
      : check.severity === "warning"
        ? "validation-icon--warn"
        : "validation-icon--fail";
    const icon = check.passed ? "\u2713" : check.severity === "warning" ? "\u26A0" : "\u2717";

    html += `
      <div class="validation-check">
        <span class="validation-icon ${iconClass}">${icon}</span>
        <span class="validation-message">${check.message}</span>
      </div>
    `;

    if (check.details && check.details.length > 0) {
      html += `<div class="validation-details">${check.details.join("<br/>")}</div>`;
    }
  }

  // Remove previous validation for this foundation
  const existing = validationResults.querySelector(`[data-validation="${foundation}"]`);
  if (existing) existing.remove();

  container.innerHTML = html;
  validationResults.appendChild(container);
}

function addLog(level: LogLevel, message: string, detail?: string): void {
  const entry = document.createElement("div");
  entry.className = `log-entry log-entry--${level}`;
  entry.textContent = detail ? `${message} — ${detail}` : message;
  logSection.appendChild(entry);
  logSection.scrollTop = logSection.scrollHeight;
}

function showError(message: string): void {
  errorBanner.textContent = message;
  errorBanner.classList.add("visible");
  // Auto-hide after 8 seconds
  setTimeout(() => errorBanner.classList.remove("visible"), 8000);
}

function setSyncing(foundation: FoundationId, syncing: boolean): void {
  const row = getFoundationRow(foundation);
  if (!row) return;

  if (syncing) {
    row.classList.add("syncing");
    const badge = row.querySelector("[data-badge]") as HTMLElement;
    if (badge) {
      badge.className = "badge badge--not-synced";
      badge.innerHTML = '<span class="spinner"></span>';
    }
    const summary = row.querySelector("[data-summary]") as HTMLElement;
    if (summary) summary.textContent = "Syncing...";
  }
}

function setSyncingAll(syncing: boolean): void {
  syncAllBtn.disabled = syncing;
  syncAllBtn.textContent = syncing ? "Syncing..." : "Sync All";
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

window.onmessage = (event: MessageEvent) => {
  const msg = event.data.pluginMessage as PluginToUIMessage;
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case "STATUS":
      for (const fs of msg.foundations) {
        renderFoundationStatus(fs);
      }
      break;

    case "SYNC_STARTED":
      setSyncing(msg.foundation, true);
      addLog("info", `Syncing ${msg.foundation}...`);
      break;

    case "SYNC_PROGRESS":
      addLog("info", `${msg.foundation}: ${msg.phase} (${msg.current}/${msg.total})`);
      break;

    case "SYNC_COMPLETE": {
      const parts: string[] = [];
      if (msg.created > 0) parts.push(`${msg.created} created`);
      if (msg.updated > 0) parts.push(`${msg.updated} updated`);
      if (msg.renamed > 0) parts.push(`${msg.renamed} renamed`);
      if (msg.orphaned > 0) parts.push(`${msg.orphaned} orphaned`);
      const detail = parts.length > 0 ? parts.join(", ") : "no changes";

      const row = getFoundationRow(msg.foundation);
      if (row) {
        row.classList.remove("syncing");
        const badge = row.querySelector("[data-badge]") as HTMLElement;
        if (badge) {
          badge.className = "badge badge--synced";
          badge.textContent = "Synced";
        }
        const summary = row.querySelector("[data-summary]") as HTMLElement;
        if (summary) summary.textContent = detail;
      }

      addLog("success", `${msg.foundation} sync complete`, detail);
      break;
    }

    case "VALIDATION_RESULT":
      renderValidation(msg.foundation, msg.result);
      break;

    case "LOG":
      addLog(msg.entry.level, msg.entry.message, msg.entry.detail);
      break;

    case "ERROR":
      showError(msg.message);
      addLog("error", msg.message);
      break;
  }
};

// ---------------------------------------------------------------------------
// Init — request status on load
// ---------------------------------------------------------------------------

send({ type: "GET_STATUS" });
