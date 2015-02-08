var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000;
var io = require('socket.io')(http);

app.use(express.static(__dirname));

var connectionCounter = 0;

app.get('/', function (request, response) {

    response.sendFile(__dirname + '/index.html', { root: './' });
});

io.on('connection', function (socket) {

    ++connectionCounter;

    // Send status info to new client
    socket.emit('status', { players: connectionCounter });

    socket.on('turn', function (data) {

        // Forward data to another player
        socket.broadcast.emit('turn', data);
    });

    socket.on('disconnect', function () {

        --connectionCounter;
    });

});

http.listen(port, function () {

    console.log('Listening on *:' + port);
});
