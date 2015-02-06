Piece.prototype = Object.create(Scalable.prototype);

function Piece (x, y, color) {

    Scalable.call(this, x, y);

    this.piece_size = 0.4;
    this.color = color;
    this.promoted = false;
}

Piece.prototype.draw = function () {

    iso.add(Cylinder(new Point(this.x, this.y, 0), this.piece_size, 25, .2), this.color);

    if (this.promoted) {
        iso.add(Cylinder(new Point(this.x, this.y, 0.2), this.piece_size / 2, 50, .075), this.color);
    }
}

Piece.prototype.move = function (dx, dy) {

    this.x = dx;
    this.y = dy;

    this.originX = (this.pointX + ((this.x - this.y) * 60)) * scale;
    this.originY = (this.pointY - (this.x * 35) - (this.y * 35)) * scale;
}

Piece.prototype.highlight = function() {

    // Highlight selected piece
    iso.add(new Path([
        Point(this.x, this.y, -0.5),
        Point(this.x, (this.y + 1), -0.5),
        Point((this.x + 1), (this.y + 1), -0.5),
        Point((this.x + 1), this.y, -0.5)
    ]), new Color(100, 250, 60));
}

Piece.prototype.isNextToBorder = function () {

    if (this.color === Colour.BLACK) {
        return this.y === 7;
    } else {
        return this.y === 0;
    }
}

Piece.prototype.isPromoted = function () {
    return this.promoted;
}

Piece.prototype.promote = function () {
    this.promoted = true;
}
