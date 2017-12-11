/**
 * Created by lauradouglas on 2017-12-09.
 */
var express = require('express');
var http = require('http');
var io = require('socket.io');
var path = require('path');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000);
console.log('app listening on port 3000');