// gameEngine.js
import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';
import { Player } from './Player.js';
import { checkCollision } from './collisionSystem.js';
import { generateBrickField, drawBricks } from './brickSystem.js';
import { drawPlayerLives, updateScoreDisplays } from './uiSystem.js';
import { keys } from './inputSystem.js';

export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        
        // Canvas setup
        const canvasSize = 0.8;
        this.canvas.height = window.innerHeight * canvasSize;
        this.canvas.width = this.canvas.height * 3/4;
        
        // Game variables
        this.ballSpeed = this.canvas.width / 120;
        this.ballRadius = this.canvas.width / 48;
        this.paddleSpeed = this.ballSpeed * 2;
        this.paddleWidth = this.ballRadius * 5;
        this.paddleHeight = this.ballRadius;
        
        // Game state
        this.score = 0;
        this.highScore = 0;
        this.stage = 5;
        this.lastTime = 0;
        this.animationFrameId = null;
        this.brickNumPerRow = 6;
        this.brickColNum = 6;
        this.bricks = [];
        this.myData = null;
        this.peerData = null;
        
        this.init();
    }
    
    init() {
        this.initializePlayers();
        this.initializeBalls();
        this.initializePaddles();
        this.initializeBricks();
        this.setupEventListeners();
    }
    
    initializePlayers() {
        this.player1 = new Player('Player 1', 10);
        this.player2 = new Player('Player 2', 10);
    }
    
    initializeBalls() {
        this.ball1 = new Ball(
            this.canvas.width / 2,           // x
            this.canvas.height * 11/32,      // y - will position this in the lower half
            this.canvas.width / 240,         // dx - lateral direction
            this.canvas.height / -320,       // dy - vertical direction
            this.ballSpeed,                  // speed
            this.ballRadius,                 // radius
            this.canvas.height
        );

        this.ball2 = new Ball(
            this.canvas.width / 2,           // x
            -this.canvas.height * 11/32,     // y - negative to position in upper half
            this.canvas.width / 240,         // dx
            this.canvas.height / 320,        // dy - note this is positive for the second ball
            this.ballSpeed,                  // speed
            this.ballRadius,                 // radius
            this.canvas.height
        );
    }
    
    initializePaddles() {
        this.paddle1 = new Paddle(
            (this.canvas.width - this.paddleWidth) / 2,       // x
            this.canvas.height * 30/32 - this.paddleHeight,   // y
            this.paddleSpeed,                                  // speed
            this.paddleWidth,                                  // width
            this.paddleHeight                                  // height
        );
        
        this.paddle2 = new Paddle(
            (this.canvas.width - this.paddleWidth) / 2,       // x
            this.canvas.height * 2/32,                         // y
            this.paddleSpeed,                                  // speed
            this.paddleWidth,                                  // width
            this.paddleHeight                                  // height
        );
    }
    
    initializeBricks() {
        this.bricks = generateBrickField(this.brickNumPerRow, this.brickColNum);
    }
    
    setupEventListeners() {
        // Right now, this correlates to line 81 of connection.js. 
        // I've never made window events before so I think this is pretty cool.
        window.addEventListener('peerDataReceived', (event) => {
            this.peerData = event.detail;
            updateScoreDisplays(this.score, this.highScore, this.peerData);
        });
    }
    
    addToScore(points) {
        this.score += points;
        this.highScore = this.highScore < this.score ? this.score : this.highScore;
    }
    
    resetBricks() {
        this.brickNumPerRow += 1;
        this.bricks = generateBrickField(this.brickNumPerRow, this.brickColNum);
    }
    
    dataTransfer() {
        // This is the info that gets sent to your friend's computer.
        this.myData = {
            canvasWidth: this.canvas.width,
            ball1: this.ball1,
            ball2: this.ball2,
            paddle1: this.paddle1,
            paddle2: this.paddle2,
            bricks: this.bricks,
            brickNumPerRow: this.brickNumPerRow,
            brickColNum: this.brickColNum,
            score: this.score,
            highScore: this.highScore
        };
        
        // Adding a window listener is more efficient, but I've never used localStorage 
        // before and I figured I'd give it a shot. This is also my first time explicitly
        // using JSON.
        localStorage.setItem(document.getElementById('myId').value, JSON.stringify(this.myData));
        document.getElementById('sendButton').click();
        updateScoreDisplays(this.score, this.highScore, this.peerData);
    }
    
    draw(timestamp) {
        // Calculate delta time for smooth animation
        const delta = this.lastTime === 0 ? 0 : (timestamp - this.lastTime) / 1000; // convert from ms to seconds
        this.lastTime = timestamp;
        
        // Update speeds based on delta time
        const currentSpeed = this.canvas.width / 2.7 * (delta || 1/60); // fallback to 60fps if delta is 0
        this.ball1.speed = currentSpeed;
        this.ball2.speed = currentSpeed;
        this.paddle1.speed = currentSpeed * 2;
        this.paddle2.speed = currentSpeed * 2;
    
        // Transmit data to peers
        this.dataTransfer();
    
        // Clear the canvas before drawing everything
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Handle paddle movement
        if (keys.ArrowLeft) this.paddle1.moveLeft();
        if (keys.ArrowRight) this.paddle1.moveRight();
        if (keys.a) this.paddle2.moveLeft();
        if (keys.d) this.paddle2.moveRight();
    
        // Ensure paddles stay within the canvas
        this.paddle1.constrainToBounds(this.canvas.width);
        this.paddle2.constrainToBounds(this.canvas.width);
    
        // Draw game elements
        this.ball1.draw(this.ctx);
        this.ball2.draw(this.ctx);
        this.paddle1.draw(this.ctx);
        this.paddle2.draw(this.ctx);
        drawBricks(
            this.ctx, 
            this.canvas, 
            this.bricks, 
            this.brickNumPerRow, 
            this.brickColNum, 
            this.ball1, 
            this.ball2, 
            (points) => this.addToScore(points),
            () => this.resetBricks()
        );

        // Draw lives
        drawPlayerLives(this.ctx, this.canvas, this.player1, false);
        drawPlayerLives(this.ctx, this.canvas, this.player2, true);
        
        // Handle collisions and movement
        this.handleBallLogic(this.ball1);
        this.handleBallLogic(this.ball2);
        
        // Check for game over
        if(this.isGameOver()) {
            this.gameOver();
        }
        else {
            // Store the ID so we can cancel it if needed
            this.animationFrameId = requestAnimationFrame((timestamp) => this.draw(timestamp));
        }
    }

    handleBallLogic(ball) {
        checkCollision(ball, -100, 10000, this.canvas.height, 10000);
        checkCollision(ball, -100, 10000, -100, 0);
        checkCollision(ball, -100, 0, -100, 10000);
        checkCollision(ball, this.canvas.width, 10000, -100, 10000);

        // Paddle collision check
        checkCollision(ball, this.paddle1.x, this.paddle1.x + this.paddle1.width, this.paddle1.y, this.paddle1.y + this.paddle1.height);
        checkCollision(ball, this.paddle2.x, this.paddle2.x + this.paddle2.width, this.paddle2.y, this.paddle2.y + this.paddle2.height);
        
        // Move ball
        ball.move();
    }

    isGameOver() {
        // Check if either ball has gone out of bounds
        if (this.ball1.y > this.canvas.height - this.ball1.radius || this.ball2.y > this.canvas.height - this.ball2.radius) {
            this.player1.lives -= 1;
            if (this.player1.heartScales.length > this.player1.lives) {
                this.player1.heartScales.pop(); // Remove a heart
            }
        }
        if (this.ball1.y < this.ball1.radius || this.ball2.y < this.ball2.radius) {
            this.player2.lives -= 1;
            if (this.player2.heartScales.length > this.player2.lives) {
                this.player2.heartScales.pop(); // Remove a heart
            }
        }
        return this.player1.lives <= 0 || this.player2.lives <= 0;
    }
    
    gameOver() {
        // Clear the canvas first
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game elements to show final state
        this.ball1.draw(this.ctx);
        this.ball2.draw(this.ctx);
        this.paddle1.draw(this.ctx);
        this.paddle2.draw(this.ctx);
        drawBricks(
            this.ctx, 
            this.canvas, 
            this.bricks, 
            this.brickNumPerRow, 
            this.brickColNum, 
            this.ball1, 
            this.ball2, 
            (points) => this.addToScore(points),
            () => this.resetBricks()
        );
        
        // Draw lives
        drawPlayerLives(this.ctx, this.canvas, this.player1, false);
        drawPlayerLives(this.ctx, this.canvas, this.player2, true);
        
        // Cancel any existing animation frame to stop the game loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Set up countdown
        if (this.stage === 5) {
            // First time entering game over, show "Game Over" text
            let gameOverFontSize = this.canvas.width * 0.1;
            this.ctx.font = gameOverFontSize + "px Arial";
            this.ctx.fillStyle = "red";
            let gameOverText = "Game Over";
            let textWidth = this.ctx.measureText(gameOverText).width;
            let textX = (this.canvas.width - textWidth) / 2;
            let textY = this.canvas.height / 2;
            this.ctx.fillText(gameOverText, textX, textY);
            
            // Reset score now
            this.score = 0;
            updateScoreDisplays(this.score, this.highScore, this.peerData);
            
            // Start countdown after 1 second
            setTimeout(() => {
                this.stage = 4;
                this.gameOver();
            }, 1000);
        } 
        else if (this.stage > 0) {
            // Show countdown
            let gameOverFontSize = this.canvas.width * 0.1;
            this.ctx.font = gameOverFontSize + "px Arial";
            this.ctx.fillStyle = "red";
            let textWidth = this.ctx.measureText(this.stage.toString()).width;
            let textX = (this.canvas.width - textWidth) / 2;
            let textY = this.canvas.height / 2;
            this.ctx.fillText(this.stage.toString(), textX, textY);
            
            // Continue countdown
            this.stage -= 1;
            setTimeout(() => {
                this.gameOver();
            }, 1000);
        }
        else {
            // Countdown finished, restart the game
            this.startGame();
        }
    }

    startGame() {
        // Reset game state
        this.stage = 5;
        this.bricks = generateBrickField(this.brickNumPerRow, this.brickColNum);
        this.brickNumPerRow = 6;
        
        // Reset players
        this.player1 = new Player('Player 1', 10);
        this.player2 = new Player('Player 2', 10);
        
        // Reset ball positions and velocities
        this.ball1.x = this.canvas.width / 2;
        this.ball1.y = this.canvas.height / 2 + this.canvas.height * 11/32;
        this.ball1.dx = this.canvas.width / 240;
        this.ball1.dy = this.canvas.height / -320;
        
        this.ball2.x = this.canvas.width / 2;
        this.ball2.y = this.canvas.height / 2 - this.canvas.height * 11/32;
        this.ball2.dx = this.canvas.width / 240;
        this.ball2.dy = this.canvas.height / 320;
        
        // Reset paddle positions
        this.paddle1.x = (this.canvas.width - this.paddleWidth) / 2;
        this.paddle2.x = (this.canvas.width - this.paddleWidth) / 2;
    
        // Set initial ball speeds
        this.ball1.setSpeed();
        this.ball2.setSpeed();
    
        // Reset score
        this.score = 0;
        
        // Reset lastTime
        this.lastTime = 0;
        
        // Start the game loop
        this.animationFrameId = requestAnimationFrame((timestamp) => this.draw(timestamp));
    }
}