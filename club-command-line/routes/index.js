module.exports = function(app,io){


  io.on('connection', function(socket){
    socket.worldObjs = [];
    socket.on('login',function(data){

      console.log('Client logged-in:\n name:' + data.name + '\n character skin type: ' + data.skin+ "gender "+data.gender);
      socket.name = data.name;
      socket.gender = data.gender;
      socket.skin = data.skin;

      socket.broadcast.emit('login', socket.worldObjs);
      socket.worldObjs.push(data);
    });

    socket.on('chat', function(data){
      console.log('Message from %s: %s', socket.name, data.msg);
      var msg = {
        from: {
          name : socket.name,
          gender: socket.gender,
          skin: socket.skin
        },
        msg: data.msg
      };
      //메세지를 전송한 클라이언트 제외하고 다른 모든 클라이언트에게 메세지 전송
      socket.broadcast.emit('s2c chat', msg);
    });

    socket.on('move',function(data){
      console.log('name('+socket.name+') move start from ' + data.pos + 'to '+data.dir);

      var moving = {
        from: {
          name : socket.name,
          gender : socket.gender,
          skin : socket.skin
        },
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
