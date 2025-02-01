const fs = require('fs');
const vscode = require('vscode');
// const { fdb, db } = require("./firebaseConfig")
const { getAuthHtml } = require('../web/authHtml');
const { calculateTotalDays } = require('./helper');

function display(msg) {
    vscode.window.showInformationMessage(msg)
}

async function getUser(path) {
    try {
        return await fs.promises.readFile(path, 'utf8')
    } catch (err) {
        return ""
    }
}

async function onAuth(panel, cssFileUri, path) {
    try {
        const data = await getUser(path)
        if (data == "") {
            vscode.env.openExternal(vscode.Uri.parse("https://devlogs-dev.netlify.app/"));
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

async function checkUser(panel, path, token, db, fdb) {
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

async function setStreaks(path, db, fdb) {
    try {
        const data = await fs.promises.readFile(path, 'utf8');
        const uid = data.toString().trim();
        const docRef = fdb.doc(db, "users", uid);
        console.log("huaa")
        console.log(docRef.path)
        const docSnap = await fdb.getDoc(docRef);
        console.log("heerrww")
        console.log(docSnap)



        if (docSnap.exists()) {
            let userData = docSnap.data();
            // let date1 = new Date(userData["lastSeen"])
            let date1 = new Date().toLocaleDateString("en-US")
            let date2 = userData["lastSeen"].toString()
            console.log("datt1 = " + date1 + " date2 = " + typeof (date2))

            const [month1, day1, year1] = date1.split('/').map(Number);
            const [month2, day2, year2] = date2.split('/').map(Number);
            const totalDays1 = calculateTotalDays(month1, day1, year1);
            const totalDays2 = calculateTotalDays(month2, day2, year2);

            var days = Math.abs(totalDays2 - totalDays1);
            console.log("days = " + days)

            // getDaysDifference(date1.toString(), userData["lastSeen"].toString())
            if (days == 0) {

            }
            else if (days == 1) {
                const docRef = fdb.doc(db, "users", uid)
                await fdb.updateDoc(docRef, {
                    streak: userData["streak"] + 1,
                    lastSeen: date1,
                });
            }
            else {
                const docRef = fdb.doc(db, "users", uid)
                await fdb.updateDoc(docRef, {
                    streak: 1,
                    lastSeen: date1,
                });
            }
        } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
        }
    }
    catch (err) {
        display(err);
        console.log("ye hai kya " + err);
    }
}

module.exports = { onAuth, checkUser, display, setStreaks, getUser }