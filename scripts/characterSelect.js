const canvas = document.getElementById("myCanvas");
const canvasSize = 0.8;
canvas.height = window.innerHeight * canvasSize;
canvas.width = canvas.height * 3/4;
const ctx = canvas.getContext("2d");
const initialBrickNumPerRow = 6; // Number of bricks per row
const initialBrickColNum = 6; // Number of rows of bricks

let titleFontSize = canvas.width * 0.025;
ctx.font = "bold " + titleFontSize + "px Arial Black";
ctx.fillStyle = "#2F2219";
const lineHeight = canvas.height * 0.02;

// Disable image smoothing for crisp pixel art
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

const bricks = generateBrickField(initialBrickNumPerRow, initialBrickColNum);

let mouse = { x: 0, y: 0, hoveringIndex: -1 };

let selector1 = { index: 0 }; // WASD keys control this
let selector2 = { index: 1 }; // Arrow keys control this

class Characters {
    constructor(name, rows, columns, frameRate, reverse = false, totalFrames = 0, frameWidth = 32, frameHeight = 32) {
        this.name = name;
        this.imagePath = "images/" + name + ".png";
        this.reverseImagePath = "images/" + name + "Reversed.png";
        this.rows = rows;
        this.columns = columns;
        this.frameRate = frameRate;
        this.totalFrames = totalFrames || rows * columns;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        this.image = new Image();
        this.image.src = reverse ? this.reverseImagePath : this.imagePath;

        // Animator internal state
        this.currentFrame = 0;
        this.elapsedTime = 0;

        // Bounding box cache
        this.boundingBoxes = [];
        this.boundingBoxesCalculated = false;
    }

    // Calculate bounding boxes for all frames and find maximum dimensions
    calculateBoundingBoxes() {
        if (this.boundingBoxesCalculated) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.frameWidth;
        tempCanvas.height = this.frameHeight;
        const tempCtx = tempCanvas.getContext('2d');

        // Disable image smoothing for crisp pixel art
        tempCtx.imageSmoothingEnabled = false;

        let maxWidth = 0;
        let maxHeight = 0;

        for (let frame = 0; frame < this.totalFrames; frame++) {
            const frameX = frame % this.columns;
            const frameY = Math.floor(frame / this.columns);

            // Clear and draw the current frame
            tempCtx.clearRect(0, 0, this.frameWidth, this.frameHeight);
            tempCtx.drawImage(
                this.image,
                frameX * this.frameWidth,
                frameY * this.frameHeight,
                this.frameWidth,
                this.frameHeight,
                0,
                0,
                this.frameWidth,
                this.frameHeight
            );

            // Get image data and find bounding box
            const imageData = tempCtx.getImageData(0, 0, this.frameWidth, this.frameHeight);
            const data = imageData.data;

            let minX = this.frameWidth;
            let minY = this.frameHeight;
            let maxX = 0;
            let maxY = 0;

            // Scan for opaque pixels
            for (let y = 0; y < this.frameHeight; y++) {
                for (let x = 0; x < this.frameWidth; x++) {
                    const index = (y * this.frameWidth + x) * 4;
                    const alpha = data[index + 3];

                    if (alpha > 0) { // If pixel is not fully transparent
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            // Store bounding box (handle case where no opaque pixels found)
            if (minX <= maxX && minY <= maxY) {
                const width = maxX - minX + 1;
                const height = maxY - minY + 1;
                this.boundingBoxes[frame] = {
                    x: minX,
                    y: minY,
                    width: width,
                    height: height
                };
                // Track maximum dimensions across all frames
                maxWidth = Math.max(maxWidth, width);
                maxHeight = Math.max(maxHeight, height);
            } else {
                // Fallback to full frame if no opaque pixels found
                this.boundingBoxes[frame] = {
                    x: 0,
                    y: 0,
                    width: this.frameWidth,
                    height: this.frameHeight
                };
                maxWidth = Math.max(maxWidth, this.frameWidth);
                maxHeight = Math.max(maxHeight, this.frameHeight);
            }
        }

        // Store maximum dimensions for consistent scaling
        this.maxBoundingWidth = maxWidth;
        this.maxBoundingHeight = maxHeight;
        this.boundingBoxesCalculated = true;
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;
        if (this.elapsedTime > 1000 / this.frameRate) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.elapsedTime = 0;
        }
    }

    draw(ctx, x, y, targetHeight) {
        // Calculate bounding boxes if not done yet
        if (!this.boundingBoxesCalculated) {
            this.calculateBoundingBoxes();
        }

        const frameX = this.currentFrame % this.columns;
        const frameY = Math.floor(this.currentFrame / this.columns);

        // Scale based on the maximum bounding box height for consistent sizing
        const scale = targetHeight / this.maxBoundingHeight;

        // Always draw the full frame, but scale it consistently
        // Use the bottom of the frame as the anchor point
        const scaledFrameWidth = this.frameWidth * scale;
        const scaledFrameHeight = this.frameHeight * scale;

        // Position so the bottom of the frame aligns with the y parameter
        const drawX = x - scaledFrameWidth / 2; // Center horizontally
        const drawY = y - scaledFrameHeight;    // Anchor to bottom

        ctx.drawImage(
            this.image,
            frameX * this.frameWidth,           // Source x (full frame)
            frameY * this.frameHeight,          // Source y (full frame)
            this.frameWidth,                    // Source width (full frame)
            this.frameHeight,                   // Source height (full frame)
            drawX,                              // Destination x
            drawY,                              // Destination y
            scaledFrameWidth,                   // Destination width (scaled)
            scaledFrameHeight                   // Destination height (scaled)
        );
    }
}

const characterList = [
    new Characters("Nephi", 4, 3, 10, false, 11),
    new Characters("Moroni", 3, 3, 12),
    new Characters("Teancum", 4, 3, 18),
    new Characters("Amalackiah", 5, 5, 12)
];

const reverseCharacterList = [
    new Characters("Nephi", 4, 3, 10, true, 11),
    new Characters("Moroni", 3, 3, 12, true),
    new Characters("Teancum", 4, 3, 18, true),
    new Characters("Amalackiah", 5, 5, 12, true)
];

const characterBrickList = [
    new Characters("NephiBrick", 4, 3, 10, false, 10),
    new Characters("MoroniBrick", 3, 3, 12),
    new Characters("TeancumBrick", 4, 3, 18),
    new Characters("AmalackiahBrick", 5, 5, 12)
];

const characterDescriptions = {
    "Nephi": {
        backstory: "Nephi slew the tyrant Laban with Laban's own sword, and made a bow and arrow out of sticks to keep his family from starvation. God gave him a vision of the whole history and future of the world. His people made him king, and their kings after him were called Nephi in his honor.",
        powerDescription: "Two of Nephi's brothers were always trying to kill him, so when Nephi is ganged up against, his skill as a mimic comes out, making a phantom paddle that copies his opponent's moves."
    },
    "Moroni": {
        backstory: "Moroni was the greatest Nephite general. When the republic was nearly overthrown by a monarchist coup, and Amalackiah had pressed to the center of the Nephite nation, Moroni's strategies won cities back with minimal loss of life.",
        powerDescription: "Moroni directed the building of insurmountable fortifications, even using prisoners of war to build them. When Moroni's ball first passes his first row, the row regenerates, and again when the opponenet's ball enters his side."
    },
    "Teancum": {
        backstory: "Teancum was a general who trained the strongest, fastest and most skilled soldiers. He lured armies out of fortified cities with a small force, then skirted them in the night and captured the city. Twice, he scaled a city wall at night, crept into the tent of the king, and killed him with a javelin.",
        powerDescription: "King Amalackiah died without a hitch, but he was so angry at the second king for perpetuating the war that he threw the javelin, missing the king's heart, alerting the guards, resulting in Teancum's death. The up arrow has a 50% chance of stunning the opponent paddle up close."
    },
    "Amalackiah": {
        backstory: "Amalackiah inspired a coup, was defeated, then fled to the Lamanites. There, he flattered the king, became the Lamanite general, then murdered the king secretly and married his widow. He inspired the Lamanites to war against the Nephites, capturing many cities before his assassination.",
        powerDescription: "During Amalackiah's rise to power, he seduced Nephite political leaders, the Lamanite king, the Lamanite general, and countless soldiers, to go to war for him, most of whom died as a result. When his ball touches the opponent's, they both reorient towards Amalackiah's opponent."
    }
}

let lastTime = 0;

function allImagesLoaded(callback) {
    const all = [...characterList, ...reverseCharacterList, ...characterBrickList];
    let loaded = 0;
    all.forEach(c => {
        c.image.onload = () => {
            loaded++;
            if (loaded === all.length) {
                // Calculate bounding boxes for all characters after images load
                all.forEach(char => char.calculateBoundingBoxes());
                callback();
            }
        };
    });
}

allImagesLoaded(() => {
    requestAnimationFrame(gameLoop);
});

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

document.addEventListener("keydown", (e) => {
    const cols = 6; // columns in brick field
    const rows = 6;
    const total = bricks.length;

    function moveSelector(selector, direction) {
        let index = selector.index;
        switch (direction) {
            case "left":
                if (index % cols > 0) selector.index -= 1;
                break;
            case "right":
                if (index % cols < cols - 1) selector.index += 1;
                break;
            case "up":
                if (index - cols >= 0) selector.index -= cols;
                break;
            case "down":
                if (index + cols < total) selector.index += cols;
                break;
        }
    }

    switch (e.key.toLowerCase()) {
        // Player 1 (WASD)
        case "a": moveSelector(selector1, "left"); break;
        case "d": moveSelector(selector1, "right"); break;
        case "w": moveSelector(selector1, "up"); break;
        case "s": moveSelector(selector1, "down"); break;

        // Player 2 (Arrow Keys)
        case "arrowleft": moveSelector(selector2, "left"); break;
        case "arrowright": moveSelector(selector2, "right"); break;
        case "arrowup": moveSelector(selector2, "up"); break;
        case "arrowdown": moveSelector(selector2, "down"); break;

        // Enter key to continue
        case "enter":
            if (selector1.index <= characterList.length && selector2.index <= reverseCharacterList.length) {
                // Proceed with the selected characters
                let baseUrl = "twoPlayer.html";
                let character1 = characterList[selector1.index].name;
                let character2 = characterList[selector2.index].name;

                let fullUrl = `${baseUrl}?p1=${encodeURIComponent(character1)}&p2=${encodeURIComponent(character2)}`;
                window.location.href = fullUrl;
            }
    }
});


function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks(ctx, canvas, bricks, 6, 6);

    ctx.fillText("Press Enter to continue", canvas.width * 0.659, canvas.height * 0.65);

    // Draw Player 2's character
    if (selector1.index < characterList.length) { 
        characterList[selector1.index].update(deltaTime);
        characterList[selector1.index].draw(ctx, canvas.width / 1.2, 1 + canvas.height / 2 - 8.5 * canvas.width / 48, canvas.height / 4);

        // Draw character description
        const charDescriptions = characterDescriptions[characterList[selector1.index].name];
        const charDescription = charDescriptions.backstory + ' ' + charDescriptions.powerDescription;

        titleFontSize *= 5; // Adjust title font size based on canvas width
        ctx.font = "bold " + titleFontSize + "px Arial Black";
        ctx.fillText(characterList[selector1.index].name, canvas.width * 0.001, canvas.height * 0.08);

        titleFontSize *= 0.2; // Reset to smaller size for description
        ctx.font = "bold " + titleFontSize + "px Arial Black";

        wrapText(ctx, charDescription, canvas.width * 0.01, canvas.height * 0.11, canvas.width * 0.68, lineHeight);
    }

    // Draw Player 1's character
    if (selector2.index < reverseCharacterList.length) {
        reverseCharacterList[selector2.index].update(deltaTime);
        reverseCharacterList[selector2.index].draw(ctx, canvas.width / 6, canvas.height / 1, canvas.height / 4, true);

        // Draw character description
        const charDescriptions = characterDescriptions[reverseCharacterList[selector2.index].name];
        const charDescription = charDescriptions.backstory + ' ' + charDescriptions.powerDescription;

        titleFontSize *= 5; // Adjust title font size based on canvas width
        ctx.font = "bold " + titleFontSize + "px Arial Black";
        ctx.fillText(reverseCharacterList[selector2.index].name, canvas.width * 0.001, canvas.height * 0.72);

        titleFontSize *= 0.2; // Reset to smaller size for description
        ctx.font = "bold " + titleFontSize + "px Arial Black";

        wrapText(ctx, charDescription, canvas.width * 0.33, canvas.height * 0.75, canvas.width * 0.68, lineHeight);
    }

    // characterList.forEach((char, index) => {
    //     char.update(deltaTime);
    //     char.draw(ctx, 100 + index * 80, 200, 200);
    // });

    requestAnimationFrame(gameLoop);
}

function generateBrickField(brickNumPerRow, brickColNum) {
    const bricks = [];
    for (var i = 0; i < brickNumPerRow * brickColNum; i++) {
        bricks[i] = {x: 0, y: 0};
    }
    return bricks;
}

function drawBricks(ctx, canvas, bricks, brickNumPerRow, brickColNum, characters = characterBrickList) {
    let gapsBetweenBricks = brickNumPerRow + 1;
    let mortar = canvas.width / 48; // The mortar is the distance between bricks, equal to half the size of a brick.

    let brickWidth = mortar * (48 - gapsBetweenBricks) / brickNumPerRow;
    let brickHeight = mortar * 2;

    // brickLengths are the height of a brick plus the mortar, so total height can be measured.
    let brickLength = brickHeight + mortar;

    let brickX = mortar;
    let brickY = canvas.height / 2 - (brickLength * brickColNum / 2) + mortar / 2; // Half the mortar is added to center the bricks vertically.
    let totalBricks = brickNumPerRow * brickColNum;

    for (var i = 0; i < totalBricks; i++) {
        bricks[i].brickX = brickX;
        bricks[i].brickY = brickY;

        if (i % brickNumPerRow == 0 && i != 0) {
            brickY += brickHeight + mortar;
            brickX = mortar;
        }

        // --- Mouse hover detection ---
        if (
            mouse.x >= brickX && mouse.x <= brickX + brickWidth &&
            mouse.y >= brickY && mouse.y <= brickY + brickHeight
        ) {
            mouse.hoveringIndex = i;

            // Optional: Highlight brick
            ctx.fillStyle = "#443322"; // darker highlight
        } else {
            ctx.fillStyle = "#2F2219";
        }

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fill();
        ctx.closePath();

        // Draw selector1 highlight
        if (i === selector1.index) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
        }

        // Draw selector2 highlight
        if (i === selector2.index) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(brickX + 2, brickY + 2, brickWidth - 4, brickHeight - 4); // slightly inset
        }

        // This logic can replace the following code, and it will divide the character selection page into two.
        // var fieldCenterIndex = 0 - bricks.length / 2 + i;
        // if ((i < characters.length) || (fieldCenterIndex < characters.length && fieldCenterIndex >= 0)) {
        //     const characterIndex = (i < characters.length) ? i : fieldCenterIndex;
        //     const char = characters[characterIndex];
        //     const bbox = char.boundingBoxes[char.currentFrame];

        // Only draw characters on the first 4 bricks
        if (i < characters.length) {
            const characterIndex = i;
            const char = characters[characterIndex];
            const bbox = char.boundingBoxes[char.currentFrame];

            // Use maximum dimensions for consistent scaling
            const scale = brickHeight / char.maxBoundingHeight;
            const scaledWidth = bbox.width * scale;

            // Check if character extends beyond brick boundaries and crop if needed
            let drawWidth = scaledWidth;
            let sourceWidth = bbox.width;
            let sourceX = bbox.x;

            if (scaledWidth > brickWidth) {
                // Character is wider than brick, crop from both sides
                drawWidth = brickWidth;
                const cropRatio = brickWidth / scaledWidth;
                sourceWidth = bbox.width * cropRatio;
                sourceX = bbox.x + (bbox.width - sourceWidth) / 2; // Center the crop
            }

            // Center the character horizontally within the brick
            const drawX = brickX + (brickWidth - drawWidth) / 2;
            const drawY = brickY;

            const frameX = char.currentFrame % char.columns;
            const frameY = Math.floor(char.currentFrame / char.columns);

            ctx.drawImage(
                char.image,
                frameX * char.frameWidth + sourceX,     // Source x (potentially cropped)
                frameY * char.frameHeight + bbox.y,     // Source y
                sourceWidth,                            // Source width (potentially cropped)
                bbox.height,                            // Source height
                drawX,                                  // Destination x
                drawY,                                  // Destination y
                drawWidth,                              // Destination width (potentially cropped)
                bbox.height * scale                     // Destination height
            );
        }

        brickX += brickWidth + mortar;
    }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && i > 0) {
            if (line[0] == ' ') {
                line = line.slice(1); // Remove leading space if it exists
            }
            ctx.fillText(line, x, y);
            line = words[i] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }

    ctx.fillText(line, x, y); // Draw remaining text
}