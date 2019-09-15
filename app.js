var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/dist'));
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/dist/index.html');
});

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
        client.join(data['room']);
        io.to(data['room']).emit('message', 'User joined the room');
    });

    client.on('leave', function(data) {
        console.log(data);
        client.leave(data['room']);
        io.to(data['room']).emit('message', 'User left the room');
    });

    client.on('broadcast', function(data) {
        room = data['room'];
        event = data['event'];

        io.to(room).emit('broadcastMIDIEvent', event);
    });

    client.on('message', function(msg) {
        console.log("Message received: " + msg);
    })
});

server.listen(4200);