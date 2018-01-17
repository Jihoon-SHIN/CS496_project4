function Avatar(name, gender, skinTone, x, y, curFrame, dir, isSelf) {
  let nameLenLimit = 16;
  this.isSelf = isSelf;
  this.name = name.length > nameLenLimit ? name.substr(0, nameLenLimit) : name || "Anonymous";
  this.gender = gender || 0;
  this.skinTone = skinTone || 0;
  this.w = 30;
  this.h = 60;
  this.speed = 4;
  this.curFrame = curFrame;
  this.frames = 28;
  this.dir = dir;
  this.isMoving = false;
  this.canMove = true;
  this.x = x || 0;
  this.y = y || 0;
  this.lastMsg = "";
  this.msgTimer = 0;
  this.msgMaxTime = 3000;
  this.msgFadeTime = 150;
  this.sendMsg = function(msg) {
    if (msg.length > 0) {
      let isCmd = false;

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
      if (isCmd) {
        switch (msg.substr(1, msg.length - 1).split(" ")[0]) {
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

            screenText.updateText(helpScrnTxt, h - chatBar.barH - (screenText.fontS * 1.5 * (cmdInfo.length)), screenText.fontS * 2 * (cmdInfo.length), "#4f4");
            break;

            // clear chat
          case "clear":
            let clearMsg = "Chat cleared";
            chatLog.innerHTML = "";
            newEntry.appendChild(document.createTextNode(clearMsg));
            break;

          case "msg":
            let msgArgs = msg.split(" "),
            name = msgArgs[1],
            chat ="";

            for(var i=2; i<msgArgs.length ;i++){
              chat += msgArgs[i] + " ";
            }
            chatMsg = "[발신]"+ name + ": " + chat;
            newEntry.className = "whisper-chat";
            newEntry.appendChild(document.createTextNode(chatMsg));
            screenText.updateText(chatMsg, h-chatBar.barH, screenText.fontS*2, "#4f4");
            socket.emit("msg", {
              from : this.name,
              to: name,
              chat : chat
            });
            break;
          case "msgTo":
            let msgTo = msg.split(" "),
            from = msgTo[1],
            chatM = "";
            for(var j=2; j<msgTo.length ;j++){
              chatM += msgTo[j] + " ";
            }
            chatMM = "[수신]"+ from + ": " + chatM;
            newEntry.className = "whisper-chat";
            newEntry.appendChild(document.createTextNode(chatMM));
            screenText.updateText(chatMM, h-chatBar.barH, screenText.fontS*2, "#4f4");
            break;
          case "msgFrom":
            let msgFrom = msg.split(" "),
            fromM = msgFrom[1],
            chatF = msgFrom[2],
            chatFM = "There is no"+" "+fromM;
            newEntry.className = "no-player-chat";
            newEntry.appendChild(document.createTextNode(chatFM));
            screenText.updateText(chatFM, h-chatBar.barH, screenText.fontS*2, "#f44");
            break;
          default:
            let cmdErr = "Invalid command. See /help for a list of available commands.";
            newEntry.className = "error-text";
            newEntry.appendChild(document.createTextNode(cmdErr));
            screenText.updateText(cmdErr, h - chatBar.barH, screenText.fontS * 2, "#f44");
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
  this.avatarSpriteLoop = function() {
    if (this.curFrame == this.frames) {
      this.curFrame = 1;
    } else {
      ++this.curFrame;
    }
  };
  this.moveAvatar = function() {
    if (this.isMoving && this.canMove) {
      switch (this.dir) {
        case 3:
          this.x -= this.speed;
          // collision with right side of structure, collisions apply to walls as well
          if (findCllsn(this, structures) || this.x < 0) {
            this.x += this.speed;
            this.curFrame = 1;
          } else {
            this.avatarSpriteLoop();
          }
          break;
        case 0:
          this.y -= this.speed;
          // bottom side
          if (findCllsn(this, structures) || this.y < 0) {
            this.y += this.speed;
            this.curFrame = 1;
          } else {
            this.avatarSpriteLoop();
          }
          break;
        case 1:
          this.x += this.speed;
          // left side
          if (findCllsn(this, structures) || this.x + this.w > w) {
            this.x -= this.speed;
            this.curFrame = 1;
          } else {
            this.avatarSpriteLoop();
          }
          break;
        case 2:
          this.y += this.speed;
          // top side
          if (findCllsn(this, structures) || this.y + this.h > h) {
            this.y -= this.speed;
            this.curFrame = 1;
          } else {
            this.avatarSpriteLoop();
          }
          break;
        default:
          break;
      }
    } else {
      this.curFrame = 1;
    }

    socket.emit('move', {
      name: this.name,
      x: this.x,
      y: this.y,
      dir: this.dir,
      curFrame: this.curFrame
    });
  };
  this.drawAvatar = function() {
    let lastMsg = this.lastMsg;
    // chat bubble
    if (lastMsg.length > 0 && this.msgTimer > 0) {
      let fontS = 16,
        fadeTime = this.msgFadeTime,
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
      let msgTimeFwd = this.msgMaxTime - this.msgTimer;
      if (msgTimeFwd < fadeTime) {
        ctx.globalAlpha = msgTimeFwd / fadeTime;
      }
      // fade out
      if (this.msgTimer < fadeTime) {
        ctx.globalAlpha = this.msgTimer / fadeTime;
      }
      let wMult = !isNotLatin ? 0.7 : 1.2,
        bubble = new bubbleObj(lastMsg, longestLnLen * fontS * wMult, this.x + this.w / 2, this.y - this.h - 35);

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      // oval
      ctx.beginPath();
      let bubbleY = bubble.y - (fontS * (lines - 1)),
        bubbleH = fontS * 3 * lines,
        bottomLnSt = (fontS * 0.6) * (lines - 1);
      // top half
      ctx.moveTo(bubble.x - bubble.w / 2, bubbleY);
      ctx.bezierCurveTo(bubble.x - bubble.w / 2, bubbleY - bubbleH / 2, (bubble.x - bubble.w / 2) + bubble.w, bubbleY - bubbleH / 2, (bubble.x - bubble.w / 2) + bubble.w, bubbleY);
      // bottom half
      ctx.moveTo(bubble.x - bubble.w / 2, bubbleY);
      ctx.quadraticCurveTo(bubble.x - bubble.w / 2, bubbleY + bubbleH / 4, bubble.x - 5, bubbleY + bubbleH / 3);
      ctx.lineTo(bubble.x, bubbleY + (fontS * 2 * lines) - (fontS * (lines - 1)));
      ctx.lineTo(bubble.x + 5, bubbleY + bubbleH / 3);
      ctx.quadraticCurveTo(bubble.x + bubble.w / 2, bubbleY + bubbleH / 4, bubble.x + bubble.w / 2, bubbleY);
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
        ctx.fillText(line[line.length - 1 - bl], bubble.x, bubbleY + bottomLnSt - ((fontS * 1.2) * bl));
      }
      ctx.globalAlpha = 1;

      this.msgTimer -= 1000 / 60;
      if (this.msgTimer < 0) {
        this.msgTimer = 0;
      }
    }
    // avatar shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.bezierCurveTo(this.x + this.w / 5, this.y - this.w / 3, this.x + this.w / (5 / 4), this.y - this.w / 3, this.x + this.w, this.y);
    ctx.moveTo(this.x, this.y);
    ctx.bezierCurveTo(this.x + this.w / 5, this.y + this.w / 3, this.x + this.w / (5 / 4), this.y + this.w / 3, this.x + this.w, this.y);
    ctx.fill();
    ctx.closePath();
    // avatar
    ctx.drawImage(
      this.gender == 1 ? images[3] : images[2],
      this.w * (this.curFrame - 1) + (this.w * this.frames * this.dir),
      this.h * this.skinTone,
      this.w,
      this.h,
      this.x,
      this.y - this.h,
      this.w,
      this.h
    );
    // name
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText(this.name, this.x + this.w / 2, this.y + 4);
    ctx.fillStyle = this.name == player.name ? "#ff4" : "#fff";
    ctx.fillText(this.name, this.x + this.w / 2, this.y + 3);
  };
  this.setState = function(data){
    this.x = data.x;
    this.y = data.y;
    this.dir = data.dir;
    this.curFrame = data.curFrame;
  };
}
