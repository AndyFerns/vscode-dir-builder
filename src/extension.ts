/*
VSCode Extension: Directory Builder from Text Tree
--------------------------------------------------
- Input: Tree-style directory structure as plain text.
- Output: Actual files and folders created in the selected folder after user preview.
- Features:
  - Folder selection before creation
  - Undo support to delete created structure
  - Conflict resolution prompt for existing files
  - Robust parsing with indentation and symbols like ├──, └──, │
  - Webview-based multiline input support
*/

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let createdItems: string[] = []; // Track created items for undo

// Parses input tree and returns structured list
function parseDirectoryTree(input: string, rootPath: string): { path: string, isDir: boolean }[] {
  const cleaned = input
    .replace(/\r\n/g, '\n')
    .replace(/[│]+/g, '│')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/(\. )?├──/g, '├──')
    .replace(/(\. )?└──/g, '└──');

  const lines = cleaned
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.length > 0);

  const result: { path: string, isDir: boolean }[] = [];
  const stack: string[] = [rootPath];
  const depthStack: number[] = [-1];

  for (let line of lines) {
    line = line.replace(/[\u2500\u2502\u2514\u251C]/g, ' '); // Remove box-drawing chars
    const match = line.match(/^(\s*)([^\s].*)$/);
    if (!match) {
      continue;
    }
    const indent = match[1].length;
    const nameRaw = match[2].trim();
    const isDir = nameRaw.endsWith('/') || nameRaw.endsWith(':');
    const name = nameRaw.replace(/[:/]$/, '').trim();

    while (depthStack.length && indent <= depthStack[depthStack.length - 1]) {
      stack.pop();
      depthStack.pop();
    }

    const fullPath = path.join(stack[stack.length - 1], name);
    result.push({ path: fullPath, isDir });

    if (isDir) {
      stack.push(fullPath);
      depthStack.push(indent);
    }
  }

  return result;
}

// Show a webview-based multiline input box for tree input
async function getDirectoryInput(): Promise<string | undefined> {
  return new Promise(resolve => {
    const panel = vscode.window.createWebviewPanel(
      'treeInput',
      'Paste Directory Tree',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>Paste Directory Tree</h2>
        <textarea id="tree" rows="15" style="width:100%" placeholder="Paste tree here"></textarea>
        <br>
        <button onclick="submitTree()">Submit</button>
        <script>
          const vscode = acquireVsCodeApi();
          function submitTree() {
            const tree = document.getElementById('tree').value;
            vscode.postMessage({ command: 'submit', tree });
          }
        </script>
      </body>
      </html>
    `;

    panel.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'submit') {
        panel.dispose();
        resolve(msg.tree);
      }
    });
  });
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
    let input = await getDirectoryInput();

    // Fallback to inputBox if no input from Webview
    if (!input) {
      input = await vscode.window.showInputBox({
        placeHolder: 'Paste your directory tree (e.g., with ├──, └──, or indented)',
        prompt: 'Enter the directory structure tree text',
        ignoreFocusOut: true,
      });
    }

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

    showPreview(items, async () => {
      createdItems = [];
      for (const item of items) {
        if (item.isDir) {
          if (!fs.existsSync(item.path)) {
            fs.mkdirSync(item.path, { recursive: true });
            createdItems.push(item.path);
          }
        } else {
          if (fs.existsSync(item.path)) {
            const choice = await vscode.window.showQuickPick([
              'Overwrite', 'Skip', 'Cancel Entire Operation'
            ], { placeHolder: `File already exists: ${item.path}` });

            if (choice === 'Cancel Entire Operation') {
              vscode.window.showWarningMessage('Directory creation cancelled by user.');
              return;
            } else if (choice === 'Skip') {
              continue;
            }
          }
          fs.writeFileSync(item.path, '', { flag: 'w' });
          createdItems.push(item.path);
        }
      }

      const undo = await vscode.window.showInformationMessage('Directory structure created successfully!', 'Undo');
      if (undo === 'Undo') {
        for (const p of [...createdItems].reverse()) {
          try {
            if (fs.lstatSync(p).isDirectory()) {
              fs.rmdirSync(p, { recursive: true });
            } else {
              fs.unlinkSync(p);
            }
          } catch (e) {
            console.error('Undo error:', e);
          }
        }
        vscode.window.showInformationMessage('Undo complete: All created items removed.');
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
