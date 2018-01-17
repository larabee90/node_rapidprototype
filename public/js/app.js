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
    var isLoggedIn = false;
    var scale = 1.0;
    var users= [];


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
    var canvasContainer = document.getElementById('canvasContainer');
    var context = canvas.getContext('2d');



    var width = $('#canvasContainer').width();
    var height = $('#canvasContainer').height();

    function respondCanvas(){
        canvas.width =  $('#canvasContainer').width();
        canvas.height =  $('#canvasContainer').height();
    };




    $(window).resize(respondCanvas())

    var socket = io.connect();
    respondCanvas();


    // set canvas width and height
    // canvas.width = width;
    // canvas.height = height;

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

    });

    // main loop, running every 25ms
    function mainLoop() {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
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
        if (isLoggedIn) {

            printMessage(message, user, colour);
        } else {
          console.log("User has not yet logged in");
        };

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
        console.log(message, user, colour);
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

    //active user hover


    function makeUserLabel (user, userID) {

            var activeUser = document.getElementById(userID);

            //makes the hover element
            var newUserHover = document.createElement("p");

            //give class and id
            $(newUserHover).addClass("userHover");
            newUserHover.id = "hover" + user;




            //
            // console.log(activeUserPosition.x, activeUserPosition,y);
            //
            // //change the position so its just under the name
            // $(userHoverId).css({"top": yPositionHover, "left": activeUserPosition.x});

            $(activeUser).hover(

                function(){
                    console.log("hovered");

                    var x =   $(activeUser).offset().left + 4;

                    //still need to lower this a bit
                    var y = $(activeUser).offset().top - 34;

                    $(newUserHover).css({
                        "top": y,
                        "left": x

                    })
                    newUserHover.innerText = user;
                    document.getElementsByTagName("body")[0].appendChild(newUserHover);
                    console.log(activeUser.id);

                },
                function() {
                    console.log("unhovered");
                    $(newUserHover).remove();
                }

            );


    }

    socket.on("newUser", function (user, colour, userID) {
        if (isLoggedIn) {
            console.log("new user added: " + user);
            console.log(user + " colour is " + colour);

            var newUser = document.createElement("div");
            $(newUser).addClass("activeUser");
            newUser.id = userID.toString();
            $(newUser).css("background-color" , colour);
            document.getElementById("activeUsers").appendChild(newUser);
            colours.shift();
            users.push(user);
            makeUserLabel(user, userID);

        }
    });





    document.getElementById("loginForm").onsubmit = function () {
        username = usernameInput.value
        isLoggedIn = true;
        socket.emit("addUsername", username);
        $(loginContainer).hide();


    };

    socket.on("assignColour", function(colour){
        userColour = colour;
        console.log(colour);
    });

    function downloadCanvas(link, canvas, filename) {
        link.href = document.getElementById(canvas).toDataURL();
        link.download = filename;
    }

    document.getElementById('download').addEventListener('click', function() {
        downloadCanvas(this, 'paintCanvas', 'team-proto.png');
        
    }, false);






});



