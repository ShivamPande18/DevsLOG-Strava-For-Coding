const path = require('path');
const vscode = require('vscode');
const child = require("child_process");
const { onAuth } = require("./extHelper")
const { checkUser } = require("./extHelper")
const { getStartHtml } = require('../web/startHtml');

class Devlogs {

    startTime = 0;
    sessionTime = 0;

    panel = null;
    extentionPath = "";
    statusBarUpdateInterval = null;
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

    process = null;
    context = null;

    constructor(context) {
        console.log('Congratulations, your extension "devlog" is now active!');
        this.context = context
        this.extentionPath = this.context.extensionUri["path"] + "/ "

        this.statusBar.tooltip = "Extension is active";
        this.statusBar.text = `DevLogs: Not Tracking`;
        this.statusBar.command = "devlog.helloWorld";
        this.statusBar.show();

        this.panel = vscode.window.createWebviewPanel(
            'devlogs',
            'Devlogs',
            vscode.ViewColumn.Two,
            {
                enableScripts: true
            }
        );

        this.panel.webview.html = getStartHtml()

    }

    updateStatusBarWithElapsedTime() {
        if (this.startTime === 0) return;
        this.sessionTime = Date.now() - this.startTime;
        const hours = Math.floor(this.sessionTime / (1000 * 60 * 60));
        const minutes = Math.floor((this.sessionTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((this.sessionTime % (1000 * 60)) / 1000);
        this.statusBar.text = `DevLogs Tracking: ${hours}h ${minutes}m ${seconds}s`;
    }

    startCommand() {
        console.log("Session starts")
        vscode.window.showInformationMessage("Session Start");
        this.startTime = Date.now();
        if (this.statusBarUpdateInterval) clearInterval(this.statusBarUpdateInterval);
        this.statusBarUpdateInterval = setInterval(this.updateStatusBarWithElapsedTime, 1000);

        const path = this.extentionPath + "cp.py"
        const logPath = this.extentionPath + "log.csv"
        // setStreaks(this.extentionPath + "cp.py");
        this.process = child.spawn('python', [path, logPath])
    }

    stopCommand() {
        console.log("Session Stops");
        vscode.window.showInformationMessage('Session Ends');
        if (this.statusBarUpdateInterval) {
            clearInterval(this.statusBarUpdateInterval);
            this.statusBarUpdateInterval = null;
        }
        this.statusBar.text = `DevLogs: Not Tracking`;
        this.startTime = 0;

        if (this.process) this.process.kill();
        // getStats(context);
    }

    authCommand() {
        var userPath = vscode.Uri.file(
            path.join(this.extentionPath + "user.txt")
        );

        const cssFilePath = vscode.Uri.file(
            path.join(this.extentionPath, 'web', 'auth.css')
        );

        // Convert the file path to a URI for the webview
        const cssFileUri = this.panel.webview.asWebviewUri(cssFilePath);

        onAuth(this.panel, cssFileUri, userPath)

        this.panel.webview.onDidReceiveMessage(
            message => {
                if (message.command == "onAuth") {

                    let curToken = (message.text)
                    checkUser(this.panel, userPath, curToken)
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

}

module.exports = { Devlogs }