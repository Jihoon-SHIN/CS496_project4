function findPlayerByName(name){
  for(var p in worldObjs){
    if(worldObjs[p].name == name){
      return worldObjs[p];
    }
  }
}

function removePlayerByName(name){
  for(var p in worldObjs){
    if(worldObjs[p].name == name){
      worldObjs.splice(p, 1);
      return;
    }
  }
}

function removeElemByKey(arr, key){
  for(var i in arr){
    if(arr[i] == key){
      arr.splice(i, 1);
      return;
    }
  }
}

function makeRandomName() {
  var adjectiveList = ["웃는", "기쁜", "슬픈", "우울한", "멋진", "섹시한", "못생긴", "착한", "나쁜", "즐거운", "외로운", "인싸", "아싸","소심한"];
  var nameList = ["고양이", "호랑이", "사자", "강아지", "카이생", "돌멩이", "하이에나", "토끼", "다람쥐", "햄스터", "돼지", "들소", "알파카"];
  var adjectiveIndex = randNum(0, adjectiveList.length-1);
  var nameIndex = randNum(0, nameList.length-1);
  console.log(adjectiveIndex, nameIndex);

  var name = adjectiveList[adjectiveIndex]+nameList[nameIndex];
  return name;
}

var socket = io();

socket.on("anotherUser", function(data){
  worldObjs.push(new Avatar(data.name, data.gender, data.skinTone, data.x,
  data.y, data.curFrame, data.dir, false));
  console.log("another User : "+ data.name);
});

socket.on("chat", function(data){
  //show chat
  let chatPlayer = findPlayerByName(data.name);
  console.log(data.chat);
  if(chatPlayer){
    chatPlayer.sendMsg(data.chat);
  }else{
    console.log(data.name+" : user not found");
  }
});

socket.on("logout", function(name){
  console.log(name+" logged out");
  removePlayerByName(name);
});

socket.on('move', function(data){
  let movingPlayer = findPlayerByName(data.name);
  if(movingPlayer){
    movingPlayer.setState(data);
  } else {
    console.log(data.name + ": user not found");
  }
});

socket.on('msg', function(data){
  // let newEntry = document.createElement("span"),
  // chatLog = document.querySelector(".chat-log");
  // chatMsg = "[수신]"+ data.from + ": " + data.chat;
  // console.log(chatMsg);
  // newEntry.className = "whisper-chat";
  // // newEntry.appendChild(document.createTextNode(chatMsg));
  // screenText.updateText(chatMsg, h-chatBar.barH, screenText.fontS*2, "#4f4");
  // chatLog.insertBefore(newEntry, chatLog.childNodes[0]);
  let receivePlayer = findPlayerByName(data.to);
  if(receivePlayer){
    receivePlayer.sendMsg("/msgTo"+" "+data.from+" "+data.chat);
  }else{
    console.log(data.to + ": user not found");
  }
});

socket.on('noUser', function(data){
  let sendPlayer = findPlayerByName(data.from);
  if(sendPlayer){
    sendPlayer.sendMsg("/msgFrom"+" "+data.to+" "+data.chat);
  }else{
    console.log(data.from +": user error");
  }
});


var canvas = document.getElementsByTagName("canvas")[0],
  // canvas dimensions
  w = 1500,
  h = 900,
  // scale, keep at 2 for best retina results
  s = 2;
var ctx = canvas.getContext("2d");

var pushedKey = [];

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
    form.setAttribute("id","canvasTxt");
    form.action = "";
    form.style.padding = this.margin + "px";
    form.style.width = (canvas.width / s) + "px";
    form.style.height = (this.barH) + "px";
    form.style.transform = "translateY(" + (-this.barH) + "px)";
    // text input
    field.setAttribute("id","inputTxt");
    field.type = "text";
    field.style.fontSize = (this.barH * 0.4) + "px";
    field.style.height = (this.barH - this.margin * 2) + "px";
    field.style.padding = "0 " + this.margin + "px";
    field.maxLength = 64;
    // send button
    btn1.setAttribute("id","button1");
    btn1.className = "send";
    btn1.style.fontSize = (this.barH * 0.4) + "px";
    btn1.style.height = (this.barH - this.margin * 2) + "px";
    btn1.disabled = "disabled";
    // view chat button
    btn2.setAttribute("id","button2");
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
control = function(avatar) {
  // avatar.dir values: 0 = up, 1 = right, 2 = down, 3 = left
  if (!chatBar.active) {
    avatar.isMoving = true;
    avatar.canMove = true;
    switch (pushedKey[pushedKey.length-1]) {
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
  if(pushedKey.length != 0)
    control(player);
  setTimeout(runDisplay, 1000 / 60);
},

start = function() {
  chatBar.create();

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

socket.on('loginFail', function(){
  alert("Change Your Name");
  window.location.reload();
});

socket.on('loginSuccess', function(name) {
  player = new Avatar(name, Mygender, 0, randNum(10, w-10), randNum(10, h-30),
  1, dir=2, isSelf=true);
  worldObjs[0] = player;
  socket.emit("login", {
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

    if(e.keyCode >= 37 && e.keyCode <= 40){
      if(!pushedKey.includes(e.keyCode)){
        pushedKey.push(e.keyCode);
      }
    }

    if(e.keyCode == 16){
      player.speed=6;
    }

    // Send button availability
    setTimeout(function() {
      send.disabled = field.value.length > 0 ? "" : "disabled";
    }, 10);

    // move only if not using chat
    if (!chatBar.active) {
      //control(player);

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
  document.addEventListener("keyup", function(e) {
    if(e.keyCode == 16){
      player.speed = 4;
    }

    removeElemByKey(pushedKey, e.keyCode);
    console.log("delete : "+e.keyCode);
    console.log(pushedKey);
    if(pushedKey.length == 0)
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
      let isCmd = false;
      // update last message if not a command
      if (field.value[0] != "/") {
        isCmd = false;
      } else {
        isCmd = true;
      }
      if(!isCmd){
        socket.emit("chat", {
          name : player.name,
          chat : field.value
        });
      }
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


<<<<<<< HEAD
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

var name = makeRandomName();
socket.emit('nameCheck', name);
=======
var Randomname = makeRandomName();
document.querySelector('#username').placeholder = Randomname;
document.addEventListener('DOMContentLoaded',function(){
  document.querySelector('#form').addEventListener("submit",function(e){
    e.preventDefault();
    var MyName = document.querySelector('#username').value;
    if(MyName==""){
      MyName = Randomname;
    }
    var lst = MyName.split(" ");
    if(lst.length>1){
      MyName="";
      for (var index in lst){
        MyName += lst[index];
      }
    }
    var genderStr = document.querySelector('input[name="gender"]:checked').value;
    if(genderStr == "m"){
      Mygender = 0;
    }else{
      Mygender = 1;
    }
    socket.emit('nameCheck', MyName);
    document.querySelector('#form').style.display="none";
  });
});
>>>>>>> aa0c001dd8ae00c769ac14bcb44bf31722e623e7
