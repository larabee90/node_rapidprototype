/**
 * Created by lauradouglas on 2017-12-09.
 */

/**
 * Created by lauradouglas on 2017-12-09.
 */


var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var app = express();


var server =  http.createServer(app).listen(3000);
var io = socketio(server);

app.use(express.static('./public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var linesDrawn = [];

var users = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

    // first send the history to the new client
    for (var i in linesDrawn) {
        socket.emit('draw_line', { line: linesDrawn[i] } );
    }

    // add handler for message type "draw_line".
    socket.on('draw_line', function (data, colour) {
        // add received line to history
        linesDrawn.push(data.line);
        // send line to all clients
        io.emit('draw_line', { line: data.line }, colour);
    });

    socket.on("chat", function(message, user, colour) {
        io.emit("message", message, user, colour);
        console.log(message);
    });

    socket.on("newTemplate", function(img){
        io.emit("drawTemplate", img);
    });

    socket.on("addUsername", function(username, colour) {
        console.log("new user added: " + username + ", their colour is " + colour);
        users.push(username);
        io.emit("newUser", username, colour);

    });

    //socket.emit("message", "Welcome to Cyber Chat");
});


console.log('app listening on port 3000');



