exports.Folder = Folder;
exports.File = File;
exports.handlePath = handlePath;

function Folder(name, parent) {
    File.call(this, name, parent, function() {
        println(name + " is a folder");
    });
    this.children = {};
}
Folder.prototype = new File();

function File(name, parent, exec) {
    this.name = name;
    this.parent = parent;
    if (parent) {
        parent.children[name] = this;
        this.fullPath = parent.fullPath + "/" + name;
    } else {
        this.fullPath = "/" + name;
    }
    this.exec = exec || function() {
        println(name + " is a file");
    };
}

function handlePath(path,startFolder) {
    //not a global command
    //get path, split into parts
    var parts = path.split(/[\/\\]/g);
    var folder = startFolder;
    var good = true;
    for (var i = 0 ; i < parts.length; i++) {
        var name = parts[i];
        if (folder.children[name]) {
            folder = folder.children[name];
        } else {
            good = false;
            break;
        }
    }
    return good ? folder : null;
}