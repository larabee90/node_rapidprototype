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



console.log('app listening on port 3000');


// event-handler for new incoming connections
io.on("connection", function(socket) {

    socket.on("chat", function(message) {
        io.emit("message", message);

        console.log(message);
    });

    socket.emit("message", "Welcome to Cyber Chat");

});

console.log("Starting Socket App - http://localhost:3000");