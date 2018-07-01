const fileSystem = require("./files");
const File = fileSystem.File;
const Folder = fileSystem.Folder;
const handlePath = fileSystem.handlePath;

var commands = module.exports = {};
commands.mkdir = function(args,currentFolder) {
    var name = args[1];
    if (name == ".." || name == "." || currentFolder.children[name]) {
        return "mkdir: cannot create folder '" + name + "': File exists";
    }
    new Folder(args[1], currentFolder);
    return currentFolder;
};
commands.rm = function(args,currentFolder) {
    var name = args[1];
    var entry = currentFolder.children[name];
    if (entry) {
        delete currentFolder.children[name];
        return currentFolder;
    } else {
        return 'rm: cannot remove \'' + name + '\': No such file or folder';
    }
}
commands.cd = function(args,currentFolder) {
    return handlePath(args[1], currentFolder) || 'cd: cannot find \'' + args[1] + '\': No such file or folder';
};
commands.ls = function(args,currentFolder) {
    return currentFolder;
};
commands.touch = function(args,currentFolder) {
    var name = args[1];
    if (!currentFolder.children[name]) {
        new File(name,currentFolder);
    }
    return currentFolder;
};