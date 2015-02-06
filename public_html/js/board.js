function GameBoard() {

    this.rows = 7;
    this.columns = 7;

    this.tile_size = 1;

    this.black = new Color(0, 0, 0);
    this.red = new Color(0xA0, 25, 25);
    this.red_tile = new Color(0x90, 25, 25);

    this.pieces = [];
    this.tiles = [];

    var tile_color = this.red_tile;

    // Initialize gameboard with tiles (rows * columns)
    for (var x = 0; x <= this.rows; x++) {

        if (x % 2 === 0)
            tile_color = this.black;
        else
            tile_color = this.red_tile;

        for (var y = 0; y <= this.columns; y++) {

            var tile = new Tile(x, y, tile_color);
            this.tiles.push(tile);

            if (tile_color === this.red_tile)
                tile_color = this.black;
            else if (tile_color === this.black)
                tile_color = this.red_tile;
        }
    }
}

GameBoard.prototype.draw = function () {

    for (var i = 0; i < this.tiles.length; ++i) {
        this.tiles[i].draw();
    }
}

// Highlight a tile
GameBoard.prototype.highlight = function (x, y) {

    iso.add(new Path([
        Point(x, y, -0.5),
        Point(x, (y + 1), -0.5),
        Point((x + 1), (y + 1), -0.5),
        Point((x + 1), y, -0.5)
    ]), new Color(100, 250, 60));
}

GameBoard.prototype.possibleMoves = function (piece) {

    // Determines direction (does the piece move up or down)
    var dy = piece.color === Colour.BLACK ? 1 : -1;

    var moves = [];

    var left = {};
    var right = {};

    // Move objects for promoted pieces,
    // e.g. var bLeft / bRight = {} (backwards left / backwards right)

    left.x = piece.x - 1;
    right.x = piece.x + 1;

    left.y = piece.y + dy;
    right.y = piece.y + dy;

    // Check boundaries and overlapping
    if (this.validMovement(piece, left, -1, dy)) {
        moves.push(left);
    }

    if (this.validMovement(piece, right, 1, dy)) {
        moves.push(right);
    }

    if (piece.isPromoted()) {

        dy *= -1;

        var bLeft = {};
        var bRight = {};

        bLeft.x = piece.x - 1;
        bRight.x = piece.x + 1;

        bLeft.y = piece.y + dy;
        bRight.y = piece.y + dy;

        if (this.validMovement(piece, bLeft, -1, dy)) {
            moves.push(bLeft);
        }

        if (this.validMovement(piece, bRight, 1, dy)) {
            moves.push(bRight);
        }
    }

    return moves;
}

GameBoard.prototype.validMovement = function (piece, coordinates, dx, dy) {

    if (this.isInsideBoard(coordinates)) {

        var neighbour = this.pieceAt(coordinates.x, coordinates.y);

        if (neighbour === null) {
            return true;
        } else if (piece.color !== neighbour.color) {

            coordinates["remove"] = neighbour;

            coordinates.x += dx;
            coordinates.y += dy;

            this.validMovement(piece, coordinates, dx, dy);

            if (this.isInsideBoard(coordinates) && this.pieceAt(coordinates.x, coordinates.y) === null) {
                return true;
            }
        }
    }

    return false;
}

GameBoard.prototype.pieceAt = function (x, y) {

    for (var i = 0; i < this.pieces.length; ++i) {

        var piece = this.pieces[i];

        if (piece.x === x && piece.y === y) {
            return piece;
        }
    }

    return null;
}

GameBoard.prototype.isInsideBoard = function (coordinates) {

    var x = coordinates.x;
    var y = coordinates.y;

    if (x < 0 || x > this.rows) {
        return false;
    }

    if (y < 0 || y > this.columns) {
        return false;
    }

    return true;
}

GameBoard.prototype.removePieceAt = function (x, y) {

    for (var i = 0; i < this.pieces.length; ++i) {

        var piece = this.pieces[i];

        if (piece.x === x && piece.y === y) {
            this.pieces.splice(i, 1);
        }
    }
}

GameBoard.prototype.recalculate = function () {

    for (var i = 0; i < this.pieces.length; ++i) {
        this.pieces[i].recalculate();
    }

    for (var j = 0; j < this.tiles.length; ++j) {
        this.tiles[j].recalculate();
    }
}
