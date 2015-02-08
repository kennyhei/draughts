var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000;
var io = require('socket.io')(http);

app.use(express.static(__dirname));

var playerCount = 0;

app.get('/', function (request, response) {

    response.sendFile(__dirname + '/index.html', { root: './' });
});

io.on('connection', function (socket) {

    ++playerCount;

    // Send info to everyone about number of connected players
    io.emit('players', { clients: playerCount });

    // Send status info to new client
    socket.emit('status', { players: playerCount });

    socket.on('turn', function (data) {

        // Forward data to another player
        socket.broadcast.emit('turn', data);
    });

    socket.on('highlight', function (data) {

        // Forward data to another player
        socket.broadcast.emit('highlight', data);
    });

    socket.on('disconnect', function () {

        io.emit('players', { clients: --playerCount });
    });

});

http.listen(port, function () {

    console.log('Listening on *:' + port);
});
