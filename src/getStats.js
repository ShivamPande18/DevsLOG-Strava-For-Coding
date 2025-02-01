const { getNewStatHtml } = require("../files/newStatHtml");

const { parse } = require("csv-parse");
const { getStatHtml } = require('../files/statHtml');
const { getLast30Days, msToHours } = require('./helper');

const fs = require('fs');
const path = require('path');
const vscode = require("vscode")

async function getStats(context, FILE_USER, FILE_LOG, sessionTime, db, fdb) {

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
    let langHash = new Map()
    let projHash = new Map()
    let langs = ["", "", "", "", "", ""];
    let projects = ["", "", "", "", "", ""];



    let cmdCnt = 0;

    let userid = fs.readFileSync(FILE_USER, 'utf8');
    let streak = 0;
    let logs = [];
    let dates = [];
    let sTimes = [];
    let langsDb = [];
    let projsDb = [];
    let curDate = new Date().toLocaleDateString("en-US");
    const userRef = fdb.collection(db, 'users');
    const q = fdb.query(userRef, fdb.where('userId', '==', userid));


    try {
        const querySnapshot = await fdb.getDocs(q);
        querySnapshot.forEach((doc) => {
            streak = doc.data().streak;
            logs = doc.data().logs;
            langsDb = doc.data().langs;
            projsDb = doc.data().projects;
            // curDate = doc.data().lastSeen.toString();
        });
    } catch (error) {
        console.error("Error getting streak:", error);
    }
    console.log("undnahi")
    console.log(langsDb)

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

            let projStruct = row[2].split(" - ")
            if (projStruct.length >= 2) {
                if (!projHash.has(projStruct[projStruct.length - 2])) {
                    projHash.set(projStruct[projStruct.length - 2], 1)
                }
                else {
                    projHash.set(projStruct[projStruct.length - 2], projHash.get(projStruct[projStruct.length - 2]) + 1)
                }
            }


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


            projHash.forEach((val, key) => {
                projHash.set(key, (val / cmdCnt) * 100)
            })





            let i = 0;
            let sortedLangHash = [];
            let sortedProjHash = [];
            sortedLangHash = Array.from(langHash).sort((a, b) => b[1] - a[1]);
            sortedProjHash = Array.from(projHash).sort((a, b) => b[1] - a[1]);


            let newLang = []

            for (let i = 0; i < Math.min(6, sortedLangHash.length); i++) {
                langs[i] = sortedLangHash[i][0] + "-" + parseFloat(sortedLangHash[i][1]).toFixed(2) + "%"
                newLang[i] = sortedLangHash[i][0] + "-" + parseFloat(sortedLangHash[i][1]).toFixed(2)
            }

            for (let i = 0; i < Math.min(6, sortedProjHash.length); i++) {
                projects[i] = sortedProjHash[i][0] + "-" + parseFloat(sortedProjHash[i][1]).toFixed(2) + "%"
            }

            let langsTemp = new Array(6).fill(" ");
            let projsTemp = new Array(6).fill(" ");

            if (langs.filter(lang => lang !== "").length > 3) {
                let remainingSum = 0;
                for (let i = 2; i < langs.length; i++) {
                    if (langs[i] !== "") {
                        remainingSum += parseFloat(langs[i].split("-")[1]);
                    }
                }
                const first = langs[0];
                const second = langs[1];
                langsTemp[0] = first;
                langsTemp[1] = second;
                langsTemp[2] = "Others " + remainingSum.toFixed(2) + "%";
            }


            if (projects.filter(project => project !== "").length > 3) {
                let remainingSum = 0;
                for (let i = 2; i < projects.length; i++) {
                    if (projects[i] !== "") {
                        remainingSum += parseFloat(projects[i].split(" ")[1]);
                    }
                }
                const first = projects[0];
                const second = projects[1];
                projsTemp[0] = first;
                projsTemp[1] = second;
                projsTemp[2] = "Others " + remainingSum.toFixed(2) + "%";
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




            for (let i = 0; i < projects.length; i++) {
                if (projects[i] && projects[i] !== "") {
                    const projParts = projects[i].split("-");
                    const proj = projParts[0];
                    const percentage = parseFloat(projParts[1]);
                    const sTimes = (percentage / 100) * sessionTime;
                    console.log("idharrrrrrrrrrrrr1")
                    // Find if project already exists in projDb
                    let found = false;
                    for (let j = 0; j < projsDb.length; j++) {
                        const dbParts = projsDb[j].split("-");
                        if (dbParts[0] === proj) {
                            // Add hours to existing entry
                            const newTime = parseFloat(dbParts[1]) + sTimes;
                            projsDb[j] = `${proj}-${newTime}`;
                            found = true;
                            break;
                        }
                    }
                    console.log("idharrrrrrrrrrrrr2")

                    if (!found) {
                        // Add new project entry
                        projsDb.push(`${proj}-${sTimes}`);
                    }

                    // Sort projDb by hours in descending order
                    projsDb.sort((a, b) => {
                        const hoursA = parseFloat(a.split("-")[1]);
                        const hoursB = parseFloat(b.split("-")[1]);
                        return hoursB - hoursA;
                    });
                }
            }



            try {
                console.log("heere")
                console.log(projsDb)

                const docRef = fdb.doc(db, 'users', userid);
                fdb.updateDoc(docRef, {
                    logs: combinedLogs,
                    langs: langsDb,
                    productivity: prodScore,
                    projects: projsDb,
                });
            } catch (error) {
                console.log("Error updating logs:", error);
            }

            // langHash.forEach((val, key) => { 
            //     console.log(key + " " + val + "%")
            //     langs[i] = key + " " + val.toFixed(2) + "%"
            //     i++;
            // })

            const panel = vscode.window.createWebviewPanel(
                'sessionReport', // Identifies the type of the webview. Used internally
                'Session Report', // Title of the panel displayed to the user
                vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
                {
                    enableScripts: true
                } // Webview options. More on these later.
            );

            const cssFilePath = vscode.Uri.file(
                path.join(context.extensionPath, 'web', 'stat.css')
            );
            const cssFileUri = panel.webview.asWebviewUri(cssFilePath);

            // panel.webview.html = getStatHtml(cssFileUri, streak, word_count, line_count, msToHours(sessionTime), result, langsDb);
            panel.webview.html = getNewStatHtml(line_count, msToHours(sessionTime), streak, newLang, prodScore);
        });

}

module.exports = { getStats }