var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname+'/chatroom_client'));

server.listen(3000, function () {
  console.log('Socket IO server listening on port 3000');
});

var playerList = {};

io.on('connection', function(socket){

  socket.on('nameCheck', function(name){
    console.log("nameCheck IN");
    //console.log(name);
    function chkNameDuplicated(name){
      for(var p in playerList)
        if(playerList[p].name == name)
          return true;
      return false;
    }
    if(chkNameDuplicated(name)){
      console.log("Name "+name+" duplicate");
      socket.emit('loginFail', null);
      return;
    }
    console.log("To loginSuccess server");
    socket.emit('loginSuccess', name);
  });

  socket.on('login', function(data){
    console.log("Client logged-in:\n name:"+data.name+"\n socket id: "+socket.id);

    socket.name = data.name;
    socket.broadcast.emit('anotherUser', data);

    for(var socketid in playerList){
      var playerData = playerList[socketid];
      console.log("user already exists : "+playerData.name);
      socket.emit('anotherUser', playerData);
    }
    playerList[socket.id] = data;
  });

  socket.on('move', function(data){
    socket.broadcast.emit('move', data);
  });

  socket.on('chat', function (data) {
    console.log('Messsage from '+ data.name+' : '+data.chat);
    socket.broadcast.emit('chat', data);
  });
  socket.on('msg', function(data){
    console.log('Message from '+ data.from + " to " + data.to +" "+ data.chat);
    let flag = true;
    for(var socketid in playerList){
      var playerData = playerList[socketid];
      if(playerData.name == data.to){
        flag = false;
        io.to(socketid).emit('msg', data);
      }
    }
    if(flag){
      socket.emit('noUser', data);
      console.log('There is no '+ data.to);
    }
  });

  socket.on('forceDisconnect', function () {
    socket.disconnect();
  });

  socket.on('disconnect', function () {
    console.log('user disconnected: '+socket.name);
    delete playerList[socket.id];
    io.emit('logout', socket.name);
  });
});
