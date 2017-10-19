var fileRoot = new Folder("");
var home = new Folder("jerrxu",fileRoot);
new File("resume", home, function() {
    return "Click <a href='resume.pdf'>here</a> to see my resume.<br>" + 
        "<div style='width:100%;height:300px;text-align:center'>" +
        "    <object style='width:70%;height:100%;text-align:center' data='resume.pdf' type='application/pdf'>" +
        "        <p>" +
        "        You don't seem to have a pdf viewer plugin for this browser. Click <a href='resume.pdf'>here</a> to download." +
        "        </p>" +
        "    </object>" +
        "</div>";
});

if (inBack()) {
    exports.Folder = Folder;
    exports.File = File;
    exports.handlePath = handlePath;
    exports.fileRoot = fileRoot;
    exports.home = home;
}

function inBack() {
    return typeof module === "object" && module && typeof module.exports === "object";
}

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
        this.fullPath = (parent.name ? parent.fullPath : "") + "/" + name;
    } else {
        this.fullPath = "/" + name;
    }
    this.exec = exec || function() {
        println(name + " is a file");
    };
}

function handlePath(path,startFolder) {
    //handle both types of slashes
    path = path.replace(/\\/g,"/");
    if (path.startsWith("/")) {
        startFolder = fileRoot;
    }
    //trim side slashes
    path = path.replace(/^\/|\/$/g,"");

    //get path, split into parts
    var parts = path ? path.split("/") : [];
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
