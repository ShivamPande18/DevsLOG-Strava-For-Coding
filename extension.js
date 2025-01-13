const { Devlogs } = require('./src/devlogs');

const fs = require('fs');
const vscode = require('vscode');
const path = require('path');
const { firebaseConfig } = require("./firebaseHandler")

const { parse } = require("csv-parse");
const { getStatHtml } = require("./statHtml")
const { onAuth } = require("./src/extHelper")
const { calculateTotalDays, getLast30Days, msToHours } = require("./helper")
const { fdb, db } = require("./src/firebaseConfig")


/**
 * @param {vscode.ExtensionContext} context
 */



let startTime = 0;
let sessionTime = 0;
const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
let statusBarUpdateInterval = null;
let devlogs;

function updateStatusBarWithElapsedTime() {
    if (startTime === 0) return;
    sessionTime = Date.now() - startTime;
    const hours = Math.floor(sessionTime / (1000 * 60 * 60));
    const minutes = Math.floor((sessionTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((sessionTime % (1000 * 60)) / 1000);
    statusBarItem.text = `DevLogs Tracking: ${hours}h ${minutes}m ${seconds}s`;
}


function display(txt) {
    vscode.window.showInformationMessage(txt);
}


function getPath(fileName, context) {
    return vscode.Uri.joinPath(context.extensionUri, fileName)["path"].substring(1)
}

async function setStreaks(path) {
    try {
        const data = await fs.promises.readFile(path, 'utf8');
        const uid = data.toString().trim();
        const docRef = fdb.doc(db, "users", uid);
        const docSnap = await fdb.getDoc(docRef);


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
        console.log(err);
    }
}


async function getStats(context) {

    let word_count = 0;
    let line_count = 0;
    let char_count = 0;
    let letter_count = 0;
    let number_count = 0;
    let backspace_count = 0;
    let space_count = 0;
    let enter_count = 0;
    let tab_count = 0;
    let paranthesis_count = 0;
    let semicolon_count = 0;
    let file_counts = 0;
    let langHash = new Map()
    let langs = ["", "", "", "", "", ""];



    let fileHash = new Map()
    let cmdCnt = 0;
    const csvPath = getPath("log.csv", context)

    let userid = fs.readFileSync(getPath("user.txt", context), 'utf8');
    let streak = 0;
    let logs = [];
    let dates = [];
    let sTimes = [];
    let langsDb = [];
    let curDate = new Date().toLocaleDateString("en-US");
    const userRef = fdb.collection(db, 'users');
    const q = fdb.query(userRef, fdb.where('userId', '==', userid));


    try {
        const querySnapshot = await fdb.getDocs(q);
        querySnapshot.forEach((doc) => {
            streak = doc.data().streak;
            logs = doc.data().logs;
            langsDb = doc.data().langs;
            // curDate = doc.data().lastSeen.toString();
        });
    } catch (error) {
        console.error("Error getting streak:", error);
    }


    logs.forEach(log => {
        const [date, sTime] = log.split('-');
        dates.push(date);
        sTimes.push(parseInt(sTime));
    });
    const [result, tempDates, tempTime] = getLast30Days(curDate, dates, sTimes, sessionTime)
    const combinedLogs = tempDates.map((date, i) => `${date}-${tempTime[i] || 0}`);



    let prodScore = 0;
    fs.createReadStream(csvPath)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            prodScore++;
            cmdCnt++;
            if (!langHash.has(row[3])) {
                langHash.set(row[3], 1)

            }
            else {
                langHash.set(row[3], langHash.get(row[3]) + 1)
            }

            if (row[0].length === 1) {
                switch (row[0]) {
                    case "(":
                        paranthesis_count += 2;
                        char_count += 2;
                        break;
                    case ")": break;
                    case ";":
                        semicolon_count++;
                        char_count++;
                        break;
                    case (/[0-9]/).test(row[0]):
                        number_count++;
                        char_count++;
                        break;
                    default:
                        if (row[0].length === 1 && (/[a-zA-Z]/).test(row[0])) {
                            letter_count++;
                        }
                        if (row[0].length === 1 && (/[0-9]/).test(row[0])) {
                            number_count++;
                        }
                        char_count++;
                        break;
                }
            }
            else {
                switch (row[0]) {
                    case "space":
                        space_count++;
                        break;
                    case "backspace":
                        backspace_count++;
                        break;
                    case "enter":
                        enter_count++;
                        break;
                    case "tab":
                        tab_count++;
                        break;
                }
            }

            paranthesis_count = Math.ceil(paranthesis_count / 2);
            word_count = space_count + enter_count;
            line_count = enter_count;

            if (!fileHash.has(row[2])) {
                file_counts++;
                fileHash.set(row[2], 1)
            }

        })
        .on("error", function (error) {
            // Handle the errors
            console.log("Error \n " + error.message);
        })
        .on("end", function () {
            const sessionSec = Math.ceil(sessionTime / 1000);
            prodScore = parseFloat(((prodScore / sessionSec) * (100 / 3)).toFixed(2));
            if (prodScore > 100) prodScore = 100;
            // executed when parsing is complete
            console.log("File read successful");

            langHash.forEach((val, key) => {
                langHash.set(key, (val / cmdCnt) * 100)
            })

            let i = 0;
            let sortedLangHash = Array.from(langHash).sort((a, b) => b[1] - a[1]);

            console.log("Ans = " + sortedLangHash)
            for (let i = 0; i < Math.min(6, sortedLangHash.length); i++) {
                langs[i] = sortedLangHash[i][0] + "-" + parseFloat(sortedLangHash[i][1]).toFixed(2) + "%"
            }

            let langsTemp = new Array(6).fill(" ");

            if (langs.filter(lang => lang !== "").length > 3) {
                let remainingSum = 0;
                for (let i = 2; i < langs.length; i++) {
                    if (langs[i] !== "") {
                        remainingSum += parseFloat(langs[i].split(" ")[1]);
                    }
                }
                const first = langs[0];
                const second = langs[1];
                langsTemp[0] = first;
                langsTemp[1] = second;
                langsTemp[2] = "Others " + remainingSum.toFixed(2) + "%";
            }

            for (let i = 0; i < langs.length; i++) {
                if (langs[i] && langs[i] !== "") {
                    const langParts = langs[i].split("-");
                    const lang = langParts[0];
                    const percentage = parseFloat(langParts[1]);
                    const sTimes = (percentage / 100) * sessionTime;

                    // Find if language already exists in langsDb
                    let found = false;
                    for (let j = 0; j < langsDb.length; j++) {
                        const dbParts = langsDb[j].split("-");
                        if (dbParts[0] === lang) {
                            // Add hours to existing entry
                            const newTime = parseFloat(dbParts[1]) + sTimes;
                            langsDb[j] = `${lang}-${newTime}`;
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        // Add new language entry
                        langsDb.push(`${lang}-${sTimes}`);
                    }

                    // Sort langsDb by hours in descending order
                    langsDb.sort((a, b) => {
                        const hoursA = parseFloat(a.split("-")[1]);
                        const hoursB = parseFloat(b.split("-")[1]);
                        return hoursB - hoursA;
                    });
                }
            }

            try {
                const docRef = fdb.doc(db, 'users', userid);
                fdb.updateDoc(docRef, {
                    logs: combinedLogs,
                    langs: langsDb,
                    productivity: prodScore,
                });
            } catch (error) {
                console.error("Error updating logs:", error);
            }

            // langHash.forEach((val, key) => {
            //     console.log(key + " " + val + "%")
            //     langs[i] = key + " " + val.toFixed(2) + "%"
            //     i++;
            // })

            const panel = vscode.window.createWebviewPanel(
                'sessionSummary', // Identifies the type of the webview. Used internally
                'Session Summary', // Title of the panel displayed to the user
                vscode.ViewColumn.One, // Editor column to show the new webview panel in.
                {
                    enableScripts: true
                } // Webview options. More on these later.
            );

            const cssFilePath = vscode.Uri.file(
                path.join(context.extensionPath, 'web', 'stat.css')
            );
            const cssFileUri = panel.webview.asWebviewUri(cssFilePath);


            panel.webview.html = getStatHtml(cssFileUri, streak, word_count, line_count, msToHours(sessionTime), result, langsTemp);
        });

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


function getStartHtml() {
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        div {
            background-color: black;
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .startBtn {
            background-color: #FF6500;
            border: #FF6500 solid;
            border-radius: 10px;
            padding-inline: 20px;
            padding-block: 10px;
            font-size: 2rem;
            color: white;
            margin-top: 100px;
        }

        .startBtn:hover {
            cursor: pointer;
            background-color: black;
        }

        .time {
            color: white;
            font-size: 6rem;
            font-weight: bold;
        }

        .desc {
            color: white;
            font-size: 2rem;
        }
    </style>
</head>

<body>

    <div class="panel">
        <span class="time">00:00:00</span>
        <span class="desc">coded today</span>
        <button id = "myBtn" class="startBtn">Start Session</button>
    </div>
    <script>
        document.getElementById("myBtn").addEventListener("click", function(){
        const vscode = acquireVsCodeApi();
        vscode.postMessage({
                command: 'start',
            })
        });

    </script>
</body>

</html>
    `
}

function activate(context) {
    devlogs = new Devlogs(context)

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

function activate2(context) {

    const panel = vscode.window.createWebviewPanel(
        'devlogsStart', // Identifies the type of the webview. Used internally
        'Devlogs Start', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
            enableScripts: true
        } // Webview options. More on these later.
    );

    panel.webview.html = getStartHtml()
    panel.webview.onDidReceiveMessage(
        message => {
            panel.dispose()
            console.log("Session starts")
            // const logPath = vscode.Uri.joinPath(context.extensionUri, 'log.csv');
            display('Session Started');
            startTime = Date.now();

            if (statusBarUpdateInterval) clearInterval(statusBarUpdateInterval);
            statusBarUpdateInterval = setInterval(updateStatusBarWithElapsedTime, 1000);

            const path = getPath("cp.py", context)
            const logPath = getPath("log.csv", context)
            setStreaks(getPath("user.txt", context));
            // process = child.spawn('python', [path, logPath])
        },
        undefined,
        context.subscriptions
    );

    const startCmd = vscode.commands.registerCommand('devlog.start', function () {
        console.log("Session starts")
        // const logPath = vscode.Uri.joinPath(context.extensionUri, 'log.csv');
        display('Session Started');
        startTime = Date.now();

        if (statusBarUpdateInterval) clearInterval(statusBarUpdateInterval);
        statusBarUpdateInterval = setInterval(updateStatusBarWithElapsedTime, 1000);

        const path = getPath("cp.py", context)
        const logPath = getPath("log.csv", context)
        setStreaks(getPath("user.txt", context));
        // process = child.spawn('python', [path, logPath])
    });

    context.subscriptions.push(startCmd);

    const stopCmd = vscode.commands.registerCommand('devlog.stop', function () {
        console.log("Session Stops");
        display('Session Ends');
        if (statusBarUpdateInterval) {
            clearInterval(statusBarUpdateInterval);
            statusBarUpdateInterval = null;
        }
        statusBarItem.text = `DevLogs: Not Tracking`;
        startTime = 0;

        // if (process) process.kill();


        getStats(context);

    });

    context.subscriptions.push(stopCmd);

    const authCmd = vscode.commands.registerCommand('devlog.authenticate', async function () {
        const panel = vscode.window.createWebviewPanel(
            'authenticateUser', // Identifies the type of the webview. Used internally
            'Authenticate User', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                enableScripts: true
            } // Webview options. More on these later.
        );

        var userPath = getPath("user.txt", context)
        const cssFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'web', 'auth.css')
        );

        // Convert the file path to a URI for the webview
        const cssFileUri = panel.webview.asWebviewUri(cssFilePath);

        onAuth(panel, cssFileUri, userPath)

        panel.webview.onDidReceiveMessage(
            message => {
                if (message.command == "onAuth") {

                    let curToken = (message.text)
                    checkUser(panel, userPath, curToken)

                }
            },
            undefined,
            context.subscriptions
        );

    });

    context.subscriptions.push(authCmd);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}