const vscode = require('vscode');
const { Devlogs } = require('./src/devlogs');
const path = require("path")
// const { db } = require("./src/firebaseConfig")
const { setExtensionPath } = require("./src/global")

/**
 * @param {vscode.ExtensionContext} context
 */


async function activate(context) {
    setExtensionPath(context.extensionUri.path.toString().substring(1))
    let devlogs = new Devlogs(context)

    console.log("Firestore initialized: ", devlogs.db);

    context.subscriptions.push(vscode.commands.registerCommand('devlog.start', function () {
        devlogs.startCommand()
    }));

    context.subscriptions.push(vscode.commands.registerCommand('devlog.stop', function () {
        devlogs.stopCommand()
    }));

    context.subscriptions.push(vscode.commands.registerCommand('devlog.authenticate', function () {
        devlogs.authCommand()
    }));

    context.subscriptions.push(vscode.commands.registerCommand('devlog.dashboard', function () {
        vscode.env.openExternal(vscode.Uri.parse("https://devlogs-dev.netlify.app/"));
    }));

    // context.subscriptions.push(vscode.commands.registerCommand('devlog.test', function () {
    //     const activeEditor = vscode.window.activeTextEditor;

    //     if (activeEditor) {
    //         // Get the file name
    //         const fileName = activeEditor.document.fileName;

    //         // Get the workspace folder containing the current file
    //         const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);

    //         // Get the project name (the folder name of the workspace)
    //         const projectName = workspaceFolder ? path.basename(workspaceFolder.uri.fsPath) : 'No workspace opened';

    //         vscode.window.showInformationMessage(`Project: ${projectName}`);
    //     } else {
    //         vscode.window.showInformationMessage('No file is currently open.');
    //     }
    // }));
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}