import "@logseq/libs";
import { getShortcuts, updateShortcuts, ShortcutMap } from "../settings";

// CSS Styles for the Settings UI
const styles = `
  .te-settings-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    max-height: 80vh;
    background: #ffffff; /* Fallback Light */
    background: var(--ls-primary-background-color, #ffffff);
    border: 1px solid var(--ls-border-color);
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    padding: 20px;
    display: flex;
    flex-direction: column;
    color: #000000; /* Fallback Light */
    color: var(--ls-primary-text-color, #000000);
    font-family: var(--ls-font-family);
  }

  @media (prefers-color-scheme: dark) {
      .te-settings-modal {
          background: #1e1e1e; /* Fallback Dark */
          background: var(--ls-primary-background-color, #1e1e1e);
          color: #ffffff;
          color: var(--ls-primary-text-color, #ffffff);
      }
      .te-input {
          background: #333;
          color: white;
      }
  }

  .te-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
  }

  .te-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--ls-border-color);
    padding-bottom: 10px;
  }

  .te-header h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .te-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: var(--ls-secondary-text-color);
  }

  .te-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 20px;
    min-height: 0; /* Critical for flex scrolling */
  }

  .te-item {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    align-items: center;
  }

  .te-input {
    flex: 1;
    padding: 8px;
    border: 1px solid var(--ls-border-color);
    border-radius: 4px;
    background: var(--ls-tertiary-background-color);
    color: var(--ls-primary-text-color);
  }
  
  .te-input-trigger {
    flex: 0 0 120px; /* Fixed width for trigger */
  }

  .te-btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-weight: 500;
  }

  .te-btn-primary {
    background: var(--ls-link-text-color);
    color: #fff;
  }

  .te-btn-danger {
    background: var(--ls-error-text-color, #ef4444);
    color: #fff;
    padding: 8px 12px;
  }

  .te-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid var(--ls-border-color);
    padding-top: 15px;
  }
`;

export class SettingsModal {
  private isOpen = false;

  constructor() {
    // Inject styles
    const styleEl = document.createElement("style");
    styleEl.innerHTML = styles;
    document.head.appendChild(styleEl);
  }

  // OPTIMISTIC UI: Accept optional state to render immediately
  public open(optimisticShortcuts?: ShortcutMap) {
    if (this.isOpen && !optimisticShortcuts) return; // If already open and no update, do nothing
    this.isOpen = true;
    this.render(optimisticShortcuts);
    logseq.showMainUI();
  }

  public close() {
    this.isOpen = false;
    const modal = document.getElementById("te-settings-modal");
    const overlay = document.getElementById("te-overlay");
    if (modal) modal.remove();
    if (overlay) overlay.remove();
    logseq.hideMainUI();
  }

  private render(optimisticShortcuts?: ShortcutMap) {
    // Clean up existing if re-rendering
    const existingModal = document.getElementById("te-settings-modal");
    const existingOverlay = document.getElementById("te-overlay");
    if (existingModal) existingModal.remove();
    if (existingOverlay) existingOverlay.remove();

    // Overlay
    const overlay = document.createElement("div");
    overlay.id = "te-overlay";
    overlay.className = "te-overlay";
    overlay.onclick = () => this.close();
    document.body.appendChild(overlay);

    // Modal
    const modal = document.createElement("div");
    modal.id = "te-settings-modal";
    modal.className = "te-settings-modal";
    
    // Content: Use optimistic state if provided, otherwise fetch from DB (which might be stale)
    const shortcuts = optimisticShortcuts || getShortcuts();
    
    let itemsHtml = "";
    Object.entries(shortcuts).forEach(([trigger, replacement], index) => {
        itemsHtml += `
            <div class="te-item" data-index="${index}">
                <input type="text" class="te-input te-input-trigger" value="${trigger}" placeholder="Trigger (;;hw)" onchange="window.teUpdateTrigger('${trigger}', this.value)">
                <input type="text" class="te-input" value="${replacement.replace(/"/g, '&quot;')}" placeholder="Replacement" onchange="window.teUpdateReplacement('${trigger}', this.value)">
                <button class="te-btn te-btn-danger" onclick="window.teDelete('${trigger}')">Trash</button>
            </div>
        `;
    });

    modal.innerHTML = `
      <div class="te-header">
        <h2>Text Expander Settings</h2>
        <button class="te-close-btn" onclick="window.teClose()">&times;</button>
      </div>
      <div class="te-list" id="te-list">
        ${itemsHtml}
        <div class="te-item">
            <input type="text" id="te-new-trigger" class="te-input te-input-trigger" placeholder="New Trigger (e.g. ;;em)">
            <input type="text" id="te-new-replacement" class="te-input" placeholder="New Replacement (e.g. email@test.com)">
            <button class="te-btn te-btn-primary" onclick="window.teAdd()">Add</button>
        </div>
      </div>
      <div class="te-footer">
        <button class="te-btn" onclick="window.teClose()">Close</button>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Bind global handlers for vanilla JS events
    (window as any).teClose = () => this.close();
    
    (window as any).teDelete = (trigger: string) => {
        // Optimistic Update
        const current = optimisticShortcuts ? { ...optimisticShortcuts } : getShortcuts();
        delete current[trigger];
        updateShortcuts(current);
        // Re-render immediately with new state
        this.open(current);
    };

    (window as any).teAdd = () => {
        const triggerInput = document.getElementById("te-new-trigger") as HTMLInputElement;
        const replaceInput = document.getElementById("te-new-replacement") as HTMLInputElement;
        
        if (triggerInput.value && replaceInput.value) {
            // Optimistic Update
            const current = optimisticShortcuts ? { ...optimisticShortcuts } : getShortcuts();
            current[triggerInput.value] = replaceInput.value;
            updateShortcuts(current);
            // Re-render immediately
            this.open(current);
        }
    };

    (window as any).teUpdateTrigger = (oldTrigger: string, newTrigger: string) => {
         if (oldTrigger === newTrigger) return;
         const current = optimisticShortcuts ? { ...optimisticShortcuts } : getShortcuts();
         const replacement = current[oldTrigger];
         delete current[oldTrigger];
         current[newTrigger] = replacement;
         updateShortcuts(current);
         // Re-render to ensure consistency
         this.open(current);
    };

    (window as any).teUpdateReplacement = (trigger: string, newReplacement: string) => {
         const current = optimisticShortcuts ? { ...optimisticShortcuts } : getShortcuts();
         current[trigger] = newReplacement;
         updateShortcuts(current);
         // Ideally re-render to keep state consistent, though input value is already there.
         // But let's be safe to ensure internal state matches UI.
         // Focusing might be lost here, but it ensures data sync.
         this.open(current);
    };
  }
}
