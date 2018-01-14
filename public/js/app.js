/**
 * Created by lauradouglas on 2017-12-11.
 */

///////////////////////////////////////////////////
$( document ).ready(function() {
    var colours = ["red", "green", "blue"];
    var username = "";
    var userColour =  "";
    var connected = false;
    var typing = false;
    var lastTypingTime;

    var loginContainer = document.getElementById("loginContainer");
    var enterUsername = document.getElementById("enterUsername");
    var usernameInput = document.getElementById("usernameInput");
    var usernameSubmit = document.getElementById("usernameSubmit");


    var mouse = {
        click: false,
        move: false,
        pos: {x: 0, y: 0},
        pos_prev: false
    };
    // get canvas element and create context
    var canvas = document.getElementById('paintCanvas');
    var context = canvas.getContext('2d');
    // var width   = window.innerWidth * 0.60;
    // var height  = window.innerHeight * 0.50;
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
        // if (mouse.click === true) {
        //     if (mode === 'eraser'){
        //         context.strokeStyle = '#ffffff';
        //         context.stroke();
        //     }
        // }
    };

    $('#penMode').click(function(){
        tool = 'pen';
    });

    $('#eraserMode').click(function(){
       tool = 'eraser';
    });

    // draw line received from server
    socket.on('draw_line', function (data, colour) {
        var line = data.line;
        context.beginPath();
        context.moveTo(line[0].x * width - canvas.offsetLeft, line[0].y * height - canvas.offsetTop);
        context.lineTo(line[1].x * width - canvas.offsetLeft, line[1].y * height - canvas.offsetTop);
        context.lineWidth = 5;
        context.lineCap = 'round';
        if (tool === 'eraser') {
            colour = '#ffffff';
            context.strokeStyle = colour;
        } else {
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
            socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ] }, userColour);
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
    setTitle("Disconnected");
});

socket.on("connect", function() {
    setTitle("Connected to Cyber Chat");
});

    socket.on("message", function (message, user, colour) {
        printMessage(message, user, colour);
    });


    document.forms[0].onsubmit = function () {
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

        document.querySelector("div.messages").appendChild(p);
    }

//button tings


var canvas = document.getElementById('paintCanvas');
var context = canvas.getContext('2d');
var img = document.createElement("img");

function drawTemplate(template) {
    // document.getElementById('templateImage').appendChild(img);
    templateDiv = document.getElementById('templateImage');
    backgroundImg = template;

    templateDiv.style.backgroundImage = backgroundImg;
    templateDiv.style.backgroundRepeat = 'no-repeat';
    templateDiv.style.backgroundPosition = 'center';
    console.log('bg');
    // context.clearRect(0,0,canvas.width, canvas.height);
    // var img = document.createElement("img");
    //
    // img.onload = function () {
    //     imgWidth = img.width * 0.6;
    //     imgHeight = img.height * 0.6;
    //     centerHor = canvas.width / 2 - imgWidth / 2;
    //     centerVert = canvas.height / 2 - imgHeight / 2;
    //     context.drawImage(img, centerHor, centerVert, imgWidth, imgHeight);
    // };
    // img.src = template;
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
        console.log("new user added: " + user);
        console.log(user + " colour is " + colour);
        var newUser = document.createElement("div");
        $(newUser).addClass("activeUser");
        $(newUser).css("background-color" , colour);
        document.getElementById("activeUsers").appendChild(newUser);
        colours.shift();

    });


    usernameSubmit.onclick = function () {
        username = usernameInput.value
        socket.emit("addUsername", username);
        $(loginContainer).hide()

    };

    socket.on("assignColour", function(colour){
        userColour = colour;
        console.log(colour);
    })


//var $currentInput = $usernameInput.focus();

});