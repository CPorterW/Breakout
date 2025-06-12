// brickSystem.js
import { checkBrickCollision } from './collisionSystem.js';

export function generateBrickField(brickNumPerRow, brickColNum) {
    const bricks = [];
    for (var i = 0; i < brickNumPerRow * brickColNum; i++) {
        bricks[i] = {x: 0, y: 0, hasBeenHit: false};
    }
    return bricks;
}

export function drawBricks(ctx, canvas, bricks, brickNumPerRow, brickColNum, ball1, ball2, scoreCallback, resetCallback) {
    let gapsBetweenBricks = brickNumPerRow + 1;
    let mortar = canvas.width / 48; // The mortar is the distance between bricks, equal to half the size of a brick.
    
    let brickWidth = mortar * (48 - gapsBetweenBricks) / brickNumPerRow;
    let brickHeight = mortar * 2;
    
    // brickLengths are the height of a brick plus the mortar, so total height can be measured.
    let brickLength = brickHeight + mortar;

    let brickX = mortar;
    let brickY = canvas.height / 2 - (brickLength * brickColNum / 2) + mortar / 2; // Half the mortar is added to center the bricks vertically.
    let totalBricks = brickNumPerRow * brickColNum;
    let bricksNotCleared = totalBricks;
    
    for (var i = 0; i < totalBricks; i++) {
        bricks[i].brickX = brickX;
        bricks[i].brickY = brickY;
        
        if (i % brickNumPerRow == 0 && i != 0) {
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
            checkBrickCollision(ball1, brickX, brickX + brickWidth, brickY, brickY + brickHeight, i, bricks, scoreCallback);
            checkBrickCollision(ball2, brickX, brickX + brickWidth, brickY, brickY + brickHeight, i, bricks, scoreCallback);
        } else {
            bricksNotCleared -= 1;
            if (bricksNotCleared == 0) {
                resetCallback(); // Reset with more bricks
            }
        }
        
        brickX += brickWidth + mortar;
    }
}