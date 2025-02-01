const { getAuthHtml } = require('../web/authHtml');

const path = require('path');
const vscode = require('vscode');
const child = require("child_process");
const { getStats } = require("./getStats")
const { getStartHtml } = require('../web/startHtml');
const { display, checkUser, onAuth, setStreaks, getUser } = require("./extHelper")
const fb = require("firebase/app");
const fdb = require("firebase/firestore")

class Devlogs {

    startTime = 0;
    sessionTime = 0;

    panel = null;
    extentionPath = "";
    csvPath = ""
    statusBarUpdateInterval = null;
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

    process = null;
    context = null;

    FILE_USER = ""
    FILE_PROCESS = ""
    FILE_LOG = ""

    userToken = ""
    firebaseConfig = {};
    app = null;
    db = null;


    constructor(context) {
        console.log('Congratulations, your extension "devlog" is now active!');
        this.context = context
        this.startTime = Date.now()
        this.extentionPath = this.context.extensionUri.path.toString().substring(1) + "/"


        require('dotenv').config({ path: this.extentionPath + "/.env" });

        this.firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        }
        this.app = fb.initializeApp(this.firebaseConfig);
        this.db = fdb.getFirestore(this.app);

        this.FILE_USER = this.context.extensionUri.path.toString().substring(1) + "/files/user.txt";
        this.FILE_PROCESS = this.context.extensionUri.path.toString().substring(1) + "/files/cp.py";
        this.FILE_LOG = this.context.extensionUri.path.toString().substring(1) + "/files/log.csv";

        this.statusBar.tooltip = "Extension is active";
        this.statusBar.text = `DevLogs: Not Tracking`;
        // this.statusBar.command = "devlog.helloWorld";
        this.statusBar.show();


        this.panel = vscode.window.createWebviewPanel(
            'devlogs',
            'Devlogs',
            vscode.ViewColumn.Two,
            {
                enableScripts: true
            }
        );


        // this.panel.dispose()

        getUser(this.FILE_USER).then(token => {
            this.userToken = token;
            // if (this.userToken != "") {
            //     this.panel.webview.html = getStartHtml()
            // }
            // else {
            //     const cssFilePath = vscode.Uri.file(
            //         path.join(context.extensionPath, 'web', 'auth.css')
            //     );
            //     const cssFileUri = this.panel.webview.asWebviewUri(cssFilePath);
            //     this.panel.webview.html = getAuthHtml(cssFileUri)
            // }
        });

        this.panel.webview.onDidReceiveMessage(
            message => {
                if (message.command == "start") {
                    this.startCommand()
                }
                else if (message.command == "onAuth") {
                    let curToken = (message.text)
                    checkUser(this.panel, this.FILE_USER, curToken, this.db, fdb)
                }
            },
            undefined,
            this.context.subscriptions
        );



    }

    updateStatusBarWithElapsedTime = () => {
        if (this.startTime === 0) return;
        this.sessionTime = Date.now() - this.startTime;
        const hours = Math.floor(this.sessionTime / (1000 * 60 * 60));
        const minutes = Math.floor((this.sessionTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((this.sessionTime % (1000 * 60)) / 1000);
        this.statusBar.text = `DevLogs Tracking: ${hours}h ${minutes}m ${seconds}s`;
        this.statusBar.show();
    }

    startCommand() {
        console.log("Session starts")
        display("Session Start");
        this.startTime = Date.now();
        if (this.statusBarUpdateInterval) clearInterval(this.statusBarUpdateInterval);
        this.statusBarUpdateInterval = setInterval(this.updateStatusBarWithElapsedTime, 1000);
        setStreaks(this.FILE_USER, this.db, fdb);
        this.process = child.spawn('python', [this.FILE_PROCESS, this.FILE_LOG])
    }

    stopCommand() {
        console.log("Session Stops");
        display('Session Ends');
        if (this.statusBarUpdateInterval) {
            clearInterval(this.statusBarUpdateInterval);
            this.statusBarUpdateInterval = null;
        }
        this.statusBar.text = `DevLogs: Not Tracking`;
        this.startTime = 0;

        if (this.process) this.process.kill();
        getStats(this.context, this.FILE_USER, this.FILE_LOG, this.sessionTime, this.db, fdb);
    }

    authCommand() {
        const cssFilePath = vscode.Uri.file(
            path.join(this.extentionPath, 'web', 'auth.css')
        );

        // Convert the file path to a URI for the webview
        const cssFileUri = this.panel.webview.asWebviewUri(cssFilePath);

        onAuth(this.panel, cssFileUri, this.FILE_USER)
        console.log("Auth cmd")
    }

}

module.exports = { Devlogs }