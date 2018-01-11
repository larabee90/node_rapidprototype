/**
 * Created by lauradouglas on 2017-12-11.
 */
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
    var width   = window.innerWidth;
    var height  = window.innerHeight;
    var socket  = io.connect();

    // set canvas to full browser width/height
    canvas.width = width;
    canvas.height = height;

    // register mouse event handlers
    canvas.onmousedown = function(e){ mouse.click = true; };
    canvas.onmouseup = function(e){ mouse.click = false; };

    canvas.onmousemove = function(e) {
        // normalize mouse position to range 0.0 - 1.0
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;
    };

    // draw line received from server
    socket.on('draw_line', function (data) {
        var line = data.line;
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
    });

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
//
// var canvas = document.getElementById('paintCanvas');
// var ctx = canvas.getContext('2d');
// ctx.lineWidth = 5;
// ctx.strokeStyle = "red";
// ctx.lineCap = "round";
// var isDrawing = false;
//
// //mouse events
// canvas.addEventListener('mousemove', drawingLine);
//
// canvas.addEventListener('mousedown', function(){
//     isDrawing = true;
//     ctx.beginPath();
//     ctx.moveTo(posX,posY);
//     canvas.addEventListener('mousemove', drawingLine);
// });
//
// canvas.addEventListener('mouseup', function(){
//     isDrawing = false;
// });
//
// //draw initial lines on canvas
// function drawingLine(evt){
//     posX = evt.pageX - canvas.offsetLeft;
//     posY = evt.pageY - canvas.offsetTop;
//
//     if (isDrawing === true) {
//         ctx.lineTo(posX, posY);
//         ctx.stroke();
//     }
// };
//
// function colourSwitch(color){
//     ctx.strokeStyle = color;
// };
//
// function changeWidth(lineWidth){
//     ctx.lineWidth = lineWidth;
// };
//
// //creating the pattern brush
// function makeBrush(){
//     var patternCanvas = document.createElement('canvas');
//     var circleWidth = 15;
//     var circleDistance = 5;
//     var patCtx = patternCanvas.getContext('2d');
//     patternCanvas.width = patternCanvas.height = circleWidth + circleDistance;
//
//     patCtx.fillStyle = "#9C27B0";
//     patCtx.beginPath();
//     patCtx.arc(circleWidth / 2, circleWidth / 2, circleWidth / 2, Math.PI * 2, false);
//     patCtx.closePath();
//     patCtx.fill();
//     return ctx.createPattern(patternCanvas, 'repeat');
// };
//
// //setting the function for the pattern brush; is called when button is clicked
// function drawPattern(){
//     ctx.lineWidth = 30;
//     ctx.strokeStyle = makeBrush();
// };
//
// //reset the canvas
// function clearCanvas(){
//     ctx.clearRect(0,0,canvas.width, canvas.height);
// };