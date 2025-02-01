function getAuthHtml(cssFileUri,) {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devlogs Token</title>
    <link rel="stylesheet" href="${cssFileUri}">
</head>

<body>
    <div class="black-container">
        <div class="container">
            <h1>Join Devlogs</h1>
            <div class="input-group">
                <input type="text" id="tokenInput" placeholder="Enter token name">
                <button id = "myBtn">Submit</button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        document.getElementById("myBtn").addEventListener("click", function(){
        console.log("pandeis emmememememem")
        const token = document.getElementById('tokenInput').value;
        vscode.postMessage({
                command: 'onAuth',
                text: token,
            })
        });
    </script>
</body>

</html>
    `
}

module.exports = { getAuthHtml }