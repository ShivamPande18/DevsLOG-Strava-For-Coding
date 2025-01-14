const { parse } = require("csv-parse");
const { getStatHtml } = require('../statHtml');
const { getLast30Days, msToHours } = require('../helper');

const fs = require('fs');
const path = require('path');
const vscode = require("vscode")
const { fdb, db } = require("./firebaseConfig")

async function getStats(context, FILE_LOG, sessionTime) {

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

    let userid = fs.readFileSync(FILE_LOG, 'utf8');
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
    fs.createReadStream(FILE_LOG)
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

module.exports = { getStats }