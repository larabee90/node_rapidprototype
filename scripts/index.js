/**
 * Created by lauradouglas on 2017-12-09.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile('index.html', {'root': './'});
});

http.listen(3000, function(){
    console.log('listening on port 3000');
});