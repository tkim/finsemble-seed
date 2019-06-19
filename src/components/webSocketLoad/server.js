/*
Small node js server that makes a socket connect and sends json data.

There is currently a problem where the stack is running out of memory sending a large file many times
There is a command to increase server memory allocation with --max_old_space_size, but there is a bug with this command
that will seg fault if you set it to 2048 or more. However, even slowing down the rate of request still has this problem,
so socket.io is not releasing memory properly or the server is getting throttled responding to to many requests and doesn't have
time to garbage collect
*/
var http = require('http');
var fs = require('fs');
var express = require('express');
var counter = 0;

//Loading the file index.html displayed to the client
// var server = http.createServer(function(req, res) {
//     fs.readFile('./index.html', 'utf-8', function(error, content) {
//         res.writeHead(200, {"Content-Type": "text/html"});
//         res.end(content);
//     });
// });
var app = express();
var server = http.createServer(app);

// Loading socket.io
var io = require('socket.io').listen(server);

fs.readFile('largefile.json', 'utf-8', function(error, data) {
    if (error) throw error;
    jsonData = JSON.parse(data);
});

io.sockets.on('connection', function (socket) {
	console.log('You are connected!');
	// When the client connects, they are sent a message
    socket.emit('message', 'You are connected!');

    // When a "message" is received (click on the button), it's logged in the console
    socket.on('request_data', function (message) {
        console.log('Client message: ' + message, ++counter);
        //send the json data
        //may want to slow this down with a setTimeout to see if it helps memory events.
        socket.emit('message', jsonData);
    });
});


server.listen(8080);