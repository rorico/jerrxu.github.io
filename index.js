var last = 1487648594;			// alert("done");
var s = m = h = d = w = 0;		// seconds, minutes, hours, days, weeks
var str;

$(document).ready(function() {
	$(startup());
	function startup() {
		var t = new Date().getTime().toString().substr(0, 10) - last;
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

	function print(str) {
		$("#list").append(str);
	}

	function println(str) {
		print(str + "<br>")
	}

	var fileRoot = new Folder("jerrxu");

	var currentFolder = fileRoot;
	var commands = {};

	commands.cat = function() {
		println("You're a kitty!");
	};
	commands.resume = function() {
		println("Please click <a href='resume.docx'>here</a> to see my resume.");
	};
	commands.help = function() {
		printHelp();
	};
	commands.mkdir = function() {
		new Folder(args[1], currentFolder);
	};
	commands.cd = function() {
		var folder = currentFolder.children[args[1]];
		if (folder) {
			currentFolder = folder;
		} else {
			println(args[1] + " is not a folder");
		}
	};
	commands.ls = function() {
		for (var file in currentFolder.children) {
			// &nbsp; is space
			println("&nbsp;" + file);
		}
	};
	commands.pwd = function() {
		println(currentFolder.fullPath);
	};
	commands.pizza = commands.piazza = function() {
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
