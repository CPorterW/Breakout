// Paddle.js
export class Paddle {
    constructor(x, y, speed, width, height) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#2F2219";
        ctx.fill();
        ctx.closePath();
    }

    moveLeft() {
        this.x -= this.speed;
    }

    moveRight() {
        this.x += this.speed;
    }

    constrainToBounds(canvasWidth) {
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    }
}