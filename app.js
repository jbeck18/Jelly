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

    client.on('join', function(room) {
        console.log(room);
        client.join(room);
        io.to(room).emit('message', 'DID THIS REALLY JUST WORK!?!?');
    });

    client.on('message', function(msg) {
        console.log("Message received: " + msg);
    })
});

server.listen(4200);