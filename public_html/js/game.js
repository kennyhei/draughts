window.requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element){
        window.setTimeout(callback, 1000 / 1);
    };
})();

// Going global
var socket = io.connect();

var Shape = Isomer.Shape;
var Point = Isomer.Point;
var Path = Isomer.Path;
var Color = Isomer.Color;
var Cylinder = Shape.Cylinder;

var iso = new Isomer(document.getElementById("art"));
var listener = new window.keypress.Listener();

var canvas = document.getElementById("art");
var context = document.getElementById("art").getContext("2d");

var Colour = {

    WHITE: new Color(190, 190, 190),
    BLACK: new Color(50, 50, 50)

}

// For scaling canvas
var scale = 1;

var Game = (function () {

    var selected = null;
    var gameOver = false;
    var gameUpdate = true;

    var gameboard;
    var moves = null;

    var playerTurn = false;
    var playerColour;

    function getMouse (e) {
        var element = canvas, offsetX = 0, offsetY = 0, mx, my;

        // Compute the total offset
        if (element.offsetParent !== undefined) {
            do {
                offsetX += element.offsetLeft;
                offsetY += element.offsetTop;
            } while ((element = element.offsetParent));
        }

        mx = e.pageX - offsetX;
        my = e.pageY - offsetY;

        // We return a simple javascript object (a hash) with x and y defined
        return { x: mx, y: my };
    }

    function initPieces () {

        var offset = 0;

        // Black pieces
        for (var row = 0; row < 3; ++row) {

            _initRow(row, offset, Colour.BLACK);
            offset === 0 ? offset = 1 : offset = 0;
        }

        // White pieces
        for (var row = 7; row > 4; --row) {

            _initRow(row, offset, Colour.WHITE);
            offset === 0 ? offset = 1 : offset = 0;
        }
    }

    function _initRow (row, offset, color) {

        for (var column = 0; column < 4; ++column) {

            var piece = new Piece(column * 2 + offset, row, color);
            gameboard.pieces.push(piece);
        }

        offset === 0 ? offset = 1 : offset = 0;
    }

    function initSocketEvents () {

        socket.on('turn', function (data) {

            // Perform opponent's move
            var piece = gameboard.getPiece(data.pieceX, data.pieceY);
            var moveTo = data.movement;

            performMove(piece, moveTo);

            gameUpdate = true;
            playerTurn = true;
        });

        socket.on('highlight', function (data) {

            // Highlight opponent's piece
            var piece = gameboard.getPiece(data.pieceX, data.pieceY);

            piece.highlight(true);
            gameUpdate = true;
        });

        socket.on('status', function (data) {

            // First player starts the game
            if (data.players === 1) {
                playerTurn = true;
                playerColour = Colour.WHITE;
            } else {
                playerColour = Colour.BLACK;
            }
        })
    }

    function clickedPiece (mx, my) {

        for (var i = 0; i < gameboard.pieces.length; ++i) {

            var piece = gameboard.pieces[i];

            if (piece.contains(mx, my) && piece.color === playerColour) {

                selected = piece;
                gameUpdate = true;

                selected.highlight(true);

                // Highlight piece to opponent
                socket.emit('highlight', { pieceX: piece.x, pieceY: piece.y });

                return;
            }
        }
    }

    function performMove (selected, moveTo) {

        selected.move(moveTo.x, moveTo.y);
        selected.highlight(false);

        if (selected.isNextToBorder() && !selected.isPromoted()) {
            selected.promote();
        }

        // Munch
        if (moveTo['remove'] !== undefined) {
            var piece = moveTo['remove'];
            gameboard.removePieceAt(piece.x, piece.y);
        }
    }

    function movedPiece (mx, my) {

        if (selected !== null && moves !== null) {

            for (var i = 0; i < moves.length; ++i) {

                var moveTo = moves[i];

                if (selected.x === moveTo.x && selected.y === moveTo.y) {
                    continue;
                }

                var tile = gameboard.getTile(moveTo.x, moveTo.y);

                // Move selected piece here if this was the tile user clicked
                if (tile.contains(mx, my)) {

                    var data = {

                        pieceX: selected.x,
                        pieceY: selected.y,
                        movement: moveTo

                    };

                    performMove(selected, moveTo);

                    // Send movement data to opponent
                    socket.emit('turn', data);

                    selected = null;
                    moves = null;
                    playerTurn = false;

                    return;
                }
            }
        }
    }

    function init() {

        // Initialize gameboard with pieces
        gameboard = new GameBoard();
        initPieces();

        // Scale game
        $(window).resize(function () {

            var currentWidth = $("canvas").width();
            scale = currentWidth / canvas.width;

            gameboard.recalculate();
        });

        // Listen for mouse clicks
        canvas.addEventListener('mousedown', function (e) {

            // Not your turn
            if (playerTurn === false) {
                return;
            }

            var mouse = getMouse(e);
            var mx = mouse.x;
            var my = mouse.y;

            // Check if user clicked a piece
            clickedPiece(mx, my);

            // Check if user wants to move a selected piece
            movedPiece(mx, my);
        });

        // Socket events
        initSocketEvents();
    }

    function logic () {

        // Player has selected a piece, calculate possible moves
        if (selected) {
            moves = gameboard.possibleMoves(selected);
        }
    }

    function renderPossibleMoves () {

        if (!moves) {
            return;
        }

        for (var i = 0; i < moves.length; ++i) {

            var direction = moves[i];
            gameboard.highlight(direction.x, direction.y);
        }
    }

    function render () {

        // Draw only if necessary (e.g. player clicked / moved a piece)
        if (gameUpdate) {

            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Gameboard
            gameboard.draw();

            for (var i = 0; i < gameboard.pieces.length; ++i) {

                var piece = gameboard.pieces[i];

                if (selected === piece) {
                    renderPossibleMoves();
                }

                piece.draw();
            }

            if (moves === null) {
                gameUpdate = false;
            }
        }

    }

    function tick () {

        logic();
        render();

        if (!gameOver) {
            requestAnimFrame(Game.tick);
        }
    }

    return {

        init: init,
        tick: tick

    };

})();

$(document).ready(function () {

    var currentWidth = $("canvas").width();
    scale = currentWidth / canvas.width;

    Game.init();
    Game.tick();
});
