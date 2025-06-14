# vscode-dir-builder

**vscode-dir-builder** is a Visual Studio Code extension that allows you to generate complex directory and file structures by simply pasting a directory tree in text format. It's perfect for scaffolding projects quickly and visually. Its also useful for DIRECTLY copy-pasting directory structures provided by LLMs and creating the files and folders automatically, saving precious time!

![Preview](assets/Project%20Demo%20GIF.gif)

---

## Features

- 🖊️ **Multiline Input Webview**: Paste your directory tree (indented or ASCII-style like `├──`, `└──`) into a themed, multiline input view.
- 👀 **Preview Before Creation**: A confirmation screen shows the parsed structure using 📁 and 📄 icons before generating anything on disk.
- 📂 **Select Destination Folder**: Easily choose the folder where the structure should be created.
- ✍️ **Smart Parsing**: Supports trees with indentation, Unicode box-drawing characters, and trailing slashes or colons to indicate folders.
- ⚠️ **Conflict Resolution**: Prompts you to overwrite, skip, or cancel if a file already exists.
- ⏪ **Undo Option**: Fully reverses all file/folder creations if needed — great for quick experimentation.
- 🧼 **Clean Formatting**: Automatically normalizes inconsistent input symbols or spacing.

---

## Requirements

- Visual Studio Code `v1.70.0` or later.
- No external dependencies. Everything runs locally and offline.

---

## Extension Settings

This extension currently does not contribute any custom settings.

---

## Known Issues

- May fail silently on deeply nested trees if input formatting is inconsistent.
- Folder creation might be blocked if the root folder is already open and locked in another process (e.g., VSCode itself).
- Undo might not work perfectly on symbolic links or read-only files.

---

## Release Notes

### 1.0.0

Initial release of vscode-dir-builder 🎉  

- Includes multiline tree input via webview.
- Tree preview panel with themed styling.
- Directory and file creation with conflict handling and undo.

---

## Following extension guidelines

This extension was built following VSCode's official guidelines:

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

---

## Working with Markdown

Helpful markdown tools when editing this README:

- Toggle preview (`Ctrl+Shift+V` / `Cmd+Shift+V`)
- Split editor: (`Ctrl+\` / `Cmd+\`)
- Use `Ctrl+Space` to trigger suggestions

---

## For more information

- [VSCode API Docs](https://code.visualstudio.com/api)
- [Markdown Basics](https://www.markdownguide.org/)

---

Enjoy seamlessly building folder structures!
