module.exports = function(app,io){
  app.get('/',function(req,res){
    console.log('/ IN');


  });

  io.on('connection', function(socket){
    socket.on('login',functino(data){
      console.log('Client logged-in:\n name:' + data.name + '\n character type: ' + data.character);
      socket.name = data.name;
      socket.character = data.character;

      io.emit('login', data.name);
    });

    socket.on('chat', function(data){
      console.log('Message from %s: %s', socket.name, data.msg);

      var msg = {
        from: {
          name : socket.name,
          character: socket.character
        },
        msg: data.msg
      };
      //메세지를 전송한 클라이언트 제외하고 다른 모든 클라이언트에게 메세지 전송
      socket.broadcast.emit('s2c chat', msg);
    });

    socket.on('move',function(data){
      console.log('name('+socket.name+') move start from ' + data.pos + 'to '+data.dir);

      var moving  {
        from: {
          name : socket.name,
          character : socket.character
        }
        pos : data.pos,
        dir : data.dir
      };

      socket.broadcast.emit('s2c move',moving);
    })

    socket.on('forceDisconnect',function(){
      socket.disconnect();
    });

    socket.on('disconnect', function(){
      console.log('user disconnected: '+socket.name);
    });
  });

}
