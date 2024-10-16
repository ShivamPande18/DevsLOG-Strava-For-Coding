const vscode = require('vscode');
const child = require("child_process");
const { parse } = require("csv-parse");

const fs = require('fs');


/**
 * @param {vscode.ExtensionContext} context
 */

//Macro Count
let word_count = 0;
let line_count = 0;

//Micro Counts
let char_count = 0;
let letter_count = 0;
let number_count = 0;

//Key Counts
let backspace_count = 0;
let space_count = 0;
let enter_count = 0;
let tab_count = 0;

//Symbol Counts
let semicolon_count = 0;
let paranthesis_count = 0;

//Project Related Counts
let file_counts = 0;
let langHash = new Map()
let langs = [...Array(6)].fill("");

//Time Related Stats
let startTime;
let sessionTime;


function activate(context) {
    console.log('Congratulations, your extension "devlog" is now active!');
    let process = null;
    const disposable = vscode.commands.registerCommand('devlog.helloWorld', function () {
        vscode.window.showInformationMessage('Hello World from devlog!');
    });

    context.subscriptions.push(disposable);

    const disposable2 = vscode.commands.registerCommand('devlog.start', function () {
        // onUser();
        console.log("Session starts")
        vscode.window.showInformationMessage('Session Started');
        startTime = Date.now();
        process = child.spawn('python', ["C:/Drive/DevLog/devlog/cp.py"])
    });

    context.subscriptions.push(disposable2);

    const disposable3 = vscode.commands.registerCommand('devlog.stop', function () {
        const panel = vscode.window.createWebviewPanel(
            'Session Sumary', // Identifies the type of the webview. Used internally
            'Session Summary', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                enableScripts: true
            } // Webview options. More on these later.
        );

        // panel.webview.html = gg(panel.webview);
        // panel.webview.html = webViewHtml();
        console.log("Session Stops")
        vscode.window.showInformationMessage('Session Ends');
        if (process) process.kill();
        getStats()
    });

    context.subscriptions.push(disposable3);

    const disposable4 = vscode.commands.registerCommand('devlog.test', function () {
        // getUser();
    });

    context.subscriptions.push(disposable4);

    const disposable5 = vscode.commands.registerCommand('devlog.authenticate', function () {
        vscode.window.showInformationMessage('Feature Yet To Added');
    });

    // const disposable5 = vscode.commands.registerCommand('devlog.authenticate', function () {
    //     const panel = vscode.window.createWebviewPanel(
    //         'authenticateUser', // Identifies the type of the webview. Used internally
    //         'Authenticate User', // Title of the panel displayed to the user
    //         vscode.ViewColumn.One, // Editor column to show the new webview panel in.
    //         {
    //             enableScripts: true
    //         } // Webview options. More on these later.
    //     );

    //     panel.webview.html = getAuthHtml();

    //     panel.webview.onDidReceiveMessage(
    //         message => {
    //             if (message.command == "onAuth") {
    //                 onAuth(panel)
    //             }
    //         },
    //         undefined,
    //         context.subscriptions
    //     );

    // });

    context.subscriptions.push(disposable5);
}



function getDisplayTime(ms) {
    var seconds = ms / 1000;
    // 2- Extract hours:
    var hours = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    var minutes = Math.floor(seconds / 60); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    return (Math.floor(hours) + ":" + Math.floor(minutes) + ":" + Math.floor(seconds));
}

function webViewHtml() {
    return `
	<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet" />

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background-color: black;
            font-family: Roboto Mono;
            margin: 10px;
            color: white;
        }

        section {
            width: 100vw;
            height: 30vh;
        }

        .sec1 {
            margin-left: 20px;
            margin-top: 20px;
            display: df;
        }

        .sec1 h1 {
            color: #e7f216;
            font-size: 2.5rem;
            margin-bottom: 30px;
            text-align: center;
        }

        .sec1 p {
            margin-top: 10px;
            font-weight: bold;
            font-size: 1.5rem;
        }

        .sec1cont {
            display: grid;
            grid-template-columns: 1fr 1fr;
        }

        .sec1right {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .sec1right h2 {
            font-size: 3rem;
        }

        .sec1right h3 {
            color: #e7f216;
        }

        .sec3 {
            margin-top: 50px;
        }

        .sec3 h1 {
            color: #e7f216;
            font-size: 2.5rem;
            margin-bottom: 30px;
            margin-left: 10px;
        }

        .langCont {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-inline: 20px;
        }

        .lang {
            font-size: 1.5rem;
            font-weight: bold;
            margin-top: 10px;
        }
    </style>

</head>

<body>
    <section class="sec1">
        <h1>Session Stats</h1>
        <dev class="sec1cont">
            <div class="sec1left">
                <p>Total Words Typed: ${word_count}</p>
                <p>Total Files Changed: ${file_counts}</p>
                <p>Total Backspaces: ${backspace_count}</p>
                <p>Total SemiColons Used: ${semicolon_count}</p>
                <p>Total Parenthesis Used: ${paranthesis_count}</p>
            </div>
            <div class="sec1right">
                <h2>${getDisplayTime(sessionTime)}</h2>
                <h3>session time</h3>
            </div>
        </dev>


    </section>

    <section class="sec3">
        <h1>Most Used Languages</h1>
        <div class="langCont">
            <div class="lang">${langs[0]}</div>
            <div class="lang">${langs[1]}</div>
            <div class="lang">${langs[2]}</div>
            <div class="lang">${langs[3]}</div>
            <div class="lang">${langs[4]}</div>
            <div class="lang">${langs[5]}</div>
        </div>
    </section>

    <script>
        let lang = document.getElementsByClassName("lang")

		// for(let j=0;j<6;j++){
		// 	langs[j].innerHTML = "js"
		// }





    </script>
</body>

</html>
	`
}

function gg(webview) {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Session Summary</title>
	<link rel="stylesheet" href=${webview.asWebviewUri("./style.css")} />
</head>

<body>
    <button onclick="download()">Save</button>
    <script>
		const width = window.innerWidth;
		const height = window.innerHeight;
		const ratio = window.devicePixelRatio;
        var canvas = document.getElementById("myCanvas");
		canvas.width = width * ratio;
		canvas.height = height * ratio;
		canvas.style.width = width + "px"
		canvas.style.height = height + "px"
        var ctx = canvas.getContext("2d");

		ctx.scale(ratio, ratio);

        // Fill with gradient
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.font = "50px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("Session Summary",canvas.width/2,100);
		
		ctx.font = "20px Arial";
		ctx.fillStyle = "#e7f216";
		ctx.textAlign = "center";
		ctx.fillText("Shivam Pande Stats",canvas.width/2,150)

		ctx.font = "20px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("Word Count = 35",canvas.width/2,200)

		ctx.font = "20px Arial";
		ctx.fillStyle = "#00ffff";
		ctx.textAlign = "center";
		ctx.fillText("Icons",canvas.width/2,250)

		ctx.font = "20px Arial";
		ctx.fillStyle = "#fb8c00";
		ctx.textAlign = "center";
		ctx.fillText("Streak",canvas.width/2,300)

		ctx.beginPath();
		ctx.arc(95, 50, 40, 0, 2 * Math.PI);
		ctx.lineWidth = 4;
		ctx.strokeStyle = "#fb8c00";
		ctx.stroke();

        function download() {
            var link = document.createElement('a');
            link.download = 'filename.png';
            link.href = document.getElementById('myCanvas').toDataURL()
            link.click();
        }
    </script>
</body>

</html>
	`
}


function getWebviewContent() {
    return `
<!doctype html>
<html>

<head>
    <title>Desktop - 1</title>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="./style.css" />
    <link rel="stylesheet" href="./animation.css" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet" />

    <style>
        /*
  Note: These are temporary previews of the images.
  They're active for 10-15 days only. You should replace them with the actual images before using the code in production.
*/
        :root {
            --image-0: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAA+CAYAAABUbymsAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQ/SURBVHgB1ZpbchNHFIb/07qYtyhVcS5P0Q6wVxB5BYEVxHlIlQMP2CuIvQKLh8Sp4sHyCoAVoB0AK2B4AwyFeAIk3IfTLcnWZS7d0z1G+qpc0sx0jX6fObfuHkIAfGfzHkCH8rUlRz3o0RH9P0hwDRBKwnubu1B0unB6AKYjOnndRcUolEXR7ylnWyA+lidxynutNiqkvHDGh+yLJE+j+YT/2txCRQQI172CEW006Cnf+fEfVEBpHzeIqPewgVk0kLvYkMDtDgaIRHmLW/jMaRjRPobNpzH9Pky45kceo9vW7yOJD3IVg7O7XDHAiHfowfkzBBDoKjDZ5TH8aNmgvbv5BwIIFw5dznJMvRDxMSxe/pEb8X//tI8SRLB4PUEIptKWsHxwcBokQBmhEO/Sv+du6RVRLB4Jpq5Pi5BpcVuqiTv2YIiDrPTFez9LftYvEIcB9HDbpTVOtbj43LF8HIoVOvbPpK9Ma3xpIx4tW6T2W4V1YUm4rWxMy5Fep/RmSVFQPk6hjc/N06JByxZXjXSBhFuLVh+Xb2lhY2N+qyBN0pIQ1czz10R8cMf4IO/90IFSD+FX7v3QWn7rbT/t0rxwmbk4WtC0p9UJviJBU4I1pR2+dBXPx34dog3i7+muO+PjjQ5WEenl0zLalfAa3cOqUsfx4inr4w5B+e1ZCNSxxal+C6sOzdeRsfD0NZLVgqhjU/CEsXBT1teBGaur2f9i5TFWn/QxSsKzstWmSvi8sWs+RDi1sVZoG4/G4jexThBtGXdREphtrBctfKpvKVxf3xEPqq2rcL65OpNlHzS+X0/hNf7OCI+2Zn2drLXwoOVeB3ryd4TIiHB+ieqQybU6ov/eHNrvsWBKlERohRZn2bB9ldivWv+JeLwUi9f6qAax9HlvemBnL8x9xEDrvppYJEFMiPsT95iHOY6v3/jybJrHnZd3HUjQGN1OuzCZM4ZlMWMUWWcZCxfTIxZa7RTsZ95HCDw2shUe0f96l8GYRXMY8oKCrGyN7BblVcmP4X9aF7qcfRrljdSfPs1L4TGsnrVAuTwQz+GPrQnTg/kmK8zqifPIcrXjbNYN54QHWZ04cR6rRr7Ck8X0utzWcs1UuGobL33D7/6SqRZPLQm3j4Mv/Muz19zVY9+I6SAtU6VOJOjknaQc9s23HlNAajsOzHy/K3MGJH3Gvqe/t/juL786jayheMNLCk1q2zAhf+q2YUu3eyDpi+2iIXb/tGit0og+ebObNyRXuE32zaEJDDfx0w3dLD3jdcpD5A4qFm0onCxfimc4vA1Ev+VeVlSwDs/3XUTbW7kMMuLlhsZtigrUlrOfL2Kyh4krR7yWJ2ywsD5AXp5vfMx+HzH9Ha7EbpN4vh3qva5CJ2+7UhC2MzJOL6+lHVfmi9vSq5iYGZje2rbBrj3O7L0QgH2/1uzWsc3hZ6ZljfluYR5fAT2+ppLHU5kvAAAAAElFTkSuQmCC);
            --custom-width: 100vw;
            --design-width: 1440;
            --ratio: calc(var(--custom-width) / var(--design-width));
        }

        /* Default classes */
        .pos-abs {
            position: absolute;
        }

        .fill-parent {
            width: 100%;
            height: 100%;
        }

        .bg-contain {
            background-size: contain;
        }

        .bg-cover {
            background-size: cover;
        }

        .bg-auto {
            background-size: auto;
        }

        .bg-crop {
            background-size: 100% 100%;
        }

        .bg-no-repeat {
            background-repeat: no-repeat;
        }

        .pos-init {
            top: 0px;
            left: 0px;
        }

        .image-div {
            background-color: transparent;
            background-position: center;
        }

        /* Default classes end */
        body {
            margin: 0px 0px;
            padding: 0px;
        }

        .parent-div {
            position: relative;
            width: var(--custom-width);
            height: calc(1800 * var(--ratio));
            overflow: hidden;
            margin: auto;
            padding: 0px;
            box-sizing: border-box;
        }

        .desktop--1-12 {
            width: 100%;
            height: 100%;
            top: 0%;
            left: 0%;
            opacity: 1;
            z-index: 1;
            transform: rotate(0deg);
            overflow: hidden;
            background: #000000ff;
        }

        .sec1-386 {
            width: 100%;
            height: 33.33%;
            top: 0%;
            left: 0%;
            opacity: 1;
            z-index: 0;
            transform: rotate(0deg);
        }

        .rectangle-1-317,
        .rectangle-11-1015 {
            width: 100%;
            height: 100%;
            top: 0%;
            left: 0%;
            opacity: 1;
            z-index: 0;
            transform: rotate(0deg);
            background: #000000ff;
        }

        .shivam-pandes-s-3104 {
            width: 87.71%;
            height: 9.33%;
            top: 8.17%;
            left: 4.17%;
            opacity: 1;
            z-index: 1;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .shivam-pandes-s-3104-0,
        .most-used-langu-22-0 {
            font-size: calc(60 * var(--ratio));

            line-height: calc(60 * var(--ratio));

            font-family: Roboto Mono;
            font-weight: 700;

            text-decoration: none;
            text-transform: none;
            white-space: pre-wrap;
            color: #e7f216ff;
        }

        .ellipse-1-382 {
            width: 22.08%;
            height: 53%;
            top: 29.17%;
            left: 66.11%;
            opacity: 1;
            z-index: 7;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #c1cb12ff;
        }

        .total-words-typ-34 {
            width: 39.38%;
            height: 6.67%;
            top: 31.17%;
            left: 6.88%;
            opacity: 1;
            z-index: 2;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .total-words-typ-34-0,
        .total-files-cha-313-0,
        .total-backspace-314-0,
        .total-semicolon-315-0,
        .total-parenthes-316-0,
        .c-488-6112-0,
        .javascript-248-7115-0,
        .c-4337-6113-0,
        .objectivec-138-7116-0,
        .shaderlab-26-7114-0,
        .asp-113-7117-0 {
            font-size: calc(40 * var(--ratio));

            line-height: calc(40 * var(--ratio));

            font-family: Roboto Mono;
            font-weight: 700;

            text-decoration: none;
            text-transform: none;
            white-space: pre-wrap;
            color: #ffffffff;
        }

        .ellipse-2-383 {
            width: 20.56%;
            height: 49.33%;
            top: 31.17%;
            left: 66.81%;
            opacity: 1;
            z-index: 8;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #000000ff;
        }

        .total-files-cha-313 {
            width: 39.38%;
            height: 6.67%;
            top: 43%;
            left: 6.88%;
            opacity: 1;
            z-index: 3;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .c-12535-384 {
            width: 22.08%;
            height: 11%;
            top: 50.17%;
            left: 66.11%;
            opacity: 1;
            z-index: 9;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .c-12535-384-0 {
            font-size: calc(50 * var(--ratio));

            line-height: calc(50 * var(--ratio));

            font-family: Roboto Mono;
            font-weight: 700;

            text-decoration: none;
            text-transform: none;
            white-space: pre-wrap;
            color: #ffffffff;
        }

        .total-backspace-314 {
            width: 39.38%;
            height: 6.67%;
            top: 54.83%;
            left: 6.88%;
            opacity: 1;
            z-index: 4;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .total-semicolon-315 {
            width: 47.22%;
            height: 6.67%;
            top: 66.67%;
            left: 6.88%;
            opacity: 1;
            z-index: 5;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .total-parenthes-316 {
            width: 45.42%;
            height: 6.67%;
            top: 78.5%;
            left: 6.88%;
            opacity: 1;
            z-index: 6;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .sec2-3102 {
            width: 100.28%;
            height: 33.33%;
            top: 33.33%;
            left: 0%;
            opacity: 1;
            z-index: 1;
            transform: rotate(0deg);
        }

        .rectangle-2-318 {
            width: 99.72%;
            height: 100%;
            top: 0%;
            left: 0%;
            opacity: 1;
            z-index: 0;
            transform: rotate(0deg);
            background: #000000ff;
        }

        .streak-394 {
            width: 17.4%;
            height: 41.88%;
            top: 19.33%;
            left: 41.14%;
            opacity: 1;
            z-index: 10;
            transform: rotate(0deg);
        }

        .ellipse-3-392 {
            width: 100%;
            height: 100%;
            top: 0%;
            left: 0%;
            opacity: 1;
            z-index: 0;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #ff6a16ff;
        }

        .ellipse-4-393 {
            width: 90.33%;
            height: 90.33%;
            top: 4.78%;
            left: 5.17%;
            opacity: 1;
            z-index: 1;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #000000ff;
        }

        .c-300-389 {
            width: 13.5%;
            height: 22%;
            top: 29.5%;
            left: 9.35%;
            opacity: 1;
            z-index: 3;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .c-300-389-0,
        .c-5-396-0,
        .c-10-399-0 {
            font-size: calc(100 * var(--ratio));

            line-height: calc(100 * var(--ratio));

            font-family: Roboto Mono;
            font-weight: 700;

            text-decoration: none;
            text-transform: none;
            white-space: pre-wrap;
            color: #ffffffff;
        }

        .c-5-396 {
            width: 13.5%;
            height: 22%;
            top: 29.5%;
            left: 43.14%;
            opacity: 1;
            z-index: 11;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .c-10-399 {
            width: 13.5%;
            height: 22%;
            top: 29.5%;
            left: 76.18%;
            opacity: 1;
            z-index: 12;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .total-contribut-390 {
            width: 33.24%;
            height: 7.33%;
            top: 50.67%;
            left: 0%;
            opacity: 1;
            z-index: 4;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .total-contribut-390-0,
        .longest-streak-3100-0 {
            font-size: calc(35 * var(--ratio));

            line-height: calc(35 * var(--ratio));

            font-family: Roboto Mono;
            font-weight: 700;

            text-decoration: none;
            text-transform: none;
            white-space: pre-wrap;
            color: #ffffffff;
        }

        .line-1-385 {
            width: 29.36%;
            height: 0%;
            top: 52%;
            left: 18.56%;
            opacity: 1;
            z-index: 1;
            transform: rotate(90deg);
            box-shadow:
                inset 0 0 0 2.5px #9e9e9eff,
                inset 0 0 2.5px 0 #9e9e9eff,
                inset 0 2.5px 0 0 #9e9e9eff,
                inset 2.5px 0 0 0 #9e9e9eff;
            border-left: 2px solid #9e9e9eff;
            border-right: 2px solid #9e9e9eff;
            border-top: 2px solid #9e9e9eff;
            border-bottom: 2px solid #9e9e9eff;
        }

        .line-2-387 {
            width: 29.36%;
            height: 0%;
            top: 52%;
            left: 51.8%;
            opacity: 1;
            z-index: 2;
            transform: rotate(90deg);
            box-shadow:
                inset 0 0 0 2.5px #9e9e9eff,
                inset 0 0 2.5px 0 #9e9e9eff,
                inset 0 2.5px 0 0 #9e9e9eff,
                inset 2.5px 0 0 0 #9e9e9eff;
            border-left: 2px solid #9e9e9eff;
            border-right: 2px solid #9e9e9eff;
            border-top: 2px solid #9e9e9eff;
            border-bottom: 2px solid #9e9e9eff;
        }

        .longest-streak-3100 {
            width: 33.24%;
            height: 7.33%;
            top: 54.33%;
            left: 66.76%;
            opacity: 1;
            z-index: 5;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .oct-18-2024--pr-391 {
            width: 33.24%;
            height: 7.33%;
            top: 63%;
            left: 0%;
            opacity: 1;
            z-index: 7;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .oct-18-2024--pr-391-0,
        .oct-8-398-0 {
            font-size: calc(28 * var(--ratio));

            line-height: calc(28 * var(--ratio));

            font-family: Roboto Mono;
            font-weight: 400;

            text-decoration: none;
            text-transform: none;
            white-space: pre-wrap;
            color: #9e9e9eff;
        }

        .current-streak-397 {
            width: 33.24%;
            height: 7.33%;
            top: 64.17%;
            left: 33.38%;
            opacity: 1;
            z-index: 6;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .current-streak-397-0 {
            font-size: calc(35 * var(--ratio));

            line-height: calc(35 * var(--ratio));

            font-family: Roboto Mono;
            font-weight: 700;

            text-decoration: none;
            text-transform: none;
            white-space: pre-wrap;
            color: #ff6a16ff;
        }

        .aug-7-2022--aug-3101 {
            width: 33.24%;
            height: 7.33%;
            top: 66.67%;
            left: 66.76%;
            opacity: 1;
            z-index: 8;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .aug-7-2022--aug-3101-0 {
            font-size: calc(27 * var(--ratio));

            line-height: calc(27 * var(--ratio));

            font-family: Roboto Mono;
            font-weight: 400;

            text-decoration: none;
            text-transform: none;
            white-space: pre-wrap;
            color: #9e9e9eff;
        }

        .oct-8-398 {
            width: 33.24%;
            height: 7.33%;
            top: 75.17%;
            left: 33.24%;
            opacity: 1;
            z-index: 9;
            transform: rotate(0deg);
            text-align: center;
            line-height: 0px;
        }

        .icon-fire-104 {
            width: 4.58%;
            height: 4.11%;
            top: 38.06%;
            left: 47.85%;
            opacity: 1;
            z-index: 23;
            transform: rotate(0deg);
        }

        .nodeBg-1012 {
            opacity: 1;
            background-image: var(--image-0);
        }

        .vector-1012 {
            width: 69.4%;
            height: 83.67%;
            top: 1.35%;
            left: 15.15%;
            opacity: 1;
            z-index: 1;
            transform: rotate(0deg);
            overflow: hidden;
        }

        .rectangle-3-388 {
            width: 100%;
            height: 33.33%;
            top: 66.67%;
            left: 0%;
            opacity: 1;
            z-index: 2;
            transform: rotate(0deg);
            background: #000000ff;
        }

        .most-used-langu-22 {
            width: 87.71%;
            height: 3.11%;
            top: 69.67%;
            left: 4.17%;
            opacity: 1;
            z-index: 3;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .rectangle-4-4105 {
            width: 87.08%;
            height: 2.06%;
            top: 78.78%;
            left: 5.63%;
            opacity: 1;
            z-index: 4;
            transform: rotate(0deg);
            background: #d9d9d9ff;
        }

        .rectangle-5-5106 {
            width: 37.99%;
            height: 2.06%;
            top: 78.78%;
            left: 5.63%;
            opacity: 1;
            z-index: 5;
            transform: rotate(0deg);
            background: #178600ff;
        }

        .rectangle-6-5107 {
            width: 35.56%;
            height: 2.06%;
            top: 78.78%;
            left: 43.61%;
            opacity: 1;
            z-index: 6;
            transform: rotate(0deg);
            background: #555555ff;
        }

        .rectangle-7-6108 {
            width: 7.99%;
            height: 2.06%;
            top: 78.78%;
            left: 79.17%;
            opacity: 1;
            z-index: 7;
            transform: rotate(0deg);
            background: #222c37ff;
        }

        .rectangle-8-6109 {
            width: 2.78%;
            height: 2.06%;
            top: 78.78%;
            left: 87.15%;
            opacity: 1;
            z-index: 8;
            transform: rotate(0deg);
            background: #f1e05aff;
        }

        .rectangle-9-6110 {
            width: 1.39%;
            height: 2.06%;
            top: 78.78%;
            left: 89.93%;
            opacity: 1;
            z-index: 9;
            transform: rotate(0deg);
            background: #438effff;
        }

        .rectangle-10-6111 {
            width: 1.39%;
            height: 2.06%;
            top: 78.78%;
            left: 91.32%;
            opacity: 1;
            z-index: 10;
            transform: rotate(0deg);
            background: #6a40fdff;
        }

        .c-488-6112 {
            width: 39.38%;
            height: 2.22%;
            top: 84.83%;
            left: 10.63%;
            opacity: 1;
            z-index: 11;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .javascript-248-7115 {
            width: 39.38%;
            height: 2.22%;
            top: 84.83%;
            left: 60.62%;
            opacity: 1;
            z-index: 12;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .ellipse-5-8118 {
            width: 2.57%;
            height: 2.06%;
            top: 85.39%;
            left: 6.88%;
            opacity: 1;
            z-index: 17;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #178600ff;
        }

        .ellipse-8-8121 {
            width: 2.57%;
            height: 2.06%;
            top: 85.39%;
            left: 56.88%;
            opacity: 1;
            z-index: 18;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #f1e05aff;
        }

        .c-4337-6113 {
            width: 39.38%;
            height: 2.22%;
            top: 88.56%;
            left: 10.63%;
            opacity: 1;
            z-index: 13;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .objectivec-138-7116 {
            width: 39.38%;
            height: 2.22%;
            top: 88.56%;
            left: 60.62%;
            opacity: 1;
            z-index: 14;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .ellipse-6-8119 {
            width: 2.57%;
            height: 2.06%;
            top: 89%;
            left: 6.81%;
            opacity: 1;
            z-index: 19;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #555555ff;
        }

        .ellipse-9-8122 {
            width: 2.57%;
            height: 2.06%;
            top: 89%;
            left: 56.81%;
            opacity: 1;
            z-index: 20;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #438effff;
        }

        .shaderlab-26-7114 {
            width: 39.38%;
            height: 2.22%;
            top: 92.28%;
            left: 10.63%;
            opacity: 1;
            z-index: 15;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .asp-113-7117 {
            width: 39.38%;
            height: 2.22%;
            top: 92.28%;
            left: 60.69%;
            opacity: 1;
            z-index: 16;
            transform: rotate(0deg);
            text-align: left;
            line-height: 0px;
        }

        .ellipse-7-8120 {
            width: 2.57%;
            height: 2.06%;
            top: 92.61%;
            left: 6.81%;
            opacity: 1;
            z-index: 21;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #222c37ff;
        }

        .ellipse-10-8123 {
            width: 2.57%;
            height: 2.06%;
            top: 92.61%;
            left: 56.81%;
            opacity: 1;
            z-index: 22;
            transform: rotate(0deg);
            border-radius: 50%;
            background: #6a40fdff;
        }
    </style>

</head>

<body>
    <div class="parent-div">
        <div class="desktop--1-12 pos-abs">
            <!-- Sec11 -->
            <section class="sec1-386 pos-abs">
                <div class="rectangle-1-317 pos-abs"></div>
                <div class="shivam-pandes-s-3104 pos-abs">
                    <!-- prettier-ignore --><span class="shivam-pandes-s-3104-0 ">Shivam Pande’s Session Stats</span>
                </div>
                <div class="ellipse-1-382 pos-abs"></div>
                <div class="total-words-typ-34 pos-abs">
                    <!-- prettier-ignore --><span class="total-words-typ-34-0 ">Total Words Typed: ${word_count}</span>
                </div>
                <div class="ellipse-2-383 pos-abs"></div>
                <div class="total-files-cha-313 pos-abs">
                    <!-- prettier-ignore --><span class="total-files-cha-313-0 ">Total Files Changed: ${file_counts}</span>
                </div>
                <div class="c-12535-384 pos-abs">
                    <!-- prettier-ignore --><span class="c-12535-384-0 ">${getDisplayTime(12732953)}</span>
                </div>
                <div class="total-backspace-314 pos-abs">
                    <!-- prettier-ignore --><span class="total-backspace-314-0 ">Total Backspaces: ${backspace_count}</span>
                </div>
                <div class="total-semicolon-315 pos-abs">
                    <!-- prettier-ignore --><span class="total-semicolon-315-0 ">Total SemiColons Used: ${semicolon_count}</span>
                </div>
                <div class="total-parenthes-316 pos-abs">
                    <!-- prettier-ignore --><span class="total-parenthes-316-0 ">Total Parenthesis Used: ${paranthesis_count}</span>
                </div>
            </section>
            <!-- Sec21 -->
            <section class="sec2-3102 pos-abs">
                <div class="rectangle-2-318 pos-abs"></div>
                <div class="streak-394 pos-abs">
                    <div class="ellipse-3-392 pos-abs"></div>
                    <div class="ellipse-4-393 pos-abs"></div>
                </div>
                <div class="c-300-389 pos-abs">
                    <!-- prettier-ignore --><span class="c-300-389-0 ">300</span>
                </div>
                <div class="c-5-396 pos-abs">
                    <!-- prettier-ignore --><span class="c-5-396-0 ">5</span>
                </div>
                <div class="c-10-399 pos-abs">
                    <!-- prettier-ignore --><span class="c-10-399-0 ">10</span>
                </div>
                <div class="total-contribut-390 pos-abs">
                    <!-- prettier-ignore --><span class="total-contribut-390-0 ">Total Contributions</span>
                </div>
                <div class="line-1-385 pos-abs"></div>
                <div class="line-2-387 pos-abs"></div>
                <div class="longest-streak-3100 pos-abs">
                    <!-- prettier-ignore --><span class="longest-streak-3100-0 ">Longest Streak</span>
                </div>
                <div class="oct-18-2024--pr-391 pos-abs">
                    <!-- prettier-ignore --><span class="oct-18-2024--pr-391-0 ">Oct 18, 2024 - Present</span>
                </div>
                <div class="current-streak-397 pos-abs">
                    <!-- prettier-ignore --><span class="current-streak-397-0 ">Current Streak</span>
                </div>
                <div class="aug-7-2022--aug-3101 pos-abs">
                    <!-- prettier-ignore --><span class="aug-7-2022--aug-3101-0 ">Aug 7, 2022 - Aug 11, 2022</span>
                </div>
                <div class="oct-8-398 pos-abs">
                    <!-- prettier-ignore --><span class="oct-8-398-0 ">Oct 8</span>
                </div>
            </section>
            <!-- 🦆 icon "fire"1 -->
            <section class="icon-fire-104 pos-abs">
                <div class="rectangle-11-1015 pos-abs"></div>
                <div class="vector-1012 pos-abs">
                    <div class="nodeBg-1012 pos-abs pos-init fill-parent image-div bg-contain bg-no-repeat"></div>
                </div>
            </section>
            <div class="rectangle-3-388 pos-abs"></div>
            <div class="most-used-langu-22 pos-abs">
                <!-- prettier-ignore --><span class="most-used-langu-22-0 ">Most Used Languages</span>
            </div>
            <div class="rectangle-4-4105 pos-abs"></div>
            <div class="rectangle-5-5106 pos-abs"></div>
            <div class="rectangle-6-5107 pos-abs"></div>
            <div class="rectangle-7-6108 pos-abs"></div>
            <div class="rectangle-8-6109 pos-abs"></div>
            <div class="rectangle-9-6110 pos-abs"></div>
            <div class="rectangle-10-6111 pos-abs"></div>
            <div class="c-488-6112 pos-abs">
                <!-- prettier-ignore --><span class="c-488-6112-0 ">C# 48.8%</span>
            </div>
            <div class="javascript-248-7115 pos-abs">
                <!-- prettier-ignore --><span class="javascript-248-7115-0 ">JavaScript 2.48%</span>
            </div>
            <div class="ellipse-5-8118 pos-abs"></div>
            <div class="ellipse-8-8121 pos-abs"></div>
            <div class="c-4337-6113 pos-abs">
                <!-- prettier-ignore --><span class="c-4337-6113-0 ">C 43.37%</span>
            </div>
            <div class="objectivec-138-7116 pos-abs">
                <!-- prettier-ignore --><span class="objectivec-138-7116-0 ">Objective-C 1.38%</span>
            </div>
            <div class="ellipse-6-8119 pos-abs"></div>
            <div class="ellipse-9-8122 pos-abs"></div>
            <div class="shaderlab-26-7114 pos-abs">
                <!-- prettier-ignore --><span class="shaderlab-26-7114-0 ">ShaderLab 2.6#%</span>
            </div>
            <div class="asp-113-7117 pos-abs">
                <!-- prettier-ignore --><span class="asp-113-7117-0 ">ASP 1.13%</span>
            </div>
            <div class="ellipse-7-8120 pos-abs"></div>
            <div class="ellipse-10-8123 pos-abs"></div>
        </div>
    </div>
    <script src="scripts.js"></script>
</body>

</html>
`;
}

function getStats() {


    let fileHash = new Map()
    let cmdCnt = 0;
    sessionTime = Date.now() - startTime;
    console.log("time  ===== " + sessionTime)
    let curFile = ""
    const path = "C:/Drive/DevLog/devlog/log.csv";
    fs.createReadStream(path)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
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
                    // case "lparan":
                    // case "rparan":
                    //     paranthesis_count++;
                    //     char_count++;
                    //     break;
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
            // executed when parsing is complete
            console.log("File read successful");

            langHash.forEach((val, key) => {
                langHash.set(key, (val / cmdCnt) * 100)
            })

            let i = 0;
            let sortedLangHash = Array.from(langHash).sort((a, b) => b[1] - a[1]);

            console.log("Ans = " + sortedLangHash)
            for (let i = 0; i < Math.min(6, sortedLangHash.length); i++) {
                // console.log("data  =" + sortedLangHash[i]);
                langs[i] = sortedLangHash[i][0] + " " + parseFloat(sortedLangHash[i][1]).toFixed(2) + "%"
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

            panel.webview.html = webViewHtml();
        });

}


function getAuthHtml() {
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authenticate</title>
</head>

<body>
    <button id = "myBtn">Auth</button>
    <script>
        document.getElementById("myBtn").addEventListener("click", function(){
        const vscode = acquireVsCodeApi();
        vscode.postMessage({
                    command: 'onAuth',
                    text: 'hello'
                })
        });
    </script>

</body>

</html>
    `
}

function setUser(panel) {
    const path = "C:/Drive/DevLog/devlog/user.txt";
    fs.writeFile(path, "shivampande", function write(err) {
        if (err) {
            return console.error(err);
        }
        vscode.window.showInformationMessage('User Set');
        panel.dispose();
    })
}

async function onAuth(panel) {
    const path = "C:/Drive/DevLog/devlog/user.txt";
    fs.readFile(path, function read(err, data) {
        if (err) {
            throw err;
        }
        if (data.toString() == "") {
            setUser(panel)
            // vscode.window.showInformationMessage('Useras Authenticated');
        }
        else {
            vscode.window.showInformationMessage('User Authenticated');
            panel.dispose();
        }
    });
}



// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}
