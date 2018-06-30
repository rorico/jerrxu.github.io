class File {
    constructor(name, parent, exec) {
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
}

class Folder extends File {
    constructor(name, parent) {
        super(name, parent, function() {
            println(name + " is a folder");
        });
        this.children = {};
    }
}

var fileRoot = new Folder("");
var home = new Folder("jerrxu",fileRoot);
new File("resume", home, function() {
    return "Click <a href='assets/resume.pdf'>here</a> to see my resume.<br>" + 
        "<div style='width:100%;height:300px;text-align:center'>" +
        "    <object style='width:70%;height:100%;text-align:center' data='assets/resume.pdf' type='application/pdf'>" +
        "        <p>" +
        "        You don't seem to have a pdf viewer plugin for this browser. Click <a href='assets/resume.pdf'>here</a> to download." +
        "        </p>" +
        "    </object>" +
        "</div>";
});
new File("github", home, function() {
    return {
        type: "link",
        data: "https://github.com/jerrxu"
    };
});
var rorico = new Folder("rorico",fileRoot);
new File("github", rorico, function() {
    return {
        type: "link",
        data: "https://github.com/rorico"
    };
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
    for (var i = 0 ; i < parts.length; i++) {
        if (!(folder instanceof Folder)) {
            return undefined;
        }
        var name = parts[i];
        if (name === "..") {
            folder = folder.parent;
        } else if (name === ".") {
            //stay the same
        } else {
            folder = folder.children[name];
        }
    }
    // this can be a file
    return folder;
}