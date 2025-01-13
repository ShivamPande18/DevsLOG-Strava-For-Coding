const fs = require('fs');
const vscode = require('vscode');
const { fdb, db } = require("./firebaseConfig")
const { getAuthHtml } = require('../authHtml');

function display(msg) {
    vscode.window.showInformationMessage(msg)
}


async function onAuth(panel, cssFileUri, path) {
    try {
        const data = await fs.promises.readFile(path, 'utf8')
        if (data == "") {
            vscode.env.openExternal(vscode.Uri.parse("https://devlogs-dev.netlify.app/register"));
            panel.webview.html = getAuthHtml(cssFileUri);
        }
        else {
            panel.dispose();
            display("User Authenticated");
        }
    }
    catch (err) {
        panel.dispose();
        vscode.window.showInformationMessage(err);
    }
}

async function checkUser(panel, path, token) {
    const q = fdb.query(fdb.collection(db, "users"), fdb.where("userId", "==", token), fdb.limit(1));
    const querySnapshot = await fdb.getDocs(q);
    if (!querySnapshot.empty) {
        fs.writeFile(path, token, function write(err) {
            if (err) {
                return console.error(err);
            }
            display('User Set');
            panel.dispose();
        })
    } else {
        display("Wrong token");
    }
}

module.exports = { onAuth, checkUser }