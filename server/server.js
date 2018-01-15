var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var router = require('./routes')(app,io);

var port = process.env.PORT || 3000;

server.listen(port,function(){
    console.log('Socket IO server listening on port '+port);
});
