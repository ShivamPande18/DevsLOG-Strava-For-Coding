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

module.exports = { getStartHtml }