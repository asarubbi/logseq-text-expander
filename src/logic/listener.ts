import "@logseq/libs";
import { Replacer } from "./replacer";
import { getShortcuts } from "../settings";

export class Listener {
  private replacer: Replacer;
  private listening: boolean = false;
  private intervalId: number | null = null;
  private pollInterval = 100; // ms
  private isAppVisible: boolean = true; // Track visibility

  constructor() {
    this.replacer = new Replacer();
  }

  public start() {
    if (this.listening) return;
    
    // Listen for visibility changes to pause polling when Logseq is hidden
    logseq.App.onRouteChanged(() => {
        // Simple heuristic: If route changes, we are likely active.
        // But better: use visibility API if available or infer from activity.
        // Actually, logseq.App.onMacroRendererSlotted might fire too much.
        // 'ui:visible:changed' is the one we want if it works.
        // Let's assume we are visible unless told otherwise.
        this.resumePolling();
    });

    // Native visibility API
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            this.pausePolling();
        } else {
            this.resumePolling();
        }
    });
    
    // Initial start
    this.resumePolling();
    
    this.listening = true;
    console.log("Text Expander: Polling Listener started with optimizations");
  }

  public stop() {
    if (!this.listening) return;
    
    this.pausePolling();

    this.listening = false;
    console.log("Text Expander: Listener stopped");
  }

  private pausePolling() {
      if (this.intervalId !== null) {
          window.clearInterval(this.intervalId);
          this.intervalId = null;
          console.log("Text Expander: Polling paused (background)");
      }
  }

  private resumePolling() {
      if (this.intervalId === null) {
          this.intervalId = window.setInterval(async () => {
              await this.check();
          }, this.pollInterval);
          console.log("Text Expander: Polling resumed");
      }
  }

  private async check() {
    try {
        // 1. Check if editing
        const isEditing = await logseq.Editor.checkEditing();
        if (!isEditing) return;

        // 2. Perform check and replace
        const shortcuts = getShortcuts();
        
        // The replacer handles getting content and matching
        // It returns true if it replaced something
        await this.replacer.checkAndPerformReplacement(shortcuts);
        
    } catch (e) {
        console.error("Text Expander: Polling error", e);
    }
  }
}
