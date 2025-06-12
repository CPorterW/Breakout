class Ball {
    constructor(x, y, dx, dy, speed, radius) {
        const canvasMiddle = canvas.height / 2;
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

class Paddle {
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

class Player {
    constructor(name, lives) {
        this.lives = lives;
        this.name = name;
        this.heartScales = Array(lives).fill(1); // Track individual heart scales
    }

    updateHeartPulse() {
        // Update heart scales for a subtle pulse effect
        this.heartScales = this.heartScales.map((scale, index) => {
            if (scale >= 1.2) return 1;
            if (scale <= 1) return 1.1;
            return scale + 0.002; // Adjust pulse speed
        });
    }
}

const canvas = document.getElementById("myCanvas");
const sendButton = document.getElementById("sendButton");
const myHighScore = document.getElementById('highScore');
const myScore = document.getElementById('score');
const peerHighScore = document.getElementById('peerHighScore');
const peerScore = document.getElementById('peerScore');

window.onload = function() {

    // Every other measurement is based off of this.
    // 80% of viewport height.
    const canvasSize = .8

    // Canvas Variables
    canvas.height = window.innerHeight * canvasSize;
    canvas.width = canvas.height * 3/4;
    const ctx = canvas.getContext("2d");
    const canvasMiddle = canvas.height / 2;

    // Ball Variables
    const ballSpeed = canvas.width / 120;
    const ballRadius = canvas.width / 48;

    // Initialize players
    let player1 = new Player('Player 1', 10);
    let player2 = new Player('Player 2', 10);

    // Initialize balls
    let ball1 = new Ball(
        canvas.width / 2,           // x
        canvas.height * 11/32,      // y - will position this in the lower half
        canvas.width / 240,         // dx - lateral direction
        canvas.height / -320,       // dy - vertical direction
        ballSpeed,                  // speed
        ballRadius                  // radius
    );

    let ball2 = new Ball(
        canvas.width / 2,           // x
        -canvas.height * 11/32,     // y - negative to position in upper half
        canvas.width / 240,         // dx
        canvas.height / 320,        // dy - note this is positive for the second ball
        ballSpeed,                  // speed
        ballRadius                  // radius
    );

    // Paddle Variables
    let paddleSpeed = ballSpeed * 2;
    const paddleWidth = ballRadius * 5;
    const paddleHeight = ballRadius;
    
    // Create paddles
    let paddle1 = new Paddle(
        (canvas.width - paddleWidth) / 2,       // x
        canvas.height * 30/32 - paddleHeight,   // y
        paddleSpeed,                            // speed
        paddleWidth,                            // width
        paddleHeight                            // height
    );
    
    let paddle2 = new Paddle(
        (canvas.width - paddleWidth) / 2,       // x
        canvas.height * 2/32,                   // y
        paddleSpeed,                            // speed
        paddleWidth,                            // width
        paddleHeight                            // height
    );
    
    // Brick Variables
    let bricks = [];
    let brickNumPerRow = 6;
    let brickColNum = 6;

    // Other Game Variables
    let score = 0;
    let highScore = 0;
    let lastTime = 0; // stores the timestamp of the previous frame
    let myData;
    let peerData;
    let stage = 5;
    let animationFrameId = null;


    // Used to check for key presses
    const keys = {
        a: false,
        d: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    // Heart constants
    const heartMatrix = [
        [0,0,1,1,0,0,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,0,0,0,0],
    ];

    const pixelSize = 2;

    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault(); // Prevents the page from scrolling
                keys.ArrowLeft = true;
                break;
            case 'ArrowRight':
                event.preventDefault();
                keys.ArrowRight = true;
                break;
            case 'a':
                keys.a = true;
                break;
            case 'd':
                keys.d = true;
                break;
        }
    });

    document.addEventListener('keyup', function(event) {
        switch(event.key) {
            case 'ArrowLeft':
                keys.ArrowLeft = false;
                break;
            case 'ArrowRight':
                keys.ArrowRight = false;
                break;
            case 'a':
                keys.a = false;
                break;
            case 'd':
                keys.d = false;
                break;
        }
    });

    function generateBrickField() {
        bricks = [];
        for (var i=0; i<brickNumPerRow*brickColNum; i++) {
            bricks[i] = {x:0, y:0, hasBeenHit:false};
        }
    }

    function drawBricks() {
        let gapsBetweenBricks = brickNumPerRow + 1;
        let mortar = canvas.width / 48; // The mortar is the distance between bricks, equal to half the size of a brick.
        
        let brickWidth = mortar * (48-gapsBetweenBricks)/brickNumPerRow;
        let brickHeight = mortar * 2;
        
        // brickLengths are the height of a brick plus the mortar, so total height can be measured.
        let brickLength = brickHeight + mortar;

        let brickX = mortar;
        let brickY = canvas.height / 2 - (brickLength * brickColNum / 2) + mortar / 2;
        let totalBricks = brickNumPerRow * brickColNum;
        let bricksNotCleared = totalBricks;
        
        for (var i=0; i<totalBricks; i++) {
            bricks[i].brickX = brickX;
            bricks[i].brickY = brickY;
            
            if (i%brickNumPerRow == 0 && i != 0) {
                brickY += brickHeight + mortar;
                brickX = mortar;
            }
            
            if (!bricks[i].hasBeenHit) {
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#2F2219";
                ctx.fill();
                ctx.closePath();
                
                // Check collision for both balls
                checkBrickCollision(ball1, brickX, brickX + brickWidth, brickY, brickY + brickHeight, i);
                checkBrickCollision(ball2, brickX, brickX + brickWidth, brickY, brickY + brickHeight, i);
            } else {
                bricksNotCleared -= 1;
                if (bricksNotCleared == 0) {
                    brickNumPerRow += 1;
                    generateBrickField();
                }
            }
            
            brickX += brickWidth + mortar;
        }
    }

    function checkBrickCollision(ball, objLeftX, objRightX, objTopY, objBottomY, brickId) {
        if (checkCollision(ball, objLeftX, objRightX, objTopY, objBottomY)) {
            bricks[brickId].hasBeenHit = true;
            score += 1;
            highScore = highScore < score ? score : highScore;
        }
    }

    function checkCollision(ball, objLeftX, objRightX, objTopY, objBottomY) {
        // Expand the object's boundaries by the ball's radius
        const leftBound = objLeftX - ball.radius;
        const rightBound = objRightX + ball.radius;
        const topBound = objTopY - ball.radius;
        const bottomBound = objBottomY + ball.radius;

        // Check if the ball's center is within the expanded boundaries
        if (ball.x > leftBound && ball.x < rightBound && ball.y > topBound && ball.y < bottomBound) {
            // Calculate the intersection depths
            const overlapLeft = ball.x - leftBound;
            const overlapRight = rightBound - ball.x;
            const overlapTop = ball.y - topBound;
            const overlapBottom = bottomBound - ball.y;

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
                ball.x = leftBound;
                ball.dx = -Math.abs(ball.dx);
            } else if (minOverlap === overlapRight) {
                ball.x = rightBound;
                ball.dx = Math.abs(ball.dx);
            } else if (minOverlap === overlapTop) {
                ball.y = topBound;
                ball.dy = -Math.abs(ball.dy);
            } else if (minOverlap === overlapBottom) {
                ball.y = bottomBound;
                ball.dy = Math.abs(ball.dy);
            }

            ball.setSpeed();
            return true;
        }
        return false;
    }

    // Right now, this correlates to line 81 of connection.js. 
    // I've never made window events before so I think this is pretty cool.
    window.addEventListener('peerDataReceived', function(event) {
        peerData = event.detail;
        updateScoreDisplays();
    });

    function updateScoreDisplays() {
        myHighScore.textContent = 'High Score: ' + highScore;
        myScore.textContent = 'Score: ' + score;
        if (peerData) {
            peerScore.textContent = 'Their Score: ' + peerData.score;
            peerHighScore.textContent = 'Their High Score: ' + peerData.highScore;
        } else {
            // If no connection, this basically hides the element.
            peerScore.textContent = '';
            peerHighScore.textContent = '';
        }
    }

    function dataTransfer() {
        // This is the info that gets sent to your friend's computer.
        myData = {
            canvasWidth: canvas.width,
            ball1: ball1,
            ball2: ball2,
            paddle1: paddle1,
            paddle2: paddle2,
            bricks: bricks,
            brickNumPerRow: brickNumPerRow,
            brickColNum: brickColNum,
            score: score,
            highScore: highScore
        }

        // Adding a window listener is more efficient, but I've never used localStorage 
        // before and I figured I'd give it a shot. This is also my first time explicitly
        // using JSON.
        localStorage.setItem(document.getElementById('myId').value, JSON.stringify(myData));
        sendButton.click();
        updateScoreDisplays();
    }

    function draw(timestamp) {
        // Calculate delta time for smooth animation
        const delta = lastTime === 0 ? 0 : (timestamp - lastTime) / 1000; // convert from ms to seconds
        lastTime = timestamp;
        
        // Update speeds based on delta time
        const currentSpeed = canvas.width / 2.7 * (delta || 1/60); // fallback to 60fps if delta is 0
        ball1.speed = currentSpeed;
        ball2.speed = currentSpeed;
        paddle1.speed = currentSpeed * 2;
        paddle2.speed = currentSpeed * 2;
    
        // Transmit data to peers
        dataTransfer();
    
        // Clear the canvas before drawing everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Handle paddle movement
        if (keys.ArrowLeft) paddle1.moveLeft();
        if (keys.ArrowRight) paddle1.moveRight();
        if (keys.a) paddle2.moveLeft();
        if (keys.d) paddle2.moveRight();
    
        // Ensure paddles stay within the canvas
        paddle1.constrainToBounds(canvas.width);
        paddle2.constrainToBounds(canvas.width);
    
        // Draw game elements
        ball1.draw(ctx);
        ball2.draw(ctx);
        paddle1.draw(ctx);
        paddle2.draw(ctx);
        drawBricks();

        // Draw lives
        drawPlayerLives(player1, false);
        drawPlayerLives(player2, true);
        
        // Handle collisions and movement
        handleBallLogic(ball1);
        handleBallLogic(ball2);
        
        // Check for game over
        if(isGameOver()) {
            gameOver();
        }
        else {
            // Store the ID so we can cancel it if needed
            animationFrameId = requestAnimationFrame(draw);
        }
    }

    function handleBallLogic(ball) {

        checkCollision(ball, -100, 10000, canvas.height, 10000)
        checkCollision(ball, -100, 10000, -100, 0)
        checkCollision(ball, -100, 0, -100, 10000)
        checkCollision(ball, canvas.width, 10000, -100, 10000)

        // Paddle collision check
        checkCollision(ball, paddle1.x, paddle1.x + paddle1.width, paddle1.y, paddle1.y + paddle1.height);
        checkCollision(ball, paddle2.x, paddle2.x + paddle2.width, paddle2.y, paddle2.y + paddle2.height);
        
        // Move ball
        ball.move();
    }

    function isGameOver() {
        // Check if either ball has gone out of bounds
        if (ball1.y > canvas.height - ball1.radius || ball2.y > canvas.height - ball2.radius) {
            player1.lives -= 1;
            if (player1.heartScales.length > player1.lives) {
                player1.heartScales.pop(); // Remove a heart
            }
        }
        if (ball1.y < ball1.radius || ball2.y < ball2.radius) {
            player2.lives -= 1;
            if (player2.heartScales.length > player2.lives) {
                player2.heartScales.pop(); // Remove a heart
            }
        }
        return player1.lives <= 0 || player2.lives <= 0;
    }
    
    function gameOver() {
        // Clear the canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw game elements to show final state
        ball1.draw(ctx);
        ball2.draw(ctx);
        paddle1.draw(ctx);
        paddle2.draw(ctx);
        drawBricks();
        
        // Draw lives
        drawPlayerLives(player1, false);
        drawPlayerLives(player2, true);
        
        // Cancel any existing animation frame to stop the game loop
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Set up countdown
        if (stage === 5) {
            // First time entering game over, show "Game Over" text
            let gameOverFontSize = canvas.width * 0.1;
            ctx.font = gameOverFontSize + "px Arial";
            ctx.fillStyle = "red";
            let gameOverText = "Game Over";
            let textWidth = ctx.measureText(gameOverText).width;
            let textX = (canvas.width - textWidth) / 2;
            let textY = canvas.height / 2;
            ctx.fillText(gameOverText, textX, textY);
            
            // Reset score now
            score = 0;
            updateScoreDisplays();
            
            // Start countdown after 1 second
            setTimeout(() => {
                stage = 4;
                gameOver();
            }, 1000);
        } 
        else if (stage > 0) {
            // Show countdown
            let gameOverFontSize = canvas.width * 0.1;
            ctx.font = gameOverFontSize + "px Arial";
            ctx.fillStyle = "red";
            let textWidth = ctx.measureText(stage.toString()).width;
            let textX = (canvas.width - textWidth) / 2;
            let textY = canvas.height / 2;
            ctx.fillText(stage.toString(), textX, textY);
            
            // Continue countdown
            stage -= 1;
            setTimeout(() => {
                gameOver();
            }, 1000);
        }
        else {
            // Countdown finished, restart the game
            startGame();
        }
    }

    // Thanks to https://www.sitepoint.com/delay-sleep-pause-wait/
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function drawHeart(x, y, scale, color = '#FF3B3B') {
        for (let row = 0; row < heartMatrix.length; row++) {
            for (let col = 0; col < heartMatrix[row].length; col++) {
                if (heartMatrix[row][col]) {
                    ctx.fillStyle = color;
                    ctx.fillRect(
                        x + col * pixelSize * scale,
                        y + row * pixelSize * scale,
                        pixelSize * scale,
                        pixelSize * scale
                    );
                }
            }
        }
    }

    function drawPlayerLives(player, isTopPlayer) {
        const heartSpacing = pixelSize * 12; // Space between hearts
        const startY = isTopPlayer ? 10 : canvas.height - (pixelSize * 10);
        const startX = canvas.width / 2 - (player.lives * heartSpacing) / 2;

        player.updateHeartPulse(); // Update heart pulse scales

        player.heartScales.forEach((scale, index) => {
            const heartX = startX + index * heartSpacing;
            if (index < player.lives) {
                drawHeart(heartX, startY, scale);
            }
        });
    }



    function startGame() {
        // Reset game state
        stage = 5;
        generateBrickField();
        brickNumPerRow = 6;
        
        // Reset players
        player1 = new Player('Player 1', 10);
        player2 = new Player('Player 2', 10);
        
        // Reset ball positions and velocities
        ball1.x = canvas.width / 2;
        ball1.y = canvas.height / 2 + canvas.height * 11/32;
        ball1.dx = canvas.width / 240;
        ball1.dy = canvas.height / -320;
        
        ball2.x = canvas.width / 2;
        ball2.y = canvas.height / 2 - canvas.height * 11/32;
        ball2.dx = canvas.width / 240;
        ball2.dy = canvas.height / 320;
        
        // Reset paddle positions
        paddle1.x = (canvas.width - paddleWidth) / 2;
        paddle2.x = (canvas.width - paddleWidth) / 2;
    
        // Set initial ball speeds
        ball1.setSpeed();
        ball2.setSpeed();
    
        // Reset score
        score = 0;
        
        // Reset lastTime
        lastTime = 0;
        
        // Start the game loop
        animationFrameId = requestAnimationFrame(draw);
    }

    // Initialize the game
    startGame();
};