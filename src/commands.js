import { setStartTime } from "./stats"


function CommandStart() {
    // console.log("Session starts")
    // // const logPath = vscode.Uri.joinPath(context.extensionUri, 'log.csv');
    // // display('Session Started');
    setStartTime(Date.now())

    // if (statusBarUpdateInterval) clearInterval(statusBarUpdateInterval);
    // statusBarUpdateInterval = setInterval(updateStatusBarWithElapsedTime, 1000);

    // const path = getPath("cp.py", context)
    // const logPath = getPath("log.csv", context)
    // setStreaks(getPath("user.txt", context));
    // process = child.spawn('python', [path, logPath])
}

module.exports = { CommandStart }