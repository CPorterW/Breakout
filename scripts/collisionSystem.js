// collisionSystem.js
export function checkCollision(ball, objLeftX, objRightX, objTopY, objBottomY) {
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

export function checkBrickCollision(ball, objLeftX, objRightX, objTopY, objBottomY, brickId, bricks, scoreCallback) {
    if (checkCollision(ball, objLeftX, objRightX, objTopY, objBottomY)) {
        bricks[brickId].hasBeenHit = true;
        scoreCallback(1); // Add 1 to score
        return true;
    }
    return false;
}