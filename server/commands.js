const fileSystem = require("./files");
const File = fileSystem.File;
const Folder = fileSystem.Folder;
const handlePath = fileSystem.handlePath;

var commands = module.exports = {};
commands.mkdir = function(args,currentFolder) {
    if (args[1] == ".." || args[1] == ".") {
        return "mkdir: cannot create folder \'' + args[1] + '\': File exists'";
    }
    new Folder(args[1], currentFolder);
    return currentFolder;
};
commands.rm = function(args,currentFolder) {
    var entry = currentFolder.children[args[1]];
    if (entry) {
        delete currentFolder.children[args[1]];
        return currentFolder;
    } else {
        return 'rm: cannot remove \'' + args[1] + '\': No such file or folder';
    }
}
commands.cd = function(args,currentFolder) {
    return handlePath(args[1], currentFolder) || 'cd: cannot find \'' + args[1] + '\': No such file or folder';
};
commands.ls = function(args,currentFolder) {
    return currentFolder;
};