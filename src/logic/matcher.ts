import { ShortcutMap } from "../settings";

export class Matcher {
  private buffer: string = "";
  private readonly maxBufferSize = 50; // Enough for reasonably long triggers

  public push(char: string) {
    this.buffer += char;
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer = this.buffer.slice(-this.maxBufferSize);
    }
  }

  public handleBackspace() {
    this.buffer = this.buffer.slice(0, -1);
  }

  public clear() {
    this.buffer = "";
  }

  /**
   * Checks if the end of the buffer matches any trigger.
   * Returns the matched trigger and replacement if found.
   */
  public check(shortcuts: ShortcutMap): { trigger: string; replacement: string } | null {
    // Check for matches at the end of the buffer
    // We sort triggers by length (descending) to match the longest possible trigger first
    const triggers = Object.keys(shortcuts).sort((a, b) => b.length - a.length);

    for (const trigger of triggers) {
      if (this.buffer.endsWith(trigger)) {
        return { trigger, replacement: shortcuts[trigger] };
      }
    }

    return null;
  }
}
