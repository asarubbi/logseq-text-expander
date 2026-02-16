# Logseq Text Expander

A functional, opinionated text expander plugin for Logseq. Automatically replaces predefined triggers with longer text snippets as you type.
This comes with no guarantees. I just created it for my personal need. Use it at your own risk.

## Features

- **Instant Expansion:** Type a trigger (e.g., `;;hw`) and it instantly expands (e.g., `Hello World`).
- **Configurable:** Define your own shortcuts in the plugin settings using simple JSON.
- **Context Aware:** Only expands when you are actively editing a block.
- **Smart Cursor:** Automatically positions the cursor after the expanded text.

## Usage

1.  **Install:** Load this plugin in Logseq (enable Developer Mode -> Load Unpacked Plugin).
2.  **Configure:** Go to `Settings -> Plugin Settings -> Text Expander`.
3.  **Define Shortcuts:** Enter a JSON object with your triggers and replacements.
    ```json
    {
      ";;hw": "Hello World",
      ";;email": "my.email@example.com",
      ";;date": "2023-10-27"
    }
    ```
4.  **Type:** Start typing `;;hw` in any block!

## Development

1.  `npm install`
2.  `npm run build`
3.  Load the directory in Logseq.

## License

MIT
