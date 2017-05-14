// this doesn't really work on local, probably only changes for js file
var last = new Date(document.lastModified);	
// github has weird bug with date being 2 hours ahead
last.setHours(last.getHours() - 2);
var s = m = h = d = w = 0;		// seconds, minutes, hours, days, weeks
var str;

$(document).ready(function() {
	$(startup());
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

		new Folder("Daniel Chen", currentFolder);
		new Folder("Jerry Xu", currentFolder);
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
		// println("Valid commands:");
		// for (var str in validCommands) {
		// 	println(str);
		// }
	}

	function Folder(name, parent) {
		this.name = name;
		this.parent = parent;
		if (parent) {
			parent.children[name] = this;
			this.fullPath = parent.fullPath + "/" + name;
		} else {
			this.fullPath = "/" + name;
		}
		this.children = {};
	}

	function File(name, parent) {
		this.name = name;
		this.parent = parent;
		if (parent) {
			parent.children[name] = this;
			this.fullPath = parent.fullPath + "/" + name;
		} else {
			this.fullPath = "/" + name;
		}
	}
	function print(str) {
		$("#list").append(str);
	}

	function println(str) {
		print(str + "<br>")
	}

	var fileRoot = new Folder("jerrxu");

	var currentFolder = fileRoot;
	var validCommands = ["cat", "resume", "help", "mkdir", "rm", "cd", "ls", "pwd"]; //this isn't true
	var commands = {};

	commands.cat = function(args) {
		println("You're a kitty!");
	};
	commands.resume = function(args) {
		println("Click <a href='resume.pdf'>here</a> to see my resume.");
	};
	commands.help = function(args) {
		//printHelp();
		println("You're on your own for now :)");
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
	commands.pizza = commands.piazza = function(args) {
		println("Sry I'm working on that.");
	};

	$("#input").keypress(function(event) {
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if (keycode == 13) {
			var ent = $("#input").html();
			println("guest@jerrxu:/$ " + ent);
			if (ent) {
				var args = ent.trim().split(" ");
				var command = commands[args[0]];
				if (command) {
					command(args);
				} else {
					println("Unrecognized command. Type 'help' for assistance.");
				}				
			}
			$("#input").empty("");		// clears textbox
			$("html, body").animate({ scrollTop: $(document).height() }, "slow");
			$("#input").focus();
			event.stopPropagation();
			event.preventDefault();
		}
	});
});
