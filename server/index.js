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

	function print(str) {
		$("#list").append(str);
	}

	function println(str) {
		print(str + "<br>")
	}

	function askServer(args,callback) {
		var params = {
			args:args.join(","),
			folder:currentFolder.fullPath
		}
		$.ajax({
			url:"/command/?" + $.param(params),
			success:function(result) {
				if (typeof result === "object") {
					if (result.type === "link") {
						println("<a href='" + result.data + "' target='_blank'>" + result.data + "</a>");
						window.open(result.data);
					} else if (result.type === "folder") {
						var data = result.data;
						var folder = createFolders(data.fullPath);
						data.children.forEach((c) => {
							if (c.type === "folder") {
								new Folder(c.name,folder);
							} else {
								addFile(c.name,folder);
							}
						});
						callback && callback(folder);
					}
				} else {
					println(result);
				}
				function addFile(name, folder) {
					new File(name,folder,function() {
						// could optimize
						askServer([folder.fullPath + "/" + name]);
					});
				}
			}
		})
	}

	var currentFolder = home;

	var commandHistory = [];
	var curCommandIndex = 0;
	var commands = {};
	askServer(["ls"]);
	startup();

	commands.clear = function(args) {
		$("#list").empty();
	}
	commands.help = function(args) {
		printHelp();
	};
	commands.mkdir = function(args) {
		askServer(args);
	};
	commands.rm = function(args) {
		askServer(args);
	}
	commands.touch = function(args) {
		askServer(args);
	}
	commands.cd = function(args) {
		askServer(args, (folder) => {
			currentFolder = folder;
		});
	};
	commands.ls = commands.dir = function(args) {
		askServer(args,function(folder) {
			for (var file in folder.children) {
				// &nbsp; is space
				println("&nbsp;" + file);
			}
		});
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
	commands.history = function(args) {
		for (var i = 0 ; i < commandHistory.length ; i++) {
			println("&nbsp;" + commandHistory[i]);
		}
	};

	$(document).keypress(function(event) {
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
		} else {
			$("#input").focus();
			placeCaretAtEnd($("#input")[0])
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
	});

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
