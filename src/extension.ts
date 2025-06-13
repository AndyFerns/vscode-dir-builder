/*
VSCode Extension: Directory Builder from Text Tree
--------------------------------------------------
- Input: Tree-style directory structure as plain text.
- Output: Actual files and folders created in the selected folder after user preview.
*/

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Parses input tree and returns structured list
function parseDirectoryTree(input: string, rootPath: string): { path: string, isDir: boolean }[] {
  const lines = input.split('\n');
  const stack: string[] = [rootPath];
  const result: { path: string, isDir: boolean }[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }
    const line = rawLine.replace(/^[\s\u2502]*[\u251C\u2514]\u2500\u2500\s*/, '');
    const depth = rawLine.search(/\S/) / 2; // Assume 2-space indentation per level

    while (stack.length > depth + 1) {
      stack.pop();
    }
    const isDir = line.endsWith('/');
    const name = line.replace(/\/$/, '').trim();
    const fullPath = path.join(stack[stack.length - 1], name);

    result.push({ path: fullPath, isDir });
    if (isDir) {
      stack.push(fullPath);
    }
  }

  return result;
}

// Display preview in a Webview
function showPreview(treeItems: { path: string, isDir: boolean }[], onConfirm: () => void) {
  const panel = vscode.window.createWebviewPanel(
    'previewTree',
    'Preview Directory Structure',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  const listItems = treeItems.map(item => {
    const label = item.path.split(path.sep).pop();
    return `<li>${item.isDir ? '📁' : '📄'} ${label}</li>`;
  }).join('');

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>Directory Preview</h2>
      <ul>${listItems}</ul>
      <button onclick="confirm()">Create Structure</button>
      <script>
        const vscode = acquireVsCodeApi();
        function confirm() {
          vscode.postMessage({ command: 'confirm' });
        }
      </script>
    </body>
    </html>
  `;

  panel.webview.onDidReceiveMessage(message => {
    if (message.command === 'confirm') {
      panel.dispose();
      onConfirm();
    }
  });
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.buildDirectoryStructure', async () => {
    const input = await vscode.window.showInputBox({
      placeHolder: 'Paste your directory tree (e.g., with ├──, └──, or indented)',
      prompt: 'Enter the directory structure tree text',
      ignoreFocusOut: true,
    });

    if (!input) {
      return vscode.window.showErrorMessage('No input provided.');
    }
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: 'Select root folder for directory structure'
    });

    if (!folderUri || folderUri.length === 0) {
      return vscode.window.showErrorMessage('No folder selected.');
    }

    const rootPath = folderUri[0].fsPath;
    const items = parseDirectoryTree(input, rootPath);

    showPreview(items, () => {
      for (const item of items) {
        if (item.isDir) {
          fs.mkdirSync(item.path, { recursive: true });
        } else {
          fs.writeFileSync(item.path, '', { flag: 'w' });
        }
      }
      vscode.window.showInformationMessage('Directory structure created successfully!');
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
