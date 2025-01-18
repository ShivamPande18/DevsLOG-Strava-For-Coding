let extensionPath;

function setExtensionPath(path) {
    extensionPath = path;
}

function getExtensionPath() {
    return extensionPath;
}

module.exports = { setExtensionPath, getExtensionPath }