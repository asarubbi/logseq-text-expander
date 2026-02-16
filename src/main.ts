import "@logseq/libs";
import { settingsSchema } from "./settings";
import { Listener } from "./logic/listener";
import { SettingsModal } from "./ui/settings-modal";

const main = async () => {
  console.log("Logseq Text Expander plugin loading...");

  // Register settings
  logseq.useSettingsSchema(settingsSchema);

  // Initialize logic
  const listener = new Listener();
  listener.start();
  
  // UI
  const settingsModal = new SettingsModal();

  // Model for UI interactions (Standard way for data-on-click)
  logseq.provideModel({
      openSettings: () => {
          console.log("Text Expander: Opening settings via toolbar");
          settingsModal.open();
      }
  });
  
  // UNIQUE Command ID to bypass "already exists" error on reload
  const commandId = `open-settings-${Date.now()}`;

  // Command to open settings (Ctrl+K)
  logseq.App.registerCommandPalette(
      {
        key: commandId,
        label: "Text Expander: Open Settings",
      },
      () => {
        console.log("Text Expander: Opening settings via command");
        settingsModal.open();
      }
  );
  
  // Toolbar button
  logseq.App.registerUIItem("toolbar", {
    key: "text-expander-settings",
    template: `
      <a class="button" data-on-click="openSettings" title="Text Expander Settings">
        <i class="ti ti-keyboard"></i>
      </a>
    `,
  });

  // Cleanup on unload
  logseq.beforeunload(async () => {
    listener.stop();
  });
  
  console.log("Logseq Text Expander plugin loaded");
}

logseq.ready(main).catch(console.error);