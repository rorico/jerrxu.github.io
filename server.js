const http = require("http");
const qs = require("querystring");
const url = require("url");
const fs = require("fs");
const path = require("path");
const express = require("express");
var app = express();

var port = process.env.PORT || 8081,
    ip   = process.env.IP || "0.0.0.0";

var fileRoot = new Folder("jerrxu");
new File("resume", fileRoot, function() {
    return "Click <a href='resume.pdf'>here</a> to see my resume.<br>" + 
        "<div style='width:100%;height:300px;text-align:center'>" +
        "    <object style='width:70%;height:100%;text-align:center' data='resume.pdf' type='application/pdf'>" +
        "        <p>" +
        "        You don't seem to have a pdf viewer plugin for this browser. Click <a href='resume.pdf'>here</a> to download." +
        "        </p>" +
        "    </object>" +
        "</div>";
});
var commands = {};
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
    if (args[1] == "..") {
        if (currentFolder.parent) {
            currentFolder = currentFolder.parent;
        }
        return currentFolder;
    }
    var folder = currentFolder.children[args[1]];
    if (folder) {
        currentFolder = folder;
        return currentFolder;
    } else {
        return 'cd: cannot find \'' + args[1] + '\': No such file or folder';
    }
};
commands.ls = function(args,currentFolder) {
    return currentFolder;
};

app.use("/command",function(req,res,next) {
    var svrUrl = url.parse(req.url);
    var query = qs.parse(svrUrl.query);
    var args = query.args.split(",");

    var folder = query.folder;
    // TODO: change to not have to always have this folder
    if (folder.startsWith("/jerrxu")) {
        var folders = folder.split("/");
        var currentFolder = fileRoot;
        for (var i = 2 ; i < folders.length ; i++) {
            if (currentFolder.children[folders[i]]) {
                currentFolder = currentFolder.children[folders[i]];
            } else {
                res.json("what now");
                return;
            }
        }
    } else {
        res.json("what now");
    }

    var command = commands[args[0]];
    if (command) {
        var end = command(args,currentFolder);
        if (typeof end === "object") {
            //only send file names
            var children = [];
            for (var child in end.children) {
                children.push(child);
            }
            res.json({
                fullPath: end.fullPath,
                children: children
            });
        } else {
            res.json(end);
        }
    } else {
        //not a global command
        //get path, split into parts
        var parts = args[0].split(/[\/\\]/g);
        var folder = currentFolder;
        var good = true;
        for (var i = 0 ; i < parts.length - 1; i++) {
            var name = parts[i];
            if (folder.children[name]) {
                folder = folder.children[name];
            } else {
                good = false;
                break;
            }
        }
        if (good) {
            var file = parts[parts.length - 1];
            var f = folder.children[file];
            if (f) {
                if (typeof f.exec === "function") {
                    res.json(f.exec());
                }
                //donno what default should be
            } else {
                res.json("Unrecognized command. Type 'help' for assistance.");
            }
        } else {
            res.json("No folder " + name);
        }
    }
});
app.use(express.static("./"));

app.listen(port);


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
    this.exec = exec;
}