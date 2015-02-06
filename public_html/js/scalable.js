function Scalable (x, y) {

    // Location
    this.x = x;
    this.y = y;

    // Top-left corner of the piece locating at (0,0)
    this.pointX = 430;
    this.pointY = 541;

    // Canvas coordinates of top-left corner
    // Scale is by default 1 but can change if user is playing with smaller screen
    this.originX = (this.pointX + ((x - y) * 60)) * scale;
    this.originY = (this.pointY - (x * 35) - (y * 35)) * scale;

    // Slope
    this.slope = 35 / 60;

    this.width = 120 * scale;
    this.height = 70 * scale;
}

// Determine if a point is inside the piece's bounds
Scalable.prototype.contains = function (mx, my) {

    // All we have to do is make sure the Mouse X,Y falls in the area between
    // the shape's X and (X + Height) and its Y and (Y + Height)
    var dy;

    if (mx > this.originX + this.width / 2 && mx < this.originX + this.width) {

        dy = (this.originX + this.width / 2 - mx) * this.slope;
        dy = this.height / 2 + dy;
    }

    if (mx <= this.originX + this.width / 2) {

        dy = (mx - this.originX) * this.slope;
    }

    return (this.originX <= mx) && (this.originX + this.width >= mx) &&
            (this.originY - 35 <= my) && (this.originY + 35 >= my) &&
            (this.originY - dy <= my) && (this.originY + dy >= my);
}

Scalable.prototype.recalculate = function () {

    this.originX = (this.pointX + ((this.x - this.y) * 60)) * scale;
    this.originY = (this.pointY - (this.x * 35) - (this.y * 35)) * scale;

    this.slope = (35 * scale) / (60 * scale);

    this.width = 120 * scale;
    this.height = 70 * scale;
}
