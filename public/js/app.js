/**
 * Created by lauradouglas on 2017-12-11.
 */

///////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function() {
    var mouse = {
        click: false,
        move: false,
        pos: {x:0, y:0},
        pos_prev: false
    };
    // get canvas element and create context
    var canvas  = document.getElementById('paintCanvas');
    var context = canvas.getContext('2d');
    // var width   = window.innerWidth * 0.60;
    // var height  = window.innerHeight * 0.50;
    var width   = 600;
    var height  = 500;
    var socket  = io.connect();




    function drawIphone() {
        var img = document.createElement("img");

        img.onload = function () {
            imgWidth = 208;
            imgHeight = 430;
            centerHor = canvas.width / 2 - imgWidth / 2;
            centerVert = canvas.height / 2 - imgHeight / 2;
            context.drawImage(img, centerHor, centerVert, imgWidth, imgHeight);
        };
        img.src = "../img/iPhoneTemplate.png";
    }




    // set canvas width and height
    canvas.width = width;
    canvas.height = height;

    // register mouse event handlers
    canvas.onmousedown = function(e){ mouse.click = true; console.log(mouse.pos) };
    canvas.onmouseup = function(e){ mouse.click = false; };


    canvas.onmousemove = function(e) {
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;
    };


    // draw line received from server
    socket.on('draw_line', function (data) {
        var line = data.line;
        context.beginPath();
        context.moveTo(line[0].x * width - canvas.offsetLeft, line[0].y * height - canvas.offsetTop);
        context.lineTo(line[1].x * width - canvas.offsetLeft, line[1].y * height - canvas.offsetTop);
        context.stroke();
    });

    // function getMousePos(canvas, evt) {
    //     var rect = canvas.getBoundingClientRect(), // abs. size of element
    //         scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
    //         scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
    //
    //     return {
    //         x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    //         y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    //     }
    // }

    // main loop, running every 25ms
    function mainLoop() {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
            socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ] });
            mouse.move = false;
        }
        mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
        setTimeout(mainLoop, 25);
    }
    mainLoop();
    });



//////////////////////////////////////

//chat tings

var socket = io("http://localhost:3000");

socket.on("disconnect", function() {
    setTitle("Disconnected");
});

socket.on("connect", function() {
    setTitle("Connected to Cyber Chat");
});

socket.on("message", function(message) {
    printMessage(message);
});


document.forms[0].onsubmit = function () {
    var input = document.getElementById("message");
    //printMessage(input.value);
    socket.emit("chat", input.value);
    input.value = '';
};

function setTitle(title) {
    document.querySelector("h1").innerHTML = title;
}

function printMessage(message) {
    var p = document.createElement("p");
    p.innerText = message;
    document.querySelector("div.messages").appendChild(p);
}

//button tings

function drawTemplate() {

    var canvas  = document.getElementById('paintCanvas');
    var context = canvas.getContext('2d');
    var img = document.createElement("img");

    img.onload = function () {
        imgWidth = 208;
        imgHeight = 430;
        centerHor = canvas.width / 2 - imgWidth / 2;
        centerVert = canvas.height / 2 - imgHeight / 2;
        context.drawImage(img, centerHor, centerVert, imgWidth, imgHeight);
    };
    img.src = "../img/iPhoneTemplate.png";

}

socket.on ("drawTemplate", function() {
    drawTemplate();
});

document.getElementById("mobileButton").onclick = function () {
    console.log("onclick works");
    socket.emit("mobile");




};
