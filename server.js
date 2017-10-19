const http = require("http");
const qs = require("querystring");
const url = require("url");
const fs = require("fs");
const path = require("path");
const express = require("express");
const commands = require("./commands");
const fileSystem = require("./files");
const File = fileSystem.File;
const Folder = fileSystem.Folder;
const handlePath = fileSystem.handlePath;
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
        var file = handlePath(args[0],currentFolder || {});
        res.json(file ? file.exec : "Unrecognized command. Type 'help' for assistance.");
    }
});
app.use(express.static("./"));

app.listen(port);
