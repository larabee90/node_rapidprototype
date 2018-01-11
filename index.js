/**
 * Created by lauradouglas on 2017-12-09.
 */
var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var path = require('path');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var server =  http.createServer(app);
var io = socketio.listen(server);
server.listen(3000);
// app.listen(3000);
console.log('app listening on port 3000');
// var io = socketio.listen(server);

var linesDrawn = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

    // first send the history to the new client
    for (var i in linesDrawn) {
        socket.emit('draw_line', { line: linesDrawn[i] } );
    }

    // add handler for message type "draw_line".
    socket.on('draw_line', function (data) {
        // add received line to history
        linesDrawn.push(data.line);
        // send line to all clients
        io.emit('draw_line', { line: data.line });
    });
});
