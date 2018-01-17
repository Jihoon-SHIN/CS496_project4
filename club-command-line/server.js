var app = require('express')();
var express = require('express');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname+'/www'));
var router = require('./routes')(app,io);
var playerList = [];
var port = process.env.PORT || 3000;

server.listen(port,function(){
    console.log('Socket IO server listening on port '+port);
});
