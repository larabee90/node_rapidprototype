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

var coloursAvailable = ["#FA4C61", "#52A2FF", "#50E3C2", "#F8E71C"];


// event-handler for new incoming connections
io.on('connection', function (socket) {

    // first send the history to the new client
    for (var i in linesDrawn) {
        socket.emit('draw_line', { line: linesDrawn[i].line }, linesDrawn[i].colour, linesDrawn[i].tool );
    }

    // add handler for message type "draw_line".
    socket.on('draw_line', function (data, colour, tool) {
        // add received line to history
        var newLine = new Object()
        newLine.line = data.line;
        newLine.colour = colour;
        newLine.tool = tool;

        linesDrawn.push(newLine);
        // send line to all clients
        io.emit('draw_line', { line: data.line }, colour, tool);
    });

    socket.on("chat", function(message, user, colour) {
        console.log(colour);
        io.emit("message", message, user, colour);
        console.log(message);
    });

    socket.on("newTemplate", function(img){
        io.emit("drawTemplate", img);
    });

    socket.on("addUsername", function(username) {
        var user = {

            'name': username,
            'colour': coloursAvailable[0]

        };
        users.push(user);
        console.log(users);

        for(i = 0; i < users.length; i++) {

            console.log("loop works");
            socket.emit("newUser", users[i].name , users[i].colour);

        }
        socket.emit("assignColour", user.colour);

        socket.broadcast.emit("newUser", username, user.colour);
        coloursAvailable.shift();

    });

});


console.log('app listening on port 3000');



