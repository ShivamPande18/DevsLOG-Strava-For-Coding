const vscode = require('vscode');
const { Devlogs } = require('./src/devlogs');

/**
 * @param {vscode.ExtensionContext} context
 */


function activate(context) {
    let devlogs = new Devlogs(context)

    context.subscriptions.push(vscode.commands.registerCommand('devlog.start', function () {
        devlogs.startCommand()
    }));

    context.subscriptions.push(vscode.commands.registerCommand('devlog.stop', function () {
        devlogs.stopCommand()
    }));

    context.subscriptions.push(vscode.commands.registerCommand('devlog.authenticate', function () {
        devlogs.authCommand()
    }));
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}