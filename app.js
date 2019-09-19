var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const MongoClient = require('mongodb').MongoClient;


var mongoDatabase = null;
var mongoRecordings = null;
// Use connect method to connect to the server
MongoClient.connect('mongodb://159.203.179.131:27017', function(err, client) {
    console.log("Connected successfully to server");

    mongoDatabase = client.db('jelly');
    mongoRecordings = mongoDatabase.collection('recordings');
});


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
        const room = data['room'];
        const event = data['event'];
        const time = data['time'];

        io.to(room).emit('broadcastMIDIEvent', { data: event, time: time });
    });

    client.on('message', function(msg) {
        console.log("Message received: " + msg);
    });

    client.on('saveMidi', function(data) {
        const recordingTitle = data['title'];
        const eventData = data['data'];

        const query = { "title": recordingTitle }
        const update = { $push: { events: eventData } };
        mongoRecordings.updateOne(query, update, { upsert: true }, function(err, res) {
            if (err) throw err;
        });
    });
});

server.listen(4200);