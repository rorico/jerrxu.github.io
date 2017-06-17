// this doesn't really work on local, probably only changes for js file
var last = new Date(document.lastModified);	
// github has weird bug with date being 2 hours ahead
last.setHours(last.getHours() - 2);
var s = m = h = d = w = 0;		// seconds, minutes, hours, days, weeks
var str;

$(document).ready(function() {
	function startup() {
		// convert to seconds
		var t = Math.floor((new Date() - last)/1000);
		w = Math.floor(t/604800);
		t = t%604800;
		d = Math.floor(t/86400);
		t = t%86400;
		h = Math.floor(t/3600);
		t = t%3600;
		m = Math.floor(t/60);
		s = t = t%60;
		count();
		setInterval(count,1000);
		$("#input").focus();

		new File("resume", currentFolder, function() {
			println("Click <a href='resume.pdf'>here</a> to see my resume.");
			$("#list").append(
				"<div style='width:100%;height:300px;text-align:center'>" +
				"    <object style='width:70%;height:100%;text-align:center' data='resume.pdf' type='application/pdf'>" +
				"        <p>" +
				"        You don't seem to have a pdf viewer plugin for this browser. Click <a href='resume.pdf'>here</a> to download." +
				"        </p>" +
				"    </object>" +
				"</div>"
			);
		});
	}

	function count() {
		s++;
		if ( s >= 60 ) { s = 0; m++;
			if ( m == 60 ) { m = 0; h++;
				if ( h == 24 ) { h = 0; d++;
					if ( d == 7 ) { d = 0; w++;
		}}}}
		str = "";
		concatenate(s, " second");
		if (s!=0) {
			str = " and " + str;
		}
		concatenate(m, " minute");
		concatenate(h, " hour");
		concatenate(d, " day");
		concatenate(w, " week");
		document.getElementById("p1").innerHTML = str;	
	}

	function concatenate(t, string) {
		if ( t == 1 ) {
			str = t + string + " " + str;
		} else if ( t > 1 ) {
			str = t + string + "s " + str;
		}
	}
	
	function printHelp() {
		// TODO
		println("Valid commands:");
		for (var str in commands) {
			println(str);
		}
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
			this.fullPath = parent.fullPath + "/" + name;
		} else {
			this.fullPath = "/" + name;
		}
		this.exec = exec;
	}
	function print(str) {
		$("#list").append(str);
	}

	function println(str) {
		print(str + "<br>")
	}

	var fileRoot = new Folder("jerrxu");
	var commandHistory = [];
	var curCommandIndex = 0;

	var currentFolder = fileRoot;
	var commands = {};
	startup();

	commands.clear = function(args) {
		//removing old list of prints
		var parent = document.getElementById("form");
		var element = document.getElementById("list");
		parent.removeChild(element);

		//adding back original empty list
		var freshOne = document.createElement("hi");
		freshOne.setAttribute("id", "list");
		parent.insertBefore(freshOne, parent.firstChild);
	}
	commands.help = function(args) {
		printHelp();
	};
	commands.mkdir = function(args) {
		if (args[1] == ".." || args[1] == ".") {
			println("mkdir: cannot create folder \'' + args[1] + '\': File exists'");
		}
		new Folder(args[1], currentFolder);
	};
	commands.rm = function(args) {
		var entry = currentFolder.children[args[1]];
		if (entry) {
			delete currentFolder.children[args[1]];
		} else {
			println('rm: cannot remove \'' + args[1] + '\': No such file or folder');
		}
	}
	commands.cd = function(args) {
		if (args[1] == "..") {
			if (currentFolder.parent) {
				currentFolder = currentFolder.parent;
			}
			return;
		}
		var folder = currentFolder.children[args[1]];
		if (folder) {
			currentFolder = folder;
		} else {
			println('cd: cannot find \'' + args[1] + '\': No such file or folder');
		}
	};
	commands.ls = function(args) {
		for (var file in currentFolder.children) {
			// &nbsp; is space
			println("&nbsp;" + file);
		}
	};
	commands.pwd = function(args) {
		println(currentFolder.fullPath);
	};
	commands.pizza = function(args) {
		println("Piazza!");
	};
	
	commands.piazza = function(args) {
		println("Pizza!");
	};
	commands.cat = function(args) {
		println("You're a kitty!");
	};

	$("#input").keypress(function(event) {
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if (keycode == 13) {
			// enter key
			var ent = $("#input").html();
			commandHistory.push(ent);
			curCommandIndex = commandHistory.length;
			println("guest@jerrxu:/$ " + ent);
			if (ent) {
				var args = ent.trim().split(" ");
				var command = commands[args[0]];
				if (command) {
					command(args);
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
								f.exec();
							}
							//donno what default should be
						} else {
							println("Unrecognized command. Type 'help' for assistance.");
						}
					} else {
						println("No folder " + name);
					}
				}
			}
			$("#input").empty();		// clears textbox
			$("html, body").animate({ scrollTop: $(document).height() }, "slow");
			$("#input").focus();
			event.stopPropagation();
			event.preventDefault();
		}
	}).keydown(function(event) {
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if (keycode == 38) {
			//up key
			if (curCommandIndex > 0) {
				curCommandIndex--;
				changeInput();
			}
		} else if (keycode == 40) {
			//down key
			if (curCommandIndex < commandHistory.length) {
				curCommandIndex++;
				changeInput();
			}
		} else if (keycode == 9) {
			//tab key
			//autocomplete
			event.stopPropagation();
			event.preventDefault();
			var input = $("#input");
			var current = input.html();
			if (!current) {
				return;
			}
			var parts = current.split(" ");
			var last = parts[parts.length - 1];
			var possible = [];
			check(currentFolder.children);
			check(commands);
			if (possible.length > 1) {
				println("guest@jerrxu:/$ " + current);
				println("&nbsp;" + possible.join("    "));
				$("html, body").animate({ scrollTop: $(document).height() }, "slow");
				$("#input").focus();
			} else if (possible.length) {
				//append to the end
				current += possible[0].substr(last.length);
				input.html(current);
				placeCaretAtEnd(input[0]);
			}

			function check(list) {
				for (var cmd in list) {
					if (cmd.startsWith(last)) {
						possible.push(cmd);
					}
				}
			}
		}

		function changeInput() {
			var input = $("#input").html(commandHistory[curCommandIndex] || "");
			placeCaretAtEnd(input[0]);
			event.stopPropagation();
			event.preventDefault();
		}

		//from http://stackoverflow.com/a/4238971
		function placeCaretAtEnd(el) {
			el.focus();
			if (typeof window.getSelection != "undefined"
					&& typeof document.createRange != "undefined") {
				var range = document.createRange();
				range.selectNodeContents(el);
				range.collapse(false);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			} else if (typeof document.body.createTextRange != "undefined") {
				var textRange = document.body.createTextRange();
				textRange.moveToElementText(el);
				textRange.collapse(false);
				textRange.select();
			}
		}
	});
});
