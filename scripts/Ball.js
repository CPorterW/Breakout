// Ball.js
export class Ball {
    constructor(x, y, dx, dy, speed, radius, canvasHeight) {
        const canvasMiddle = canvasHeight / 2;
        this.x = x;
        this.y = y + canvasMiddle; // Adjust y position relative to canvas middle
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.radius = radius;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#2F2219";
        ctx.fill();
        ctx.closePath();
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    setSpeed() {
        // Makes the bounces a little bit random
        this.dx += (Math.random() - .5) * this.speed/8;
        this.dy += (Math.random() - .5) * this.speed/8;
        
        /* 
        I'm in love with these formulas! They keep the speeds within 
        reasonable bounds, and ensure that the ball doesn't bounce so 
        horizontally that it takes forever to fall. 
        */
        this.dx = Math.sign(this.dx) * Math.abs(this.dx/this.dy * (this.speed));
        this.dy = Math.sign(this.dy) * Math.abs(this.dy/this.dx * (this.speed));

        if (Math.abs(this.dx) < this.speed/1.3){
            this.dx = Math.sign(this.dx) * this.speed;
            this.dy = Math.sign(this.dy) * this.speed;
        }
        if (Math.abs(this.dy) < this.speed/1.3){
            this.dx = Math.sign(this.dx) * this.speed;
            this.dy = Math.sign(this.dy) * this.speed;
        }
    }
}