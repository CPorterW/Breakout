window.onload = function() {
    const canvas = document.getElementById("myCanvas");

    // Every other measurement is based off of this.
    // 70% of viewport width.
    canvas.width = .7 * window.innerWidth;

    canvas.height = canvas.width * 2/3;
    const ctx = canvas.getContext("2d");
    let x = canvas.width / 2;
    let y = canvas.height * 27/32;
    let speed = canvas.width / 240;
    let dx = canvas.width / 240;
    let dy = canvas.height / -160;
    let velocity = [dx, dy];
    let ballRadius = canvas.width / 48;
    let paddleWidth = ballRadius * 5;
    let paddleHeight = ballRadius;
    let paddleX = (canvas.width - paddleWidth) / 2;
    let paddleY = canvas.height * 30/32 - ballRadius;
    let bricks = [];
    let brickNumPerRow = 6;
    let brickColNum = 3;
    let gameOverSeconds = 5;
    for (i=0;i<brickNumPerRow*brickColNum;i++) {
        bricks[i] = {x:0,y:0,hasBeenHit:false}
    }
    let interval = 0;

    function drawBricks() {
        let gapsBetweenBricks = brickNumPerRow + 1;
        let brickWidth = canvas.width/48 * (48-gapsBetweenBricks)/brickNumPerRow;
        let brickHeight = canvas.width/48 * 2;
        let brickX = canvas.width / 48;
        let brickY = canvas.width/48;
        for (i=0; i<brickNumPerRow*brickColNum; i++) {
            bricks[i].brickX = brickX;
            bricks[i].brickY = brickY;
            if (i%brickNumPerRow == 0 && i != 0) {
                brickY += brickHeight + canvas.width/48;
                brickX = canvas.width / 48;
            }
            if (!bricks[i].hasBeenHit) {
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#2F2219";
                ctx.fill();
                ctx.closePath();
                [x, y, dx, dy] = whetherBallDirectionShouldSwitch(x, y, dx, dy, brickX, brickX + brickWidth, brickY, brickY + brickHeight, i);
            }
            brickX += brickWidth + canvas.width/48;
        }
    }

    function whetherBallDirectionShouldSwitch(x, y, dx, dy, objLeftX, objRightX, objTopY, objBottomY, brickId=-1) {
        // Expand the object's boundaries by the ball's radius
        const leftBound = objLeftX - ballRadius;
        const rightBound = objRightX + ballRadius;
        const topBound = objTopY - ballRadius;
        const bottomBound = objBottomY + ballRadius;

        // Check if the ball's center is within the expanded boundaries
        if (x > leftBound && x < rightBound && y > topBound && y < bottomBound) {

            // Calculate the intersection depths
            const overlapLeft = x - leftBound;
            const overlapRight = rightBound - x;
            const overlapTop = y - topBound;
            const overlapBottom = bottomBound - y;

            // Using overlap was the best way I could think of,
            // because I couldn't figure out how to get solid edges.
            // This finds the edge nearest to an edge of the ball.
            // Or rather, it finds the nearest edge's distance from
            // the edge of the ball.
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            // Figures out which side was hit and adjusts position and velocity 
            // Position needs to be adjusted because there used to be a weird
            // glitch where the ball would get stuck inside the paddle
            if (minOverlap === overlapLeft) {
                x = leftBound;
                dx = -Math.abs(dx);
            } else if (minOverlap === overlapRight) {
                x = rightBound;
                dx = Math.abs(dx);
            } else if (minOverlap === overlapTop) {
                y = topBound;
                dy = -Math.abs(dy);
            } else if (minOverlap === overlapBottom) {
                y = bottomBound;
                dy = Math.abs(dy);
            }

            // Makes the bounces a little bit random
            dx += (Math.random() -.5) * speed/8;
            dy += (Math.random() -.5) * speed/8;
            
            /* 
            I'm in love with these formulas! They keep the speeds within 
            reasonable bounds, and ensure that the ball doesn't bounce so 
            horizontally that it takes forever to fall. 
            */
            dx = Math.sign(dx) * Math.abs(dx/dy * (speed));
            dy = Math.sign(dy) * Math.abs(dy/dx * (speed));

            if (Math.abs(dx) < speed/1.3){
                dx = Math.sign(dx) * speed;
                dy = Math.sign(dy) * speed;
            }
            if (Math.abs(dy) < speed/1.3){
                dx = Math.sign(dx) * speed;
                dy = Math.sign(dy) * speed;
            }

            if (brickId != -1) {
                bricks[brickId].hasBeenHit = true;
            }
        }

        return [x, y, dx, dy];
    }

    function draw() {

        // Resets the canvas before drawing everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBall();
        canvas.onmousemove = (event) => {
            // Ties the paddle to the mouse
            paddleX = event.clientX - canvas.getBoundingClientRect().left - paddleWidth/2;

            // Ensure paddle stays within canvas
            paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, paddleX));
        }

        drawPaddle();
        drawBricks();
        
        // Wall collision check
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        }

        // Paddle collision check
        [x, y, dx, dy] = whetherBallDirectionShouldSwitch(x, y, dx, dy, paddleX, paddleX + paddleWidth, paddleY, paddleY + paddleHeight);
        
        // Move ball
        x += dx;
        y += dy;
        
        if(isGameOver()) {
            clearInterval(interval);
            let gameOverFontSize = canvas.width * .1;
            ctx.font = gameOverFontSize + "px Arial";
            ctx.fillStyle = "red";
            let gameOverText = "Game Over";
            let textWidth = ctx.measureText(gameOverText).width;
            let textX = (canvas.width - textWidth) / 2;
            let textY = canvas.height / 2;
            ctx.fillText(gameOverText, textX, textY);
            
            // Thanks to https://www.sitepoint.com/delay-sleep-pause-wait/
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            sleep(2000).then(() => { startGame() });
        }
    }

    function isGameOver() {
        return y > canvas.height - ballRadius;
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#2F2219";
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight)
        ctx.fillStyle = "#2F2219";
        ctx.fill();
        ctx.closePath();
    }

    function startGame() {
        interval = setInterval(draw, 10);
        for (i=0;i<brickNumPerRow*brickColNum;i++) {
            bricks[i] = {x:0,y:0,hasBeenHit:false}
        }
        x = canvas.width / 2;
        y = canvas.height * 27/32;
        dx = canvas.width / 240;
        dy = canvas.height / -160;
    }

    startGame();
    // document.getElementById("startButton").addEventListener("click", function () {
    //     startGame();
    //     this.disabled = true;
    // });
};