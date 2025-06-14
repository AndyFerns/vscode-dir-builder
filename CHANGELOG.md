# Changelog

All notable changes to the "vscode-dir-builder" extension will be documented in this file.
<!-- 
Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file. -->

## [Unreleased]

- Initial release

## [1.0.0] - 2025-06-14

### Added

- 🌳 Multiline webview input panel for directory structure entry with VSCode-themed UI.
- 📂 Tree parsing logic for both indented and ASCII-style (├──, └──) formats with fallback to single-line input.
- 👀 Webview-based directory preview panel with file/folder icons before creation.
- 📁 Folder selection dialog to pick root location before generating structure.
- ❗ Conflict resolution prompts for overwriting, skipping, or cancelling existing files.
- 🧹 Undo support after creation (files and folders deleted in reverse order).
- 🚫 Graceful handling of "EISDIR" and "ENOENT" errors during creation.
- 💅 Editor-theme matching using `--vscode-*` CSS variables across both input and preview views.

### Fixed

- 🧯 Prevented creation attempts on directory paths that already exist as folders.
- 🧼 Improved parsing logic to clean whitespace, smart symbols, and edge formatting issues.
- 💥 Fixed broken previews caused by malformed or single-line tree inputs.
