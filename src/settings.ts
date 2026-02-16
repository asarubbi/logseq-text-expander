import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

export const settingsSchema: SettingSchemaDesc[] = [
  {
    key: "shortcuts",
    type: "string",
    default: JSON.stringify(
      {
        ";;hw": "Hello World",
        ";;todo": "TODO",
        ";;date": "{{today}}",
      },
      null,
      2
    ),
    description:
      "A JSON object where keys are triggers and values are replacements. Example: { ';;hw': 'Hello World' }",
    title: "Shortcuts (JSON)",
    inputAs: "textarea", 
  },
];

export interface ShortcutMap {
  [trigger: string]: string;
}

export const getShortcuts = (): ShortcutMap => {
  const raw = logseq.settings?.shortcuts as string;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse shortcuts JSON", e);
    return {};
  }
};

export const updateShortcuts = (newShortcuts: ShortcutMap) => {
    logseq.updateSettings({ shortcuts: JSON.stringify(newShortcuts, null, 2) });
};