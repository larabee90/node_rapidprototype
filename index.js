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

var messages=[];

var linesDrawn = [];

var users = [];
var nextID = 0;

var coloursAvailable = ["#FA4C61", "#52A2FF", "#50E3C2", "#F8E71C"];

// event-handler for new incoming connections
io.on('connection', function (socket) {

    //// NEW CANVAS
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

    ///// NEW MESSAGE SENT

    socket.on("chat", function(message, user, colour) {

        //delete welcome message if this is the first message sent to chat
        if(messages.length === 0){

            io.emit("deleteWelcomeMessage");
        }

        //emit message to all users
        io.emit("message", message, user, colour);

        //add new message to messages array
        var newMessage = {
            'username': user,
            'colour': colour,
            'message': message
        }
        messages.push(newMessage);

    });

    socket.on("newTemplate", function(img){
        io.emit("drawTemplate", img);
    });

    ///// NEW USER ADDED

    socket.on("addUsername", function(username) {

        //add new users to the list of actives
        var user = {

            'name': username,
            'colour': coloursAvailable[0],
            'userID': nextID
        };

        users.push(user);
        nextID++;


        //get all the active users indicated at top right for new user
        for(i = 0; i < users.length; i++) {
            console.log("loop works");
            console.log(users.length);
            socket.emit("newUser", users[i].name , users[i].colour, users[i].userID);

        }
        //delete instructions in messages div if there have already been messages posted
        if(messages.length !== 0){

            socket.emit("deleteWelcomeMessage");
        };


        //get all the messages that have been sent to the chat before the new user signed in
        for(i=0; i<messages.length; i++){

            socket.emit("message", messages[i].message, messages[i].username, messages[i].colour);
        }

        //assign new user an available colour
        socket.emit("assignColour", user.colour);

        //add new users to active user's legend (top right) in previously signed in users interface
        socket.broadcast.emit("newUser", username, user.colour);

        //delete colour assigned from array
        coloursAvailable.shift();


    });

});


console.log('app listening on port 3000');



