/**
 * Created by lauradouglas on 2017-12-11.
 */

///////////////////////////////////////////////////
$( document ).ready(function() {
    var colours = ["red", "green", "blue"];
    var username = "";
    var userColour =  "";
    var typing = false;
    var lastTypingTime;


    var loginContainer = document.getElementById("loginContainer");
    var enterUsername = document.getElementById("enterUsername");
    var usernameInput = document.getElementById("usernameInput");
    var usernameSubmit = document.getElementById("usernameSubmit");

    var mouse = {
        click: false,
        move: false,
        pos: {x: 32, y: 132},
        pos_prev: false
    };
    // get canvas element and create context
    var canvas = document.getElementById('paintCanvas');
    var context = canvas.getContext('2d');
    var width = 600;
    var height = 500;
    var socket = io.connect();

    // set canvas width and height
    canvas.width = width;
    canvas.height = height;

    var tool = 'pen';


    // register mouse event handlers
    canvas.onmousedown = function(e){ mouse.click = true; };
    canvas.onmouseup = function(e){ mouse.click = false; };

    canvas.onmousemove = function(e) {
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;

    };

    $('#penMode').click(function(){
        tool = 'pen';
    });

    $('#eraserMode').click(function(){
       tool = 'eraser';
    });

    // draw line received from server
    socket.on('draw_line', function (data, colour, tool) {
        var line = data.line;
        context.beginPath();
        var rect = canvas.getBoundingClientRect();
        context.moveTo(line[0].x * width - rect.left, line[0].y * height - rect.top);
        context.lineTo(line[1].x * width - rect.left, line[1].y * height - rect.top);
        context.lineCap = 'round';
        if (tool === 'eraser') {
            colour = "#ffffff";
            context.lineWidth = 15;
            context.strokeStyle = colour;
        } else {
            context.lineWidth = 5;
            context.strokeStyle = colour;
        }
        context.stroke();
        console.log(context.strokeStyle);
    });

    // main loop, running every 25ms
    function mainLoop() {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
            console.log(userColour);
            socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ] }, userColour, tool);
            mouse.move = false;
        }
        mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
        setTimeout(mainLoop, 25);
    }
    mainLoop();

//////////////////////////////////////

//chat tings

var socket = io("http://localhost:3000");

    socket.on("disconnect", function() {

    });

    socket.on("connect", function() {

    });

    socket.on("deleteWelcomeMessage", function(){
        console.log("ran");
        $("#messages").empty();
    });

    socket.on("message", function (message, user, colour) {
        printMessage(message, user, colour);
    });


    document.forms[1].onsubmit = function () {
        var input = document.getElementById("message");
        //printMessage(input.value);
        socket.emit("chat", input.value, username, userColour);
        input.value = '';
    };


    function setTitle(title) {
        document.querySelector("h1").innerHTML = title;
    }

    function printMessage(message, user, colour) {
        var p = document.createElement("p");

        p.innerHTML = "<span style = 'color:" + colour + "'>" + user + ": </span>" + message;

        $("#messages")[0].appendChild(p);
    }

//button tings


var canvas = document.getElementById('paintCanvas');
var context = canvas.getContext('2d');
var img = document.createElement("img");

    function drawTemplate(template) {
        templateDiv = document.getElementById('templateImage');
        backgroundImg = template;

        templateDiv.style.backgroundImage = backgroundImg;
        templateDiv.style.backgroundRepeat = 'no-repeat';
        templateDiv.style.backgroundPosition = 'center';
        console.log('bg');
    };

socket.on("drawTemplate", function (template) {
        drawTemplate(template);
    });

mobileButton.onclick = function () {
    var img = "url(../img/iPhoneTemplate.png)";
    console.log("onclick works");
    socket.emit("newTemplate", img);
};

tabletButton.onclick = function () {
    var img = "url(../img/iPadTemplate.png)";
    console.log("onclick works");
    socket.emit("newTemplate", img);
};

desktopButton.onclick = function () {
    var img = "url(../img/desktopTemplate.png)";
    console.log("onclick works");
    socket.emit("newTemplate", img);
};

//login tings

    socket.on("newUser", function (user, colour) {
        if (isLoggedIn) {
            console.log("new user added: " + user);
            console.log(user + " colour is " + colour);
            var newUser = document.createElement("div");
            $(newUser).addClass("activeUser");
            $(newUser).css("background-color" , colour);
            document.getElementById("activeUsers").appendChild(newUser);
            colours.shift();
        }
    });


    document.getElementById("loginForm").onsubmit = function () {
        username = usernameInput.value
        socket.emit("addUsername", username);
        $(loginContainer).hide();


    };

    socket.on("assignColour", function(colour){
        userColour = colour;
        console.log(colour);
    });

});