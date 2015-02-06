window.requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* kutsuttava funktio */ callback, /* elementti */ element){
        window.setTimeout(callback, 1000 / 1);
    };
})();

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
        return {x: mx, y: my};
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

    function clickedPiece (mx, my) {

        for (var i = 0; i < gameboard.pieces.length; ++i) {

            var piece = gameboard.pieces[i];

            if (piece.contains(mx, my)) {

                selected = piece;
                gameUpdate = true;
                return;
            }
        }
    }

    function movedPiece (mx, my) {

        if (selected !== null && moves !== null) {

            for (var x = 0; x < moves.length; ++x) {

                var moveTo = moves[x];

                for (var j = 0; j < gameboard.tiles.length; ++j) {

                    if (selected.x === moveTo.x && selected.y === moveTo.y) {
                        continue;
                    }

                    var tile = gameboard.tiles[j];

                    if (moveTo.x === tile.x && moveTo.y === tile.y && tile.contains(mx, my)) {

                        selected.move(moveTo.x, moveTo.y);

                        if (selected.isNextToBorder() && !selected.isPromoted()) {
                            selected.promote();
                        }

                        // Munch
                        if (moveTo["remove"] !== undefined) {
                            var piece = moveTo["remove"];
                            gameboard.removePieceAt(piece.x, piece.y);
                        }

                        selected = null;
                        moves = null;
                        return;
                    }
                }
            }
        }
    }

    function init() {

        gameboard = new GameBoard();
        initPieces();

        $(window).resize(function () {

            var currentWidth = $("canvas").width();
            scale = currentWidth / canvas.width;

            gameboard.recalculate();
        });

        canvas.addEventListener('mousedown', function (e) {

            var mouse = getMouse(e);
            var mx = mouse.x;
            var my = mouse.y;

            // Check if user clicked a piece
            clickedPiece(mx, my);

            // Check if user wants to move a selected piece
            movedPiece(mx, my);
        });
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

                    piece.highlight();
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