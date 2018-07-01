const qs = require("querystring");
const url = require("url");
const express = require("express");
const commands = require("./server/commands");
const fileSystem = require("./server/files");
const File = fileSystem.File;
const Folder = fileSystem.Folder;
const handlePath = fileSystem.handlePath;
const fileRoot = fileSystem.fileRoot;
var app = express();

var port = process.env.PORT || 8081,
    ip   = process.env.IP || "0.0.0.0";

app.use("/command",function(req,res,next) {
    var svrUrl = url.parse(req.url);
    var query = qs.parse(svrUrl.query);
    var args = query.args.split(",");

    var folder = handlePath(query.folder);

    var command = commands[args[0]];
    if (command) {
        var end = command(args,folder);
        if (typeof end === "object") {
            //only send file names
            var children = [];
            for (var child in end.children) {
                children.push({
                    type: end.children[child] instanceof Folder ? "folder" : "file",
                    name: child
                });
            }
            res.json({
                type: "folder",
                data: {
                    fullPath: end.fullPath,
                    children: children
                }
            });
        } else {
            res.json(end);
        }
    } else {
        var file = handlePath(args[0],folder || {});
        res.json(file ? file.exec() : "Unrecognized command. Type 'help' for assistance.");
    }
});
app.use("/assets",express.static("./assets"));
app.use("/css",express.static("./css"));
app.use("/fonts",express.static("./fonts"));
app.use(express.static("./server"));

app.listen(port, function() {console.log("started on " + ip + ":" + port)});
