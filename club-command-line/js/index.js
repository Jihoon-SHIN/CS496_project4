window.addEventListener("load", app);

function app() {
	var canvas = document.getElementsByTagName("canvas")[0],
		ctx = canvas.getContext("2d"),
		// canvas dimensions
		w = 1500,
		h = 970,
		// scale, keep at 2 for best retina results
		s = 2;

	// set canvas dimensions with scale
	canvas.width = w * s;
	canvas.height = h * s;
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	ctx.scale(s, s);

	/* Main app code */
	// all artwork done by me :)
	var sprites = [
         	"http://jonkantner.com/experiments/vwc/grass.svg",
		 	"http://jonkantner.com/experiments/vwc/fountain.svg",
			"http://jonkantner.com/experiments/vwc/chibi_m.svg",
			"http://jonkantner.com/experiments/vwc/chibi_f.svg"
        ],
        images = [];

    for (var sp in sprites) {
      images.push(new Image());
      images[sp].src = sprites[sp];
    }

	var chatBar = {
			barH: 54,
			logH: 220,
			margin: 5,
			active: false,
			showLog: false,
			maxLines: 32,
			history: [],
			curHistoryItem: -1,
			logShow: function() {
				try {
					let log = document.querySelector(".chat-log").style,
						field = document.querySelector("input");
					log.display = "flex";
					this.active = true;
					this.showLog = true;
					field.focus();
				}
				catch(err) {
					console.log("Chatbar must be created first in order to show the log");
				}
			},
			logHide: function() {
				try {
					let log = document.querySelector(".chat-log").style,
						field = document.querySelector("input");

					log.display = "none";
					this.active = false;
					this.showLog = false;
					field.blur();
				}
				catch(err) {
					console.log("Chatbar must be created first in order to hide the log");
				}
			},
			logToggle: function() {
				if (this.showLog) {
					this.logHide();
				} else {
					this.logShow();
				}
			},
			create: function() {
				let form = document.createElement("form"),
					field = document.createElement("input"),
					btn1 = document.createElement("button"),
					btn2 = document.createElement("button"),
					log = document.createElement("div");

				// set up form elements and translate them to inside canvas
				form.action = "";
				form.style.padding = this.margin + "px";
				form.style.width = (canvas.width / s) + "px";
				form.style.height = (this.barH) + "px";
				form.style.transform = "translateY(" + (-this.barH) + "px)";
				// text input
				field.type = "text";
				field.style.fontSize = (this.barH*0.4) + "px";
				field.style.height = (this.barH - this.margin*2) + "px";
				field.style.padding = "0 " + this.margin + "px";
				field.maxLength = 64;
				// send button
				btn1.className = "send";
				btn1.style.fontSize = (this.barH*0.4) + "px";
				btn1.style.height = (this.barH - this.margin*2) + "px";
				btn1.disabled = "disabled";
				// view chat button
				btn2.className = "view-chat";
				btn2.style.fontSize = (this.barH*0.25) + "px";
				btn2.style.height = (this.barH - this.margin*2) + "px";

				// chat log
				log.className = "chat-log";
				log.style.width = (canvas.width / s) + "px";
				log.style.height = (this.logH) + "px";
				log.style.transform = "translateY(" + (-this.barH*2 - this.logH) + "px)";
				log.style.padding = this.margin + "px";

				document.body.appendChild(form);
				document.body.appendChild(log);
				form.appendChild(field);
				form.appendChild(btn1);
				form.appendChild(btn2);
				btn1.appendChild(document.createTextNode("Send"));
				btn2.appendChild(document.createTextNode("View Chat"));
			}
		},
		screenText = {
			text: "",
			color: "#fff",
			fontS: 16,
			timer: 3000,
			maxTime: 3000,
			fadeTime: 150,
			y: 0,
			h: 32,
			updateText: function(txt, y, h, c) {
				this.text = txt;
				this.timer = this.maxTime;
				this.y = y || 0;
				this.h = h || 32;
				this.color = c || "#fff";
			}
		},
		bubbleObj = function(text,w,x,y) {
			let minW = 35;
			this.text = text;
			this.w = w < minW ? minW : w;
			this.x = x;
			this.y = y;
		},
		cmdObj = function(name, args, desc) {
			this.name = name;
			this.args = args || "";
			this.desc = desc || "";
		},
		cmd = [
			new cmdObj("clear","","clear chat"),
			new cmdObj("help","","get help menu"),
		],

		avatar = function(name, gender, skinTone, width, height, speed, frames, dir, x, y, lvl) {
			let nameLenLimit = 16;
			this.name = name.length > nameLenLimit ? name.substr(0,nameLenLimit) : name || "Anonymous";
			this.gender = gender || 0;
			this.skinTone = skinTone || 0;
			this.w = width || 0;
			this.h = height || 0;
			this.speed = speed || 0;
			this.curFrame = 1;
			this.frames = frames || 1;
			this.dir = dir || null;
			this.isMoving = false;
			this.canMove = true;
			this.x = x || 0;
			this.y = y || 0;
			this.lvl = lvl || 0;
			this.lastMsg = "";
			this.msgTimer = 0;
			this.msgMaxTime = 3000;
			this.msgFadeTime = 150;
			this.sendMsg = function(msg) {
				if (msg.length > 0) {
					let isCmd = false;
					chatBar.curAutoCmpltCmd = -1;
					chatBar.arg1pg = -1;
					chatBar.arg2pg = -1;

					// update last message if not a command
					if (msg[0] != "/") {
						this.lastMsg = msg;
					} else {
						isCmd = true;
					}

					let chatLog = document.querySelector(".chat-log"),
						newEntry = document.createElement("span");

					/* if command, execute if used by player (whose level is always 0,
					and NPCs never send anything if they too are set at level 0) */
					if (this.lvl === 0 && isCmd) {
						switch (msg.substr(1,msg.length - 1).split(" ")[0]) {
							// display help
							case "help":
								let helpHeading = "----- Help -----",
									cmdInfo = [],
									helpScrnTxt = "";

								for (var c in cmd) {
									cmdInfo[c] = "/" + cmd[c].name + " " + cmd[c].args + (cmd[c].args.length > 0 ? " " : "") + "- " + cmd[c].desc;
								}

								newEntry.className = "help-text";
								newEntry.appendChild(document.createTextNode(helpHeading));
								helpScrnTxt += helpHeading + "%";

								// show available commands
								for (var ci in cmdInfo) {
									newEntry.appendChild(document.createElement("br"));
									newEntry.appendChild(document.createTextNode(cmdInfo[ci]));
									helpScrnTxt += cmdInfo[ci] + "%";
								}

								screenText.updateText(helpScrnTxt,h - chatBar.barH - (screenText.fontS*1.5*(cmdInfo.length)),screenText.fontS*2*(cmdInfo.length),"#4f4");
								break;

							// clear chat
							case "clear":
								let clearMsg = "Chat cleared";
								chatLog.innerHTML = "";
								newEntry.appendChild(document.createTextNode(clearMsg));
								screenText.updateText(clearMsg,h - chatBar.barH,screenText.fontS*2);
								break;
							default:
								let cmdErr = "Invalid command. See /help for a list of available commands.";

								newEntry.className = "error-text";
								newEntry.appendChild(document.createTextNode(cmdErr));
								screenText.updateText(cmdErr,h - chatBar.barH,screenText.fontS*2,"#f44");
								break;
						}

					} else {
						this.msgTimer = this.msgMaxTime;
						newEntry.appendChild(document.createTextNode(this.name + ": " + this.lastMsg));
					}
					// add new line
					chatLog.insertBefore(newEntry, chatLog.childNodes[0]);

					// cut off oldest line if at max lines allowed
					if (chatLog.childNodes.length > chatBar.maxLines) {
						chatLog.removeChild(chatLog.getElementsByTagName("span")[chatBar.maxLines]);
					}
				}
			};
		},
		structure = function(width, height, x, y, backArea, img, isAnim, frames) {
			this.w = width;
			this.h = height;
			this.x = x;
			this.y = y;
			this.backArea = backArea || 0;
			this.img = img || null;
			this.isAnim = img && isAnim ? (typeof isAnim == "boolean" ? true : false) : false;
			this.frames = frames || 1;
			this.curFrame = 1;
		},
		randNum = function(min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        },
		collision = function(a, b) {
          // top hits bottom, bottom hits top, left hits right, right hits left
          if ( ((a.y < b.y + b.h + 6 - b.backArea && a.y > b.y) || (a.y > b.y && a.y < b.y + b.h - b.backArea)) &&
              ((a.x + a.w > b.x && a.x + a.w < b.x + b.w) || (a.x < b.x + b.w && a.x > b.x)) ) {
            return true;
          } else {
            return false;
          }
        },
		findCllsn = function(a, b) {
			for (var bi in b) {
				if (collision(a, b[bi]) && Array.isArray(b)) {
					return true;
				}
			}
		},
		player = new avatar("Player",0,0,30,60,4,28,2,w/2 - 15,h*0.8 - chatBar.barH),
		structures = [
			new structure(w,50,0,-40),
			new structure(10,h - chatBar.barH - 10,0,10),
			new structure(10,h - chatBar.barH - 10,w - 10,10),
			new structure(300,200,w/2 - 150,100,70,images[1],true,12)
		],
		worldObjs = [],
		control = function(avatar, e) {
			// avatar.dir values: 0 = up, 1 = right, 2 = down, 3 = left
			if (e && !chatBar.active) {
				avatar.isMoving = true;
				avatar.canMove = true;
				switch (e.keyCode) {
					case 37:
						avatar.dir = 3;
						break;
					case 38:
						avatar.dir = 0;
						break;
					case 39:
						avatar.dir = 1;
						break;
					case 40:
						avatar.dir = 2;
						break;
					default:
						avatar.canMove = false;
						break;
				}
			}
		},
		stopControl = function(avatar) {
			avatar.isMoving = false;
		},
		avatarSpriteLoop = function(avatar) {
			if (avatar.curFrame == avatar.frames) {
				avatar.curFrame = 1;
			} else {
				++avatar.curFrame;
			}
		},
		moveAvatar = function(avatar) {
			if (avatar.isMoving && avatar.canMove) {

				switch (avatar.dir) {
					case 3:
						avatar.x -= avatar.speed;
						// collision with right side of structure, collisions apply to walls as well
						if (findCllsn(avatar,structures) || avatar.x < 0) {
							avatar.x += avatar.speed;
							avatar.curFrame = 1;
						} else {
							avatarSpriteLoop(avatar);
						}
						break;
					case 0:
						avatar.y -= avatar.speed;
						// bottom side
						if (findCllsn(avatar,structures) || avatar.y < 0) {
							avatar.y += avatar.speed;
							avatar.curFrame = 1;
						} else {
							avatarSpriteLoop(avatar);
						}
						break;
					case 1:
						avatar.x += avatar.speed;
						// left side
						if (findCllsn(avatar,structures) || avatar.x + avatar.w > w) {
							avatar.x -= avatar.speed;
							avatar.curFrame = 1;
						} else {
							avatarSpriteLoop(avatar);
						}
						break;
					case 2:
						avatar.y += avatar.speed;
						// top side
						if (findCllsn(avatar,structures) || avatar.y + avatar.h > h) {
							avatar.y -= avatar.speed;
							avatar.curFrame = 1;
						} else {
							avatarSpriteLoop(avatar);
						}
						break;
					default:
						break;
				}

			} else {
				avatar.curFrame = 1;
			}
		},
		drawStructure = function(strctr) {
			if (strctr.img === null) {
				ctx.fillStyle = "#aaa";
				ctx.fillRect(strctr.x,strctr.y,strctr.w,strctr.h);
			} else if (strctr.isAnim) {

				ctx.drawImage(strctr.img,strctr.w*(strctr.curFrame - 1),0,strctr.w,strctr.h,strctr.x,strctr.y-strctr.backArea,strctr.w,strctr.h);
				++strctr.curFrame;
				if (strctr.curFrame > strctr.frames) {
					strctr.curFrame = 1;
				}
			} else {
				ctx.drawImage(strctr.img,strctr.x,strctr.y,strctr.w,strctr.h);
			}
		},
		drawAvatar = function(avatar) {
			let lastMsg = avatar.lastMsg;
			// chat bubble
			if (lastMsg.length > 0 && avatar.msgTimer > 0) {
				let fontS = 16,
					fadeTime = avatar.msgFadeTime,
					latinPat = /\w+/,
					isNotLatin = !latinPat.test(lastMsg) ? true : false,
					lineLimit = 16,
					line = [""],
					lines = line.length,
					longestLnLen = 4,
					strS = !isNotLatin ? lastMsg.split(" ") : lastMsg;

					// break up message into lines
					for (var lm in strS) {
						let l = line.length - 1;
						lm = +lm;
						line[l] += (strS[lm] + (lm != strS.length - 1 && !isNotLatin ? " " : ""));

						if (line[l].length > lineLimit) {
							if (line[l].length > longestLnLen) {
								longestLnLen = line[l].length;
							}
							++lines;
							line[lines - 1] = "";
						}
					}
					// for one line only, make its current length the longest
					if (lines == 1) {
						longestLnLen = line[0].length;
					}
					// cut off last line if empty
					if (line[line.length - 1] == "") {
						line.pop();
						--lines;
					}
					// fade in
					let msgTimeFwd = avatar.msgMaxTime - avatar.msgTimer;
					if (msgTimeFwd < fadeTime) {
						ctx.globalAlpha = msgTimeFwd/fadeTime;
					}
					// fade out
					if (avatar.msgTimer < fadeTime) {
						ctx.globalAlpha = avatar.msgTimer/fadeTime;
					}
					let wMult = !isNotLatin ? 0.7 : 1.2,
						bubble = new bubbleObj(lastMsg,longestLnLen*fontS*wMult,avatar.x + avatar.w/2,avatar.y - avatar.h - 35);

					ctx.fillStyle = "rgba(255,255,255,0.85)";
					// oval
					ctx.beginPath();
					let bubbleY = bubble.y - (fontS * (lines - 1)),
						bubbleH = fontS * 3 * lines,
						bottomLnSt = (fontS * 0.6) * (lines - 1);
					// top half
					ctx.moveTo(bubble.x - bubble.w/2,bubbleY);
					ctx.bezierCurveTo(bubble.x - bubble.w/2,bubbleY - bubbleH/2,(bubble.x - bubble.w/2) + bubble.w,bubbleY - bubbleH/2,(bubble.x - bubble.w/2) + bubble.w,bubbleY);
					// bottom half
					ctx.moveTo(bubble.x - bubble.w/2,bubbleY);
					ctx.quadraticCurveTo(bubble.x - bubble.w/2, bubbleY + bubbleH/4, bubble.x - 5,bubbleY + bubbleH/3);
					ctx.lineTo(bubble.x,bubbleY + (fontS * 2 * lines) - (fontS * (lines - 1)));
					ctx.lineTo(bubble.x + 5,bubbleY + bubbleH/3);
					ctx.quadraticCurveTo(bubble.x + bubble.w/2, bubbleY + bubbleH/4, bubble.x + bubble.w/2,bubbleY);
					ctx.fill();
					ctx.closePath();
					// text
					ctx.fillStyle = "#000";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.font = fontS + "px Arial";
					// write each line on bubble
					for (var bl in line) {
						bl = +bl;
						ctx.fillText(line[line.length - 1 - bl],bubble.x,bubbleY + bottomLnSt - ((fontS * 1.2) * bl));
					}
					ctx.globalAlpha = 1;

				avatar.msgTimer -= 1000/60;
				if (avatar.msgTimer < 0) {
					avatar.msgTimer = 0;
				}
			}
			// avatar shadow
			ctx.fillStyle = "rgba(0,0,0,0.25)";
			ctx.beginPath();
			ctx.moveTo(avatar.x, avatar.y);
			ctx.bezierCurveTo(avatar.x + avatar.w/5, avatar.y - avatar.w/3, avatar.x + avatar.w/(5/4), avatar.y - avatar.w/3, avatar.x + avatar.w, avatar.y);
			ctx.moveTo(avatar.x, avatar.y);
			ctx.bezierCurveTo(avatar.x + avatar.w/5, avatar.y + avatar.w/3, avatar.x + avatar.w/(5/4), avatar.y + avatar.w/3, avatar.x + avatar.w, avatar.y);
			ctx.fill();
			ctx.closePath();
			// avatar
			ctx.drawImage(
					avatar.gender == 1 ? images[3] : images[2],
					avatar.w * (avatar.curFrame - 1) + (avatar.w * avatar.frames * avatar.dir),
					avatar.h * avatar.skinTone,
					avatar.w,
					avatar.h,
					avatar.x,
					avatar.y - avatar.h,
					avatar.w,
					avatar.h
			);
			// name
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.font = "14px Arial";
			ctx.fillText(avatar.name,avatar.x + avatar.w/2,avatar.y + 4);
			ctx.fillStyle = avatar.name == player.name ? "#ff4" : "#fff";
			ctx.fillText(avatar.name,avatar.x + avatar.w/2,avatar.y + 3);
		},
		writeScrnText = function(txtObj) {
			if (txtObj.timer > 0) {
				if (!chatBar.showLog) {
					let adj = 2,
						fadeTime = txtObj.fadeTime,
						txtTimeFwd = txtObj.maxTime - txtObj.timer;

					// fade in
					if (txtTimeFwd < fadeTime) {
						ctx.globalAlpha = txtTimeFwd / fadeTime;
					}
					// fade out
					if (txtObj.timer < fadeTime) {
						ctx.globalAlpha = txtObj.timer / fadeTime;
					}

					ctx.fillStyle = "rgba(0,0,0,0.5)";
					ctx.fillRect(0,txtObj.y - adj - txtObj.fontS*2,w,txtObj.h + adj);
					ctx.textAlign = "left";
					ctx.font = txtObj.fontS + "px Arial";
					ctx.fillStyle = txtObj.color;

					let lines = txtObj.text.split("%");
					for (var l in lines) {
						ctx.fillText(lines[l],5,txtObj.y - adj - (txtObj.fontS*1.5 * -(l - 1)));
					}
					ctx.globalAlpha = 1;
				}

				txtObj.timer -= 1000/60;

				if (txtObj.timer < 0) {
					txtObj.timer = 0;
				}
			}
		},
		drawScreen = function() {
			ctx.clearRect(0,0,w,h);

			let ground = ctx.createPattern(images[0], 'repeat'),
				pathW = 50,
				path = ctx.createLinearGradient(w/2 - pathW/2,0,w/2 + pathW/2,0);

			path.addColorStop(0.05,"#863");
			path.addColorStop(0.05,"#974");
			path.addColorStop(0.95,"#974");
			path.addColorStop(0.95,"#753");

			ctx.fillStyle = ground;
			ctx.fillRect(0,0,w,h);

			ctx.fillStyle = path;
			ctx.fillRect(w/2 - pathW/2,220,pathW,210);

			// sort avatars and structures ascending by Y position so that they each arent standing on top of another
			worldObjs.sort(function(a, b){
				return a.y - b.y;
			});

			// render everything
			for (var wo in worldObjs) {
				// to determine if avatar, test for name
				if (worldObjs[wo].name) {
					moveAvatar(worldObjs[wo]);
					drawAvatar(worldObjs[wo]);
				} else {
					drawStructure(worldObjs[wo]);
				}
			}

			// screen text
			writeScrnText(screenText);
		},
		runDisplay = function() {
			drawScreen();
			setTimeout(runDisplay, 1000/60);
		},
		start = function() {
			chatBar.create();
			// load player and NPCs
			worldObjs[0] = player;
			// load structures
			let avatars = worldObjs.length;
			for (var ss in structures) {
				ss = +ss + avatars;
				worldObjs[ss] = structures[ss - avatars];
			}
			// onboarding
			let onboardingTxt = "Welcome! To get started, enter /help for commands.",
				chatLog = document.querySelector(".chat-log"),
				newEntry = document.createElement("span");

			newEntry.className = "info-text";
			newEntry.appendChild(document.createTextNode(onboardingTxt));
			chatLog.insertBefore(newEntry, chatLog.childNodes[0]);
			screenText.updateText(onboardingTxt,h - chatBar.barH,screenText.fontS*2,"#ff4");
			// run everything!
			runDisplay();
		};

	start();

	// player moving
	document.addEventListener("keydown",function(e){
		let field = document.querySelector("input"),
			send = document.querySelector(".send"),
			viewChat = document.querySelector(".view-chat");

		// Send button availability
		setTimeout(function(){
			send.disabled = field.value.length > 0 ? "" : "disabled";
		},10);

		// move only if not using chat
		if (!chatBar.active) {
			control(player, e);

		// surf through own input history
		} else if (chatBar.history.length > 0) {
			// back
			if (e.keyCode == 38 && chatBar.curHistoryItem != chatBar.history.length - 1) {
				++chatBar.curHistoryItem;
				field.value = chatBar.history[chatBar.history.length - chatBar.curHistoryItem - 1];
				// move insertion point to end
				e.preventDefault();
				if (typeof field.selectionStart == "number") {
        			field.selectionStart = field.selectionEnd = field.value.length;
    			} else if (typeof field.createTextRange != "undefined") {
        			field.focus();
        			let range = field.createTextRange();
        			range.collapse(true);
        			range.select();
    			}
			// forward
			} else if (e.keyCode == 40 && chatBar.curHistoryItem > -1) {
				--chatBar.curHistoryItem;
				field.value = chatBar.curHistoryItem == -1 ? "" : chatBar.history[chatBar.history.length - chatBar.curHistoryItem - 1];
			}
		}


		// toggle chat with V
		if (e.keyCode == 86 && !chatBar.active) {
			e.preventDefault();
			chatBar.logToggle();

		// quickly start typing command
		} else if (e.keyCode == 191 && !chatBar.active) {
			field.value = "";
			chatBar.logToggle();

		// close chat using Esc
		} else if (e.keyCode == 27) {
			chatBar.active = false;
			chatBar.logHide();
			field.blur();
			send.blur();
			viewChat.blur();
		}
	});
	// player stop moving
    document.addEventListener("keyup",function(){
		stopControl(player);
	});
	// player send chat messages
	document.querySelector("input").addEventListener("focus",function(){
		chatBar.active = true;
	});
	document.querySelector("input").addEventListener("blur",function(){
		chatBar.active = false;
	});
	document.querySelector(".send").addEventListener("click",function(e){
		e.preventDefault();
		let field = document.querySelector("input");

		if (field.value.length > 0) {
			player.sendMsg(field.value);
			chatBar.history.push(field.value);
			chatBar.curHistoryItem = -1;
			if (!chatBar.showLog) {
				chatBar.active = false;
				field.blur();
			}
		}

		field.value = "";
	});
	// show/hide chat using button
	document.querySelector(".view-chat").addEventListener("click",function(e){
		e.preventDefault();
		chatBar.logToggle();
	});
	// also hide log if clicked outside
	canvas.addEventListener("click",function(){
		chatBar.logHide();
	});
}
