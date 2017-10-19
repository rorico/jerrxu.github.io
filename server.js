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
const fileRoot = fileSystem.fileRoot;
var app = express();

var port = process.env.PORT || 8081,
    ip   = process.env.IP || "0.0.0.0";

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

app.use("/command",function(req,res,next) {
    var svrUrl = url.parse(req.url);
    var query = qs.parse(svrUrl.query);
    var args = query.args.split(",");

    var folder = handlePath(query.folder);

    var command = commands[args[0]];
    if (command) {
        var end = command(args,folder);
        console.log(end===fileRoot)
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
        var file = handlePath(args[0],folder || {});
        res.json(file ? file.exec : "Unrecognized command. Type 'help' for assistance.");
    }
});
app.use(express.static("./"));

app.listen(port);
