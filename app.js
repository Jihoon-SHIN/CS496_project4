var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname+'/chatroom_client'));

server.listen(3000, function () {
  console.log('Socket IO server listening on port 3000');
});

var playerList = {}, maxPlayerNum=0;

io.on('connection', function(socket){
  socket.on('login', function(data){
    console.log("Client logged-in:\n name:"+data.name+"\n userid: "+data.userid);

    socket.name = data.name;
    socket.userid = data.userid;
    socket.broadcast.emit('login', data);

    for(var player in playerList){
      var playerData = playerList[player];
      socket.emit("login", {
        userid: player,
        name: playerData.name,
        gender: playerData.gender,
        skinTone: playerData.skinTone,
        x: playerData.x,
        y: playerData.y,
        curFrame: playerData.curFrame,
        dir: playerData.dir
      });
    }
    playerList[socket.userid] = data;
  });

  socket.on('move', function(data){
    socket.broadcast.emit('move', data);
  });

  socket.on('genUserId', function(){
    maxPlayerNum++;
    socket.emit('genUserId', maxPlayerNum);
  });

  socket.on('chat', function (data) {
    console.log('Messsage from '+ data.userid+' : '+data.chat);
    socket.broadcast.emit('chat', data);
  });

  socket.on('forceDisconnect', function () {
    socket.disconnect();
  });

  socket.on('disconnect', function () {
    console.log('user disconnected: '+socket.name);
    delete playerList[socket.userid];
    io.emit('logout', socket.userid);
  });
});
