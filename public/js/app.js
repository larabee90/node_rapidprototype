/**
 * Created by lauradouglas on 2017-12-11.
 */

///////////////////////////////////////////////////
$( document ).ready(function() {


$("#titleContainer").hide();

var colours = ["red", "green", "blue"];
var username = "";
var userColour =  "";
var isLoggedIn = false;
var users= [];
var titleIsSet = false;


var loginContainer = document.getElementById("loginContainer");
var enterUsername = document.getElementById("enterUsername");
var usernameInput = document.getElementById("usernameInput");
var usernameSubmit = document.getElementById("usernameSubmit");

var projectTitle = "";

// get canvas element and create context
var canvas = document.getElementById('paintCanvas');
var canvasContainer = document.getElementById('canvasContainer');
var context = canvas.getContext('2d');

//connection

var socket = io.connect();

socket.on("disconnect", function() {
    console.log("disconnected");
});

socket.on("connect", function() {
    console.log("connected");
});


// Initialize Firebase
var config = {
    apiKey: "AIzaSyCO_ZMnTNY_WwmbfYoZ-6TAyAqML0Zta5s",
    authDomain: "teamproto-192820.firebaseapp.com",
    databaseURL: "https://teamproto-192820.firebaseio.com",
    projectId: "teamproto-192820",
    storageBucket: "teamproto-192820.appspot.com",
    messagingSenderId: "201860244753"
};
firebase.initializeApp(config);


var provider = new firebase.auth.GoogleAuthProvider();

$('#googleSignIn').click(function(){
    firebase.auth().signInWithRedirect(provider);
});

$('#googleSignOut').click(function(){
   firebase.auth().signOut();
});

firebase.auth().getRedirectResult().then(function(result) {

    if( result.credential ) {
        var token = result.credential.accessToken;
        var user = result.user;

        firebase.database().ref('users/' + user.uid).set({
            name: user.displayName,
            email: user.email,
            token: token,
            user: user.uid
        });
    }

}).catch(function(error) {
    console.log( error.code );
    console.log( error.message );
});

firebase.auth().onAuthStateChanged(function(user){
    if(user)
    {
        console.log( 'LOGGED IN' );
        console.log( user.displayName );
        username = user.displayName;
        isLoggedIn = true;
        socket.emit("addUsername", username);
        $(loginContainer).hide();
    } else {
        isLoggedIn = false;
        $(loginContainer).show();
        $('#activeUsers').css('z-index', -9999);
    }
});

//mouse properties
var mouse = {
    click: false,
    move: false,
    pos: {x: 32, y: 132},
    pos_prev: false
};

var width = 742;
var height = 600;

function respondCanvas() {
    canvas.width = $('#canvasContainer').width();
    canvas.height = $('#canvasContainer').height();
};

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


//message related

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
    socket.emit("chat", input.value, username, userColour);
    input.value = '';
};

function printMessage(message, user, colour) {
    var p = document.createElement("p");
    console.log(message, user, colour);
    p.innerHTML = "<span style = 'color:" + colour + "'>" + user + ": </span>" + message;

    $("#messages")[0].appendChild(p);
}

//Template buttons
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


//makes new user legend circle
socket.on("newUser", function (user, colour, userID) {
    if (isLoggedIn) {

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

//makes hover label for the user legend
function makeUserLabel (user, userID) {
    var activeUser = document.getElementById(userID);

    //makes the hover element
    var newUserHover = document.createElement("p");

    //give class and id
    $(newUserHover).addClass("userHover");
    newUserHover.id = "hover" + user;

    $(activeUser).hover(function(){

            var x =   $(activeUser).offset().left + 4;
            var y = $(activeUser).offset().top - 34;

            $(newUserHover).css({
                "top": y,
                "left": x
            });

            newUserHover.innerText = user;
            document.getElementsByTagName("body")[0].appendChild(newUserHover);
        },

        function() {
            console.log("unhovered");
            $(newUserHover).remove();
        }
    );
}

//project title change
document.forms[0].onsubmit = function () {

    var input = document.getElementById("titleInput");
    //printMessage(input.value);
    socket.emit("setProjectTitle", input.value);
    input.value = '';
    $("#titleContainer").hide();


};

//shows project title change window if it's first user

socket.on("showTitleWindow", function(title){
    $("#titleContainer").show();

});

//changes the project title on top

socket.on("changeProjectTitle", function(title){
    document.getElementById("title").innerHTML = title;
    titleIsSet = true;
});


//assign user a colour for the legend

socket.on("assignColour", function(colour){
    userColour = colour;
});


//download the canvas

function downloadCanvas(link, canvas, filename) {
    link.href = document.getElementById(canvas).toDataURL();
    link.download = filename;
}

document.getElementById('download').addEventListener('click', function() {
    downloadCanvas(this, 'paintCanvas', 'team-proto.png');

}, false);



});



