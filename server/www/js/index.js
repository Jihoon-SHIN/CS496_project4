function makeRandomName() {
  var name = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";
  for(var i = 0; i<3; i++){
    name += possible.charAt(Math.floor(Math.random()*possible.length));
  }
  return name;
}

function findPlayerById(userid){
  for(var p in worldObjs){
    if(worldObjs[p].userid == userid){
      return worldObjs[p];
    }
  }
}

function removePlayerById(userid){
  for(var p in worldObjs){
    if(worldObjs[p].userid == userid){
      worldObjs.splice(p, 1);
      return;
    }
  }
}

var socket = io();

socket.on("login", function(data){
  var userid = data.userid;
  worldObjs.push(new Avatar(data.userid, data.name, data.gender, data.skinTone,
    data.x, data.y, data.curFrame, data.dir, false));
  console.log(userid);
});

socket.on("chat", function(data){
  //show chat
  let chatPlayer = findPlayerById(data.userid);
  console.log(data.chat);
  if(chatPlayer){
    chatPlayer.sendMsg(data.chat);
    chatBar.history.push(data.chat);
  }else{
    console.log(data.userid+":user not found333333");
  }
});

socket.on("logout", function(userid){
  console.log(userid+"logged out");
  removePlayerById(userid);
  //delete worldObjs[userid];
});

socket.on('move', function(data){
  let movingPlayer = findPlayerById(data.userid);
  if(movingPlayer){
    movingPlayer.setState(data);
  } else {
    console.log(data.userid + ": user not found");
  }
});

var canvas = document.getElementsByTagName("canvas")[0],
  // canvas dimensions
  w = 1500,
  h = 900,
  // scale, keep at 2 for best retina results
  s = 2;
var ctx = canvas.getContext("2d");

// set canvas dimensions with scale
canvas.width = w * s;
canvas.height = h * s;
canvas.style.width = w + "px";
canvas.style.height = h + "px";
ctx.scale(s, s);

var sprites = [
  "http://jonkantner.com/experiments/vwc/grass.svg",
  "http://jonkantner.com/experiments/vwc/fountain.svg",
  "http://jonkantner.com/experiments/vwc/chibi_m.svg",
  "http://jonkantner.com/experiments/vwc/chibi_f.svg"
];

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
    } catch (err) {
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
    } catch (err) {
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
    field.style.fontSize = (this.barH * 0.4) + "px";
    field.style.height = (this.barH - this.margin * 2) + "px";
    field.style.padding = "0 " + this.margin + "px";
    field.maxLength = 64;
    // send button
    btn1.className = "send";
    btn1.style.fontSize = (this.barH * 0.4) + "px";
    btn1.style.height = (this.barH - this.margin * 2) + "px";
    btn1.disabled = "disabled";
    // view chat button
    btn2.className = "view-chat";
    btn2.style.fontSize = (this.barH * 0.25) + "px";
    btn2.style.height = (this.barH - this.margin * 2) + "px";

    // chat log
    log.className = "chat-log";
    log.style.width = (canvas.width / s) + "px";
    log.style.height = (this.logH) + "px";
    log.style.transform = "translateY(" + (-this.barH * 2 - this.logH) + "px)";
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
bubbleObj = function(text, w, x, y) {
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
  new cmdObj("clear", "", "clear chat"),
  new cmdObj("help", "", "get help menu"),
],
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
structures = [
  new structure(w, 50, 0, -40),
  new structure(10, h - chatBar.barH - 10, 0, 10),
  new structure(10, h - chatBar.barH - 10, w - 10, 10),
  new structure(300, 200, w / 2 - 150, h/2-100, 70, images[1], true, 12)
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
drawStructure = function(strctr) {
  if (strctr.img === null) {
    ctx.fillStyle = "#aaa";
    ctx.fillRect(strctr.x, strctr.y, strctr.w, strctr.h);
  } else if (strctr.isAnim) {

    ctx.drawImage(strctr.img, strctr.w * (strctr.curFrame - 1), 0, strctr.w, strctr.h, strctr.x, strctr.y - strctr.backArea, strctr.w, strctr.h);
    ++strctr.curFrame;
    if (strctr.curFrame > strctr.frames) {
      strctr.curFrame = 1;
    }
  } else {
    ctx.drawImage(strctr.img, strctr.x, strctr.y, strctr.w, strctr.h);
  }
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
      ctx.fillRect(0, txtObj.y - adj - txtObj.fontS * 2, w, txtObj.h + adj);
      ctx.textAlign = "left";
      ctx.font = txtObj.fontS + "px Arial";
      ctx.fillStyle = txtObj.color;

      let lines = txtObj.text.split("%");
      for (var l in lines) {
        ctx.fillText(lines[l], 5, txtObj.y - adj - (txtObj.fontS * 1.5 * -(l - 1)));
      }
      ctx.globalAlpha = 1;
    }

    txtObj.timer -= 1000 / 60;

    if (txtObj.timer < 0) {
      txtObj.timer = 0;
    }
  }
},
drawScreen = function() {
  ctx.clearRect(0, 0, w, h);

  let ground = ctx.createPattern(images[0], 'repeat'),
    pathW = 50,
    path = ctx.createLinearGradient(w / 2 - pathW / 2, 0, w / 2 + pathW / 2, 0);

  path.addColorStop(0.05, "#863");
  path.addColorStop(0.05, "#974");
  path.addColorStop(0.95, "#974");
  path.addColorStop(0.95, "#753");

  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = path;
  ctx.fillRect(w / 2 - pathW / 2, h/2-210/2, pathW, h/2);

  // sort avatars and structures ascending by Y position so that they each arent standing on top of another
  worldObjs.sort(function(a, b) {
    return a.y - b.y;
  });

  // render everything
  for (var wo in worldObjs) {
    // to determine if avatar, test for name
    if (worldObjs[wo].name) {
      if(worldObjs[wo].isSelf){
        worldObjs[wo].moveAvatar();
      }
      worldObjs[wo].drawAvatar();
    } else {
      drawStructure(worldObjs[wo]);
    }
  }

  // screen text
  writeScrnText(screenText);
},
runDisplay = function() {
  drawScreen();
  setTimeout(runDisplay, 1000 / 60);
},

start = function() {
  chatBar.create();
  // load player and NPCs

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
  screenText.updateText(onboardingTxt, h - chatBar.barH, screenText.fontS * 2, "#ff4");
  // run everything!
  runDisplay();
};

socket.on('genUserId', function(id) {
  player = new Avatar(id, makeRandomName(), 0, 0, randNum(10, w-10),
    randNum(10, h-30), 1, dir=2, isSelf=true);
  worldObjs[0] = player;
  socket.emit("login", {
    userid: id,
    name: player.name,
    gender: player.gender,
    skinTone: player.skinTone,
    x: player.x,
    y: player.y,
    curFrame: player.curFrame,
    dir: player.dir
  });
  start();


  // player moving
  document.addEventListener("keydown", function(e) {
    let field = document.querySelector("input"),
      send = document.querySelector(".send"),
      viewChat = document.querySelector(".view-chat");

    // Send button availability
    setTimeout(function() {
      send.disabled = field.value.length > 0 ? "" : "disabled";
    }, 10);

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
  document.addEventListener("keyup", function() {
    stopControl(player);
  });
  // player send chat messages
  document.querySelector("input").addEventListener("focus", function() {
    chatBar.active = true;
  });
  document.querySelector("input").addEventListener("blur", function() {
    chatBar.active = false;
  });
  document.querySelector(".send").addEventListener("click", function(e) {
    e.preventDefault();
    let field = document.querySelector("input");

    if (field.value.length > 0) {
      player.sendMsg(field.value);

      socket.emit("chat", {
        userid: player.userid,
        chat : field.value
      });

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
  document.querySelector(".view-chat").addEventListener("click", function(e) {
    e.preventDefault();
    chatBar.logToggle();
  });
  // also hide log if clicked outside
  canvas.addEventListener("click", function() {
    chatBar.logHide();
  });
});

socket.emit('genUserId', null);
