Tile.prototype = Object.create(Scalable.prototype);

function Tile (x, y, color) {

    Scalable.call(this, x, y);

    this.tile_size = 1;

    // Tile colour
    this.color = color;
}

Tile.prototype.draw = function () {

    iso.add(new Shape.Prism(new Point(this.x - (this.tile_size / 2),
                            this.y - (this.tile_size / 2), 0),
                            this.tile_size, this.tile_size, .05),
                            this.color);
}