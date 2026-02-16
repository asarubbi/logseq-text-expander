import "@logseq/libs";
import { ShortcutMap } from "../settings";

export class Replacer {
  /**
   * Checks the current editor state for any triggers and performs replacement if found.
   * Returns true if a replacement was made.
   */
  public async checkAndPerformReplacement(shortcuts: ShortcutMap): Promise<boolean> {
    try {
      // 1. Get content and cursor
      const content = await logseq.Editor.getEditingBlockContent();
      const pos = await logseq.Editor.getEditingCursorPosition();
      
      if (!content || !pos || !pos.pos) {
          return false;
      }
      
      const cursorIndex = pos.pos;
      const textBeforeCursor = content.substring(0, cursorIndex);
      
      // 2. Check for matches
      // Sort triggers by length (descending) to match longest first
      const triggers = Object.keys(shortcuts).sort((a, b) => b.length - a.length);
      
      let matchedTrigger: string | null = null;
      let replacement: string | null = null;

      for (const trigger of triggers) {
        if (textBeforeCursor.endsWith(trigger)) {
          matchedTrigger = trigger;
          replacement = shortcuts[trigger];
          break; // Stop at first match (longest)
        }
      }

      if (!matchedTrigger || !replacement) {
          return false;
      }
      
      console.log(`Text Expander: Match found '${matchedTrigger}' -> '${replacement}'`);

      // 3. Perform Replacement
      const block = await logseq.Editor.getCurrentBlock();
      if (!block) {
          console.warn("Text Expander: content matched but no current block found.");
          return false;
      }
      
      const preTrigger = textBeforeCursor.substring(0, textBeforeCursor.length - matchedTrigger.length);
      const postCursor = content.substring(cursorIndex);
      
      const newContent = preTrigger + replacement + postCursor;
      
      // Fix for "flash and disappear":
      // Exit editing mode to ensure the editor state is flushed.
      await logseq.Editor.exitEditingMode(true);

      // Update the block
      await logseq.Editor.updateBlock(block.uuid, newContent);
      
      // Calculate new cursor position
      const newCursorIndex = preTrigger.length + replacement.length;
      
      // Restore cursor
      await logseq.Editor.editBlock(block.uuid, { pos: newCursorIndex });
      
      return true;

    } catch (e) {
      // Suppress noisy errors during polling, log only critical ones
      // console.error("Text Expander: Error in checkAndPerformReplacement", e);
      return false;
    }
  }
}